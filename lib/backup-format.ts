import {z} from 'zod';
import {isOfficialImage, isSaleSource, productSchema, validateProduct, type Product} from './domain.ts';

export const MAX_PHOTO_BYTES = 8 * 1024 * 1024;
export const MAX_BACKUP_BYTES = 256 * 1024 * 1024;
export const BACKUP_FORMAT = 'jellyshelf-backup';
export const BACKUP_VERSION = 1;
const safeId = /^[A-Za-z0-9][A-Za-z0-9._-]{0,99}$/;
const localPhoto = /^\/api\/photos\/([A-Za-z0-9][A-Za-z0-9._-]{0,99})$/;
const supportedTypes = ['image/jpeg', 'image/png', 'image/webp'] as const;
export type PhotoMime = typeof supportedTypes[number];
export type StoredPhoto = {id: string; blob: Blob; createdAt: string; sha256: string};
export type EncodedPhoto = {id: string; mime: PhotoMime; base64: string; createdAt: string};
export type BackupDocument = {
  format: typeof BACKUP_FORMAT;
  version: typeof BACKUP_VERSION;
  createdAt: string;
  products: Product[];
  photos: EncodedPhoto[];
};
export type ParsedBackup = {createdAt: string; products: Product[]; photos: StoredPhoto[]};
export class FormatError extends Error {}

function safeHttps(value: string): URL | null {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password && !url.port ? url : null;
  } catch { return null; }
}

export function photoId(value: string): string | null { return localPhoto.exec(value)?.[1] ?? null; }
export function isTrustedPhoto(value: string): boolean {
  const url = safeHttps(value);
  if (!url || !isOfficialImage(value)) return false;
  try { return /\.(jpe?g|png|webp)$/i.test(decodeURIComponent(url.pathname)); } catch { return false; }
}
function isTrustedSource(value: string): boolean {
  const url = safeHttps(value);
  if (!url) return false;
  return ['jellycat.com', 'ebay.com', 'whatnot.com'].some(host => url.hostname === host || url.hostname.endsWith('.' + host)) || url.hostname === 'usjellycat.zendesk.com';
}

/** All entry points share this check; backup import never bypasses normal catalog validation. */
export function checkedProduct(value: unknown): Product {
  const errors = validateProduct(value);
  if (errors.length) throw new FormatError(errors.join('；'));
  const p = productSchema.parse(value);
  if (!safeId.test(p.id)) throw new FormatError('商品编号格式无效。');
  if (p.photos.some(src => !photoId(src) && !isTrustedPhoto(src))) throw new FormatError('照片必须是本机上传图片，或 Jellycat 官方 JPG、PNG、WebP 图片。');
  if ([p.sourceUrl, ...p.variants.map(v => v.sourceUrl)].some(url => url && !isTrustedSource(url))) {
    throw new FormatError('资料来源请使用 Jellycat、eBay 或 Whatnot 的安全 https 链接。');
  }
  if (new Set(p.sales.map(s => s.id)).size !== p.sales.length) throw new FormatError('成交记录编号重复。');
  if (p.sales.some(s => !safeHttps(s.url) || !isSaleSource(s.url, s.platform))) throw new FormatError('成交来源链接无效。');
  for (const sale of p.sales) {
    const date = new Date(sale.soldAt + 'T00:00:00Z');
    if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== sale.soldAt) throw new FormatError('成交日期不是有效的日历日期。');
  }
  if (p.updatedAt && !Number.isFinite(Date.parse(p.updatedAt))) throw new FormatError('商品更新时间无效。');
  return p;
}

export function detectedMime(bytes: Uint8Array): PhotoMime | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'image/jpeg';
  const png = [137,80,78,71,13,10,26,10];
  if (bytes.length >= 24 && png.every((b, i) => bytes[i] === b) && String.fromCharCode(...bytes.slice(12,16)) === 'IHDR') return 'image/png';
  if (bytes.length >= 16 && String.fromCharCode(...bytes.slice(0,4)) === 'RIFF' && String.fromCharCode(...bytes.slice(8,12)) === 'WEBP' && ['VP8 ', 'VP8L', 'VP8X'].includes(String.fromCharCode(...bytes.slice(12,16)))) return 'image/webp';
  return null;
}

export async function checkedPhoto(id: string, blob: Blob, createdAt: string): Promise<StoredPhoto> {
  if (!safeId.test(id)) throw new FormatError('照片编号格式无效。');
  if (!blob.size || blob.size > MAX_PHOTO_BYTES) throw new FormatError('每张照片须为 8 MB 以内的非空图片。');
  const bytes = new Uint8Array(await blob.arrayBuffer());
  const mime = detectedMime(bytes);
  if (!mime || mime !== blob.type) throw new FormatError('照片内容与格式不符，仅接受 JPG、PNG 或 WebP。');
  const hash = await crypto.subtle.digest('SHA-256', bytes);
  const sha256 = Array.from(new Uint8Array(hash), b => b.toString(16).padStart(2, '0')).join('');
  return {id, blob, createdAt, sha256};
}

export function toBase64(bytes: Uint8Array): string {
  const chunks: string[] = [];
  for (let i = 0; i < bytes.length; i += 32768) chunks.push(String.fromCharCode(...bytes.subarray(i, i + 32768)));
  return btoa(chunks.join(''));
}
function fromBase64(value: string): Uint8Array<ArrayBuffer> {
  // Avoid repeated capture/group matching: megabyte-sized base64 can exhaust the JS regexp stack.
  if (!value || value.length % 4 !== 0 || value.length > Math.ceil(MAX_PHOTO_BYTES / 3) * 4 || !/^[A-Za-z0-9+/]*={0,2}$/.test(value)) throw new FormatError('备份中的照片编码无效或过大。');
  let decoded: string;
  try { decoded = atob(value); } catch { throw new FormatError('备份中的照片编码无效。'); }
  return Uint8Array.from(decoded, c => c.charCodeAt(0));
}

const documentSchema = z.object({
  format: z.literal(BACKUP_FORMAT), version: z.literal(BACKUP_VERSION),
  createdAt: z.string().datetime({offset: true}),
  products: z.array(z.unknown()).max(10000),
  photos: z.array(z.object({
    id: z.string().regex(safeId), mime: z.enum(supportedTypes),
    base64: z.string().max(Math.ceil(MAX_PHOTO_BYTES / 3) * 4),
    createdAt: z.string().datetime({offset: true}),
  }).strict()).max(20000),
}).strict();

export async function parseBackup(file: Blob): Promise<ParsedBackup> {
  if (!file.size || file.size > MAX_BACKUP_BYTES) throw new FormatError('请选择 256 MB 以内的 JellyShelf 完整 JSON 备份。');
  let raw: unknown;
  try { raw = JSON.parse(await file.text()); } catch { throw new FormatError('备份不是有效的 JSON 文件。'); }
  const parsed = documentSchema.safeParse(raw);
  if (!parsed.success) throw new FormatError('备份版本或结构无效，请选择 JellyShelf 导出的完整备份。');
  const data = parsed.data;
  const products = data.products.map(checkedProduct);
  if (new Set(products.map(p => p.id)).size !== products.length) throw new FormatError('备份包含重复商品编号。');
  const photoIds = new Set(data.photos.map(p => p.id));
  if (photoIds.size !== data.photos.length) throw new FormatError('备份包含重复照片编号。');
  for (const p of products) for (const src of p.photos) {
    const id = photoId(src);
    if (id && !photoIds.has(id)) throw new FormatError('备份缺少商品引用的照片，未导入任何资料。');
  }
  const photos: StoredPhoto[] = [];
  for (const photo of data.photos) {
    const bytes = fromBase64(photo.base64);
    photos.push(await checkedPhoto(photo.id, new Blob([bytes], {type: photo.mime}), photo.createdAt));
  }
  return {createdAt: data.createdAt, products, photos};
}
