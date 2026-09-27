import {beforeEach, test} from 'node:test';
import assert from 'node:assert/strict';
import {IDBFactory, IDBObjectStore} from 'fake-indexeddb';
import {blankProduct, type Product} from '../lib/domain.ts';
import {CATALOG_DB_NAME, catalogRequest, exportBackup, inspectBackup, importBackup, resolvePhoto} from '../lib/local-catalog.ts';

const png = Uint8Array.from(Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aM1kAAAAASUVORK5CYII=', 'base64'));
beforeEach(() => { globalThis.indexedDB = new IDBFactory(); });
function product(name = '我的兔子'): Product { return {...blankProduct(), nameZh: name}; }
function request(path: string, method: string, data?: unknown) {
  return catalogRequest(path, {method, headers: {'Content-Type':'application/json'}, ...(data === undefined ? {} : {body: JSON.stringify(data)})});
}
async function all(): Promise<Product[]> { return (await (await catalogRequest('/api/products')).json()).products; }
async function add(p = product()): Promise<Product> {
  const response = await request('/api/products', 'POST', p);
  assert.equal(response.status, 201);
  return (await response.json()).product;
}
async function upload(bytes = png, type = 'image/png'): Promise<Response> {
  const form = new FormData(); form.set('file', new File([bytes], 'photo.png', {type}));
  return catalogRequest('/api/photos', {method:'POST', body:form});
}
function backupFile(value: unknown) { return new File([JSON.stringify(value)], '备份.json', {type:'application/json'}); }

test('a new browser starts empty; reference samples never become inventory', async () => {
  assert.deepEqual(await all(), []);
  const samples = await (await catalogRequest('/api/samples')).json();
  assert.equal(samples.length, 4);
  assert.deepEqual(await all(), []);
  const lookup = await (await request('/api/lookup', 'POST', {query:'BAS3PWB'})).json();
  assert.equal(lookup.candidates.length, 1);
  const unknown = await (await request('/api/lookup', 'POST', {query:'https://us.jellycat.com/unknown/'})).json();
  assert.equal(unknown.candidates.length, 0);
  assert.match(unknown.notice, /不支持|尚未|不能/);
});

test('product writes use revision compare-and-swap, including simultaneous saves', async () => {
  const saved = await add(); assert.equal(saved.revision, 1);
  const responses = await Promise.all([
    request('/api/products/'+saved.id, 'PUT', {...saved, nameZh:'改名一'}),
    request('/api/products/'+saved.id, 'PUT', {...saved, nameZh:'改名二'}),
  ]);
  assert.deepEqual(responses.map(r=>r.status).sort(), [200,409]);
  assert.equal((await all())[0].revision, 2);
  assert.equal((await request('/api/products','POST',saved)).status,409);
  assert.equal((await catalogRequest('/api/products/'+saved.id+'?revision=1',{method:'DELETE'})).status,409);
  assert.equal((await all()).length,1);
  assert.equal((await catalogRequest('/api/products/'+saved.id+'?revision=2',{method:'DELETE'})).status,200);
  assert.deepEqual(await all(),[]);
});

test('uploaded raster photos survive storage and resolve to the original bytes', async () => {
  const response=await upload(); assert.equal(response.status,201);
  const {url}=await response.json();
  const p=await add({...product(),photos:[url]});
  assert.equal((await all())[0].photos[0],url);
  const resolved=await resolvePhoto(p.photos[0]);
  assert.match(resolved,/^blob:/);
  assert.deepEqual(new Uint8Array(await (await fetch(resolved)).arrayBuffer()),png);
  assert.equal(await resolvePhoto(url),resolved);
  const official='https://cdn11.bigcommerce.com/s-23s5gfmhr7/images/example.jpg';
  assert.equal(await resolvePhoto(official),official);
});

test('rejects spoofed or oversized photos and unsafe or missing photo references', async () => {
  assert.equal((await upload(new TextEncoder().encode('<svg onload="alert(1)"/>'),'image/png')).status,400);
  assert.equal((await upload(png,'image/svg+xml')).status,400);
  assert.equal((await upload(new Uint8Array(8*1024*1024+1))).status,413);
  for(const src of ['/api/photos/missing','javascript:alert(1)','https://evil.example/a.jpg','https://us.jellycat.com/a.svg']){
    assert.equal((await request('/api/products','POST',{...product(),photos:[src]})).status,400,src);
  }
  await assert.rejects(resolvePhoto('javascript:alert(1)'));
  assert.deepEqual(await all(),[]);
});

test('a complete backup round-trips product details and photos without writing during inspection', async () => {
  const {url}=await (await upload()).json(); const original=await add({...product(),photos:[url]});
  const blob=await exportBackup(); const file=new File([blob],'我的资料库.json',{type:blob.type});
  globalThis.indexedDB=new IDBFactory();
  const preview=await inspectBackup(file);
  assert.deepEqual(preview.counts,{products:1,photos:1});
  assert.equal(preview.filename,'我的资料库.json');
  assert.deepEqual(await all(),[]);
  assert.deepEqual(await importBackup(preview),{added:1,skipped:0});
  assert.equal((await all())[0].nameZh,original.nameZh);
  assert.deepEqual(new Uint8Array(await (await fetch(await resolvePhoto(url))).arrayBuffer()),png);
  const edited={...(await all())[0],nameZh:'本机更新后的名字'};
  assert.equal((await request('/api/products/'+edited.id,'PUT',edited)).status,200);
  assert.deepEqual(await importBackup(preview),{added:0,skipped:1});
  assert.equal((await all())[0].nameZh,'本机更新后的名字');
});

test('backups exclude unlinked draft uploads without deleting them from this browser', async () => {
  const {url}=await (await upload()).json();
  const packet=JSON.parse(await (await exportBackup()).text());
  assert.deepEqual(packet.products,[]);
  assert.deepEqual(packet.photos,[]);
  assert.deepEqual(new Uint8Array(await (await fetch(await resolvePhoto(url))).arrayBuffer()),png);
});

test('backups exclude removed photos but retain every photo still shared by saved products', async () => {
  const {url:shared}=await (await upload()).json();
  const {url:removed}=await (await upload()).json();
  const {url:deleted}=await (await upload()).json();
  const official='https://cdn11.bigcommerce.com/s-23s5gfmhr7/images/example.jpg';
  const edited=await add({...product('修改照片'),photos:[shared,removed,official]});
  const discarded=await add({...product('删除商品'),photos:[shared,deleted]});
  await add({...product('保留共享照片'),photos:[shared]});
  assert.equal((await request('/api/products/'+edited.id,'PUT',{...edited,photos:[shared,official]})).status,200);
  assert.equal((await catalogRequest('/api/products/'+discarded.id+'?revision=1',{method:'DELETE'})).status,200);

  const blob=await exportBackup();
  const packet=JSON.parse(await blob.text());
  assert.equal(packet.products.length,2);
  assert.equal(packet.photos.length,1);
  assert.equal('/api/photos/'+packet.photos[0].id,shared);
  assert.equal(packet.photos[0].base64,Buffer.from(png).toString('base64'));
  for(const src of [removed,deleted]) assert.match(await resolvePhoto(src),/^blob:/);

  globalThis.indexedDB=new IDBFactory();
  assert.deepEqual(await importBackup(await inspectBackup(new File([blob],'saved-only.json'))),{added:2,skipped:0});
  assert.deepEqual(new Uint8Array(await (await fetch(await resolvePhoto(shared))).arrayBuffer()),png);
  assert.deepEqual((await all()).find(p=>p.id===edited.id)?.photos,[shared,official]);
  for(const src of [removed,deleted]) await assert.rejects(resolvePhoto(src));
});

test('backups still reject missing photos referenced by saved products', async () => {
  const {url}=await (await upload()).json();
  await add({...product(),photos:[url]});
  // Simulate damaged storage; the public product API prevents creating this state.
  await new Promise<void>((resolve,reject)=>{
    const open=indexedDB.open(CATALOG_DB_NAME,1);
    open.onerror=()=>reject(open.error);
    open.onsuccess=()=>{
      const db=open.result;
      const tx=db.transaction('photos','readwrite');
      tx.objectStore('photos').delete(url.slice('/api/photos/'.length));
      tx.oncomplete=()=>{db.close();resolve();};
      tx.onabort=()=>{db.close();reject(tx.error);};
    };
  });
  await assert.rejects(exportBackup(),/缺失的照片/);
});

test('malformed backups are rejected completely, including unresolved references and active image formats', async () => {
  const p=await add(); const valid=JSON.parse(await (await exportBackup()).text());
  globalThis.indexedDB=new IDBFactory();
  const badPackets=[
    {...valid,version:999},
    {...valid,products:[p,p]},
    {...valid,products:[{...p,photos:['/api/photos/not-in-backup']}]},
    {...valid,products:[{...p,sourceUrl:'javascript:alert(1)'}]},
    {...valid,products:[{...p,photos:['https://us.jellycat.com/image.svg']}]},
    {...valid,photos:[{id:'bad',mime:'image/png',createdAt:new Date().toISOString(),base64:'not-base64'}]},
    {...valid,photos:[{id:'bad',mime:'image/svg+xml',createdAt:new Date().toISOString(),base64:btoa('<svg/>')}]},
  ];
  for(const packet of badPackets)await assert.rejects(inspectBackup(backupFile(packet)));
  assert.deepEqual(await all(),[]);
  const preview=await inspectBackup(backupFile(valid));
  await assert.rejects(importBackup({...preview}));
  assert.deepEqual(await all(),[]);
});

test('a quota failure during import rolls back all product and photo writes', async () => {
  const {url}=await (await upload()).json(); await add({...product('甲'),photos:[url]}); await add(product('乙'));
  const blob=await exportBackup(); globalThis.indexedDB=new IDBFactory();
  const preview=await inspectBackup(new File([blob],'rollback.json'));
  const originalAdd=IDBObjectStore.prototype.add;
  let productWrites=0;
  IDBObjectStore.prototype.add=function(...args: Parameters<IDBObjectStore['add']>){
    if(this.name==='products'&&++productWrites===2)throw new DOMException('Storage full','QuotaExceededError');
    return originalAdd.apply(this,args);
  };
  try{await assert.rejects(importBackup(preview));}finally{IDBObjectStore.prototype.add=originalAdd;}
  assert.deepEqual(await all(),[]);
  await assert.rejects(resolvePhoto(url));
  const after=JSON.parse(await (await exportBackup()).text());
  assert.deepEqual(after.photos,[]);
});

test('newly imported products cannot silently reuse a colliding photo id with different bytes', async () => {
  const {url}=await (await upload()).json(); await add({...product('本机原图'),photos:[url]});
  const packet=JSON.parse(await (await exportBackup()).text());
  packet.products[0].id=crypto.randomUUID(); packet.products[0].nameZh='不同的导入图';
  const bytes=Uint8Array.from(png); bytes[bytes.length-1]^=1;
  packet.photos[0].base64=Buffer.from(bytes).toString('base64');
  const preview=await inspectBackup(backupFile(packet));
  await assert.rejects(importBackup(preview),/照片|冲突/);
  assert.equal((await all()).length,1);
});

test('large supported photos can be inspected without a regular-expression stack overflow', async () => {
  const bytes=new Uint8Array(8*1024*1024);bytes.set(png);
  const {url}=await (await upload(bytes)).json();await add({...product(),photos:[url]});
  const blob=await exportBackup();
  const preview=await inspectBackup(new File([blob],'large-photo.json'));
  assert.deepEqual(preview.counts,{products:1,photos:1});
});
