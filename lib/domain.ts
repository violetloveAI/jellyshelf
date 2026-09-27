import { z } from 'zod';
export const CONDITIONS = ['NWT','NWOT','EUC','GUC','UC'] as const;
export type Condition = typeof CONDITIONS[number];
export const CONDITION_LABELS: Record<Condition,string> = {NWT:'全新含吊牌',NWOT:'全新不含吊牌',EUC:'极品二手',GUC:'良好二手',UC:'明显污渍'};
export const STATUS_LABELS: Record<string,string> = {in_stock:'在售',sold_out:'售罄',retired:'停产'};
const amount=z.number().finite().min(0).max(1000000).nullable();
export const variantSchema=z.object({id:z.string().min(1).max(100),sku:z.string().max(120),size:z.string().max(160),condition:z.enum([...CONDITIONS,'']),purchasePrice:amount,targetLow:amount,targetHigh:amount,releaseDate:z.string().max(100).optional(),releasePrice:amount.optional(),officialStatus:z.enum(['','in_stock','sold_out','retired']).optional(),sourceUrl:z.string().max(2000).optional()});
export const saleSchema=z.object({id:z.string().min(1).max(100),platform:z.enum(['ebay','whatnot']),sku:z.string().min(1).max(120),size:z.string().max(160),condition:z.enum([...CONDITIONS,'unknown']),price:z.number().finite().positive().max(1000000),currency:z.string().max(10),market:z.string().max(10),soldAt:z.string().regex(/^\d{4}-\d{2}-\d{2}$/),url:z.string().url().max(2000),verified:z.boolean(),bundle:z.boolean()});
export const productSchema=z.object({id:z.string().min(1).max(100),nameEn:z.string().max(250),nameZh:z.string().max(250),category:z.string().max(40),photos:z.array(z.string().max(2000)).max(12),releaseDate:z.string().max(100),releasePrice:amount,officialStatus:z.enum(['','in_stock','sold_out','retired']),sourceUrl:z.string().max(2000),notes:z.string().max(5000),variants:z.array(variantSchema).min(1).max(100),sales:z.array(saleSchema).max(2000),revision:z.number().int().min(0).optional(),updatedAt:z.string().optional()});
export type Product=z.infer<typeof productSchema>;
export type Variant=z.infer<typeof variantSchema>;
export type Sale=z.infer<typeof saleSchema>;
const cents=(n:number)=>Math.round((n+Number.EPSILON)*100)/100;
export function costRange(purchase:number|null,low:number|null,high:number|null){
 if(purchase===null||low===null||high===null||[purchase,low,high].some(x=>!Number.isFinite(x)||x<0)||low>high)return null;
 return {low:cents(purchase+4+low*.16),high:cents(purchase+4+high*.16),profitLow:cents(low*.84-purchase-4),profitHigh:cents(high*.84-purchase-4)};
}
export function median(values:number[]):number|null{const s=values.filter(Number.isFinite).sort((a,b)=>a-b);if(!s.length)return null;const m=Math.floor(s.length/2);return cents(s.length%2?s[m]:(s[m-1]+s[m])/2);}
export function isSaleSource(url:string,platform:string){try{const u=new URL(url);return u.protocol==='https:'&&(u.hostname===`${platform}.com`||u.hostname.endsWith(`.${platform}.com`));}catch{return false;}}
export function summarizeMarket(sales:Sale[],variant:Pick<Variant,'sku'|'size'|'condition'>,days=90,now=new Date()){
 const seen=new Set<string>();const end=new Date(now);end.setUTCHours(23,59,59,999);const start=new Date(end);start.setUTCDate(start.getUTCDate()-days+1);start.setUTCHours(0,0,0,0);
 const samples=sales.filter(s=>{const date=new Date(s.soldAt+'T12:00:00Z');let key='';try{key=saleKey(s.url,s.platform);}catch{return false;}
 if(seen.has(key)||!s.verified||s.bundle||s.currency!=='USD'||s.market!=='US'||s.sku.trim().toLowerCase()!==variant.sku.trim().toLowerCase()||s.size.trim().toLowerCase()!==variant.size.trim().toLowerCase()||s.condition!==variant.condition||!(s.price>0)||!isSaleSource(s.url,s.platform)||!Number.isFinite(date.getTime())||date<start||date>end)return false;
 seen.add(key);return true;});
 const summarize=(rows:Sale[])=>({median:median(rows.map(s=>s.price)),count:rows.length,insufficient:rows.length<5});
 return {ebay:summarize(samples.filter(s=>s.platform==='ebay')),whatnot:summarize(samples.filter(s=>s.platform==='whatnot')),combined:summarize(samples),samples};
}
export function validateProduct(value:unknown):string[]{const parsed=productSchema.safeParse(value);if(!parsed.success)return parsed.error.issues.map(i=>`${i.path.join('.')}: ${i.message}`);const p=parsed.data;const errors:string[]=[];
 if(!p.nameEn.trim()&&!p.nameZh.trim())errors.push('请填写中文或英文品名');
 if([p.sourceUrl,...p.variants.map(v=>v.sourceUrl)].some(u=>u&&!/^https:\/\//.test(u)))errors.push('来源链接必须使用 https');
 if(p.variants.some(v=>v.targetLow!==null&&v.targetHigh!==null&&v.targetHigh<v.targetLow))errors.push('目标价上限不能低于下限');
 if(new Set(p.variants.map(v=>v.id)).size!==p.variants.length)errors.push('分支编号重复');
 if(p.photos.some(u=>!u.startsWith('/api/photos/')&&!isOfficialImage(u)))errors.push('照片请上传，或使用 Jellycat 官方图片链接');
 if(p.sales.some(s=>!isSaleSource(s.url,s.platform)))errors.push('成交来源必须是对应平台的 https 链接');return errors;
}
export function isOfficialImage(value:string){try{const u=new URL(value);return u.protocol==='https:'&&(u.hostname.endsWith('.jellycat.com')||u.hostname==='jellycat.com'||u.hostname==='cdn11.bigcommerce.com');}catch{return false;}}
export function money(value:number|null|undefined){return value==null?'—':new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(value);}
export function blankVariant():Variant{return {id:crypto.randomUUID(),sku:'',size:'',condition:'',purchasePrice:null,targetLow:null,targetHigh:null};}
export function blankProduct():Product{return {id:crypto.randomUUID(),nameEn:'',nameZh:'',category:'公仔',photos:[],releaseDate:'',releasePrice:null,officialStatus:'',sourceUrl:'',notes:'',variants:[blankVariant()],sales:[],revision:0};}
export function missingFields(p:Product){const official=p.variants.map(v=>officialFor(p,v));return [official.some(o=>!o.releaseDate)&&'发售时间',official.some(o=>o.releasePrice===null)&&'首发定价',official.some(o=>!o.officialStatus)&&'官方状态',!p.photos.length&&'照片',p.variants.some(v=>!v.sku)&&'货号',p.variants.some(v=>!v.condition)&&'品相'].filter(Boolean) as string[];}
export function saleKey(url:string,platform:string){const u=new URL(url);const parts=u.pathname.split('/').filter(Boolean);const id=platform==='ebay'?parts[0]==='itm'?parts.at(-1):null:parts[0]==='listing'?parts[1]:null;return platform+'|'+(id||u.hostname.replace(/^www\./,'')+u.pathname.replace(/\/$/,''));}
export function officialFor(p:Product,v:Variant):Pick<Product,'releaseDate'|'releasePrice'|'officialStatus'|'sourceUrl'>{const group=p.variants.filter(x=>v.sku?x.sku.trim().toLowerCase()===v.sku.trim().toLowerCase():x.id===v.id);const explicit=group.find(x=>x.releasePrice!==undefined);if(explicit)return {releaseDate:explicit.releaseDate||'',releasePrice:explicit.releasePrice??null,officialStatus:explicit.officialStatus||'',sourceUrl:explicit.sourceUrl||''};if(v.sku===p.variants[0]?.sku)return {releaseDate:p.releaseDate,releasePrice:p.releasePrice,officialStatus:p.officialStatus,sourceUrl:p.sourceUrl};return {releaseDate:'',releasePrice:null,officialStatus:'',sourceUrl:''};}
export function normalizeProduct(p:Product):Product{return {...p,variants:p.variants.map(v=>({...v,...officialFor(p,v)}))};}
