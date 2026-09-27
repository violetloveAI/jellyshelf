import {references} from './reference-products.ts';
import type {Product} from './domain.ts';
import {
  BACKUP_FORMAT, BACKUP_VERSION, MAX_BACKUP_BYTES, MAX_PHOTO_BYTES,
  FormatError, checkedPhoto, checkedProduct, isTrustedPhoto, parseBackup, photoId, toBase64,
  type BackupDocument, type ParsedBackup, type PhotoMime, type StoredPhoto,
} from './backup-format.ts';

export const CATALOG_DB_NAME = 'jellyshelf-local-v1';
export type BackupPreview = Readonly<{
  version: 1; createdAt: string; filename: string;
  counts: Readonly<{products: number; photos: number}>;
  productNames: readonly string[];
}>;
const inspected = new WeakMap<BackupPreview, ParsedBackup>();
const objectUrls = new Map<string, string>();
class CatalogError extends Error {
  status: number;
  constructor(message: string, status = 400) { super(message); this.status = status; }
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') { reject(new CatalogError('此浏览器无法使用本机资料库，请使用普通浏览模式并允许网站储存数据。', 503)); return; }
    const request = indexedDB.open(CATALOG_DB_NAME, 1);
    let blocked = false;
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('products')) db.createObjectStore('products', {keyPath: 'id'});
      if (!db.objectStoreNames.contains('photos')) db.createObjectStore('photos', {keyPath: 'id'});
    };
    request.onerror = () => reject(request.error ?? new Error('无法打开本机资料库。'));
    request.onblocked = () => { blocked = true; reject(new CatalogError('请关闭此网站的其他旧页面后重试。', 503)); };
    request.onsuccess = () => {
      if (blocked) { request.result.close(); return; }
      request.result.onversionchange = () => request.result.close();
      resolve(request.result);
    };
  });
}

type TransactionTools<T> = {
  store: (name: 'products' | 'photos') => IDBObjectStore;
  result: (value: T) => void;
  fail: (error: unknown) => void;
  read: <V>(request: IDBRequest<V>, callback: (value: V) => void) => void;
};
/** Callback chaining keeps Safari transactions active; resolve only after the commit succeeds. */
async function transaction<T>(stores: ('products' | 'photos')[], mode: IDBTransactionMode, work: (tools: TransactionTools<T>) => void): Promise<T> {
  const db = await openDatabase();
  return new Promise<T>((resolve, reject) => {
    let tx: IDBTransaction;
    try { tx = db.transaction(stores, mode); } catch (e) { db.close(); reject(e); return; }
    let value: T;
    let failure: unknown;
    const fail = (error: unknown) => {
      failure = error;
      try { tx.abort(); } catch { db.close(); reject(error); }
    };
    tx.oncomplete = () => { db.close(); resolve(value!); };
    tx.onabort = () => { db.close(); reject(failure ?? tx.error ?? new Error('本机资料写入未完成。')); };
    try {
      work({
        store: name => tx.objectStore(name), result: next => { value = next; }, fail,
        read: (request, callback) => { request.onsuccess = () => { try { callback(request.result); } catch (error) { fail(error); } }; },
      });
    } catch (error) { fail(error); }
  });
}

function json(value: unknown, status = 200): Response {
  return Response.json(value, {status, headers: {'Cache-Control': 'no-store'}});
}
function userError(error: unknown): string {
  if (error instanceof DOMException && error.name === 'QuotaExceededError') return '本机储存空间不足，资料未保存。请先导出备份并释放设备空间，再重试。';
  if (error instanceof CatalogError || error instanceof FormatError) return error.message;
  return '本机资料操作未完成。请保留当前输入并重试；若浏览器限制储存，请使用普通浏览模式。';
}
async function bodyJson(init: RequestInit): Promise<unknown> {
  if (typeof init.body !== 'string' || init.body.length > 1_500_000) throw new CatalogError('资料格式无效或过大。');
  try { return JSON.parse(init.body); } catch { throw new CatalogError('资料不是有效的 JSON。'); }
}
function linkedPhotosExist(p: Product, tools: TransactionTools<Product>, done: () => void) {
  const ids = [...new Set(p.photos.map(photoId).filter((id): id is string => id !== null))];
  if (!ids.length) { done(); return; }
  let remaining = ids.length;
  for (const id of ids) tools.read<StoredPhoto | undefined>(tools.store('photos').get(id), photo => {
    if (!photo) { tools.fail(new CatalogError('商品引用的本机照片不存在，请重新上传。')); return; }
    if (--remaining === 0) done();
  });
}

/** Fetch-compatible adapter. No route in this function sends data over the network. */
export async function catalogRequest(path: string, init: RequestInit = {}): Promise<Response> {
  try {
    const url = new URL(path, 'https://jellyshelf.local');
    if (!path.startsWith('/') || url.origin !== 'https://jellyshelf.local') throw new CatalogError('只支持本机资料库操作。');
    const method = (init.method ?? 'GET').toUpperCase();
    if (url.pathname === '/api/products' && method === 'GET') {
      const products = await transaction<Product[]>(['products'], 'readonly', t => t.read<Product[]>(t.store('products').getAll(), t.result));
      products.sort((a, b) => (b.updatedAt ?? '').localeCompare(a.updatedAt ?? ''));
      return json({products});
    }
    if (url.pathname === '/api/products' && method === 'POST') {
      const p = checkedProduct(await bodyJson(init));
      const product: Product = {...p, revision: 1, updatedAt: new Date().toISOString()};
      await transaction<Product>(['products', 'photos'], 'readwrite', t => {
        t.read<Product | undefined>(t.store('products').get(p.id), existing => {
          if (existing) { t.fail(new CatalogError('这条商品已保存，请刷新后编辑。', 409)); return; }
          linkedPhotosExist(product, t, () => { t.store('products').add(product); t.result(product); });
        });
      });
      return json({product}, 201);
    }
    const item = /^\/api\/products\/([^/]+)$/.exec(url.pathname);
    if (item && (method === 'PUT' || method === 'DELETE')) {
      const id = decodeURIComponent(item[1]);
      const p = method === 'PUT' ? checkedProduct(await bodyJson(init)) : null;
      const revision = p ? p.revision : Number(url.searchParams.get('revision'));
      if (p && p.id !== id || !Number.isInteger(revision) || !revision || revision < 1) throw new CatalogError('商品版本无效，请刷新后重试。');
      const updated = p ? {...p, revision: revision + 1, updatedAt: new Date().toISOString()} : null;
      await transaction<Product>(['products', 'photos'], 'readwrite', t => {
        t.read<Product | undefined>(t.store('products').get(id), current => {
          if (!current || current.revision !== revision) { t.fail(new CatalogError('其他页面已更新或删除此商品。请先保留修改，刷新后重新编辑。', 409)); return; }
          if (updated) linkedPhotosExist(updated, t, () => { t.store('products').put(updated); t.result(updated); });
          else { t.store('products').delete(id); t.result(current); }
        });
      });
      return updated ? json({product: updated}) : json({ok: true});
    }
    if (url.pathname === '/api/photos' && method === 'POST') {
      if (!(init.body instanceof FormData)) throw new CatalogError('请选择照片。');
      const file = init.body.get('file');
      if (!(file instanceof Blob)) throw new CatalogError('请选择照片。');
      if (file.size > MAX_PHOTO_BYTES) throw new CatalogError('单张照片不能超过 8 MB。', 413);
      const photo = await checkedPhoto(crypto.randomUUID(), file, new Date().toISOString());
      await transaction<string>(['photos'], 'readwrite', t => { t.store('photos').add(photo); t.result(photo.id); });
      return json({url: '/api/photos/' + photo.id}, 201);
    }
    if (url.pathname === '/api/samples' && method === 'GET') return json(references);
    if (url.pathname === '/api/lookup' && method === 'POST') {
      const body = await bodyJson(init);
      const query = typeof body === 'object' && body && 'query' in body ? String(body.query).trim() : '';
      if (!query || query.length > 500) throw new CatalogError('请输入 500 字以内的品名或官方货号。');
      const term = query.normalize('NFKC').toLowerCase();
      const candidates = references.filter(p => [p.nameEn, p.nameZh, ...p.variants.map(v => v.sku)].some(s => s.normalize('NFKC').toLowerCase().includes(term)));
      return json({candidates, notice: candidates.length ? '匹配到随网站附带的官方参考样例（2026-09-27 核实）。当前不支持全网抓取，请确认后保存；未知资料留白。' : '当前仅能查找随网站附带的四款官方样例，不支持全网自动抓取。请在官网核对后手动录入。'});
    }
    return json({error: '没有找到此本机资料操作。'}, 404);
  } catch (error) {
    const status = error instanceof CatalogError ? error.status : error instanceof FormatError ? 400 : 503;
    return json({error: userError(error)}, status);
  }
}

export async function resolvePhoto(src: string): Promise<string> {
  if (isTrustedPhoto(src)) return src;
  const id = photoId(src);
  if (!id) throw new FormatError('照片地址不受支持。');
  const photo = await transaction<StoredPhoto | undefined>(['photos'], 'readonly', t => t.read(t.store('photos').get(id), t.result));
  if (!photo) throw new FormatError('本机照片不存在，请从完整备份恢复或重新上传。');
  const key = id + ':' + photo.sha256;
  let url = objectUrls.get(key);
  if (!url) { url = URL.createObjectURL(photo.blob); objectUrls.set(key, url); }
  return url;
}

export async function exportBackup(): Promise<Blob> {
  const snapshot = await transaction<{products: Product[]; photos: StoredPhoto[]}>(['products', 'photos'], 'readonly', t => {
    let products: Product[] | undefined; let photos: StoredPhoto[] | undefined;
    const done = () => { if (products && photos) t.result({products, photos}); };
    t.read<Product[]>(t.store('products').getAll(), value => { products = value; done(); });
    t.read<StoredPhoto[]>(t.store('photos').getAll(), value => { photos = value; done(); });
  });
  const data: BackupDocument = {format: BACKUP_FORMAT, version: BACKUP_VERSION, createdAt: new Date().toISOString(), products: snapshot.products.map(checkedProduct), photos: []};
  const referencedIds = new Set(data.products.flatMap(p => p.photos.map(photoId).filter((id): id is string => id !== null)));
  const ids = new Set(snapshot.photos.map(p => p.id));
  if ([...referencedIds].some(id => !ids.has(id))) throw new FormatError('资料库中有缺失的照片，请先重新上传，避免生成不完整备份。');
  let estimated = JSON.stringify({...data, photos: []}).length;
  for (const p of snapshot.photos) {
    // Draft uploads may belong to another open tab; omit them without deleting them.
    if (!referencedIds.has(p.id)) continue;
    estimated += Math.ceil(p.blob.size / 3) * 4 + 300;
    if (estimated > MAX_BACKUP_BYTES) throw new FormatError('完整备份超过 256 MB，无法在当前浏览器中安全生成。请先保留现有资料，不要清除浏览器数据。');
    const checked = await checkedPhoto(p.id, p.blob, p.createdAt);
    data.photos.push({id: p.id, mime: checked.blob.type as PhotoMime, createdAt: p.createdAt, base64: toBase64(new Uint8Array(await p.blob.arrayBuffer()))});
  }
  const blob = new Blob([JSON.stringify(data)], {type: 'application/json;charset=utf-8'});
  if (blob.size > MAX_BACKUP_BYTES) throw new FormatError('完整备份超过 256 MB，未生成截断文件。');
  return blob;
}

export async function inspectBackup(file: File): Promise<BackupPreview> {
  const parsed = await parseBackup(file);
  const preview: BackupPreview = Object.freeze({
    version: 1, filename: file.name, createdAt: parsed.createdAt,
    counts: Object.freeze({products: parsed.products.length, photos: parsed.photos.length}),
    productNames: Object.freeze(parsed.products.map(p => p.nameZh || p.nameEn)),
  });
  inspected.set(preview, parsed);
  return preview;
}

export async function importBackup(preview: BackupPreview): Promise<{added: number; skipped: number}> {
  const data = inspected.get(preview);
  if (!data) throw new FormatError('备份预览已失效，请重新选择文件并检查。');
  try {
    return await transaction<{added: number; skipped: number}>(['products', 'photos'], 'readwrite', t => {
      let productIds: IDBValidKey[] | undefined; let existingPhotos: StoredPhoto[] | undefined;
      const merge = () => {
        if (!productIds || !existingPhotos) return;
        const existingIds = new Set(productIds);
        const additions = data.products.filter(p => !existingIds.has(p.id));
        const incomingReferences = new Set(additions.flatMap(p => p.photos.map(photoId).filter((id): id is string => id !== null)));
        const photoMap = new Map(existingPhotos.map(p => [p.id, p]));
        for (const photo of data.photos) {
          const existing = photoMap.get(photo.id);
          if (existing && existing.sha256 !== photo.sha256 && incomingReferences.has(photo.id)) {
            t.fail(new FormatError('备份中的照片编号与本机照片内容冲突，未导入任何资料。')); return;
          }
        }
        for (const photo of data.photos) if (!photoMap.has(photo.id)) t.store('photos').add(photo);
        for (const p of additions) t.store('products').add({...p, revision: Math.max(1, p.revision ?? 1), updatedAt: p.updatedAt || data.createdAt});
        t.result({added: additions.length, skipped: data.products.length - additions.length});
      };
      t.read<IDBValidKey[]>(t.store('products').getAllKeys(), value => { productIds = value; merge(); });
      t.read<StoredPhoto[]>(t.store('photos').getAll(), value => { existingPhotos = value; merge(); });
    });
  } catch (error) {
    if (error instanceof FormatError) throw error;
    throw new Error(userError(error));
  }
}
