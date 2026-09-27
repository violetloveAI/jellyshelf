import { test } from 'node:test';
import assert from 'node:assert/strict';
import { costRange, median, summarizeMarket, validateProduct } from '../lib/domain.ts';
test('actual-sale percentage costs produce correlated target range',()=>{
  assert.deepEqual(costRange(10,20,30),{low:17.2,high:18.8,profitLow:2.8,profitHigh:11.2});
  assert.equal(costRange(null,20,30),null);
  assert.equal(costRange(10,30,20),null);
  assert.deepEqual(costRange(0,0,0),{low:4,high:4,profitLow:-4,profitHigh:-4});
});
test('median uses transactions and preserves missing data',()=>{
  assert.equal(median([]),null); assert.equal(median([10,90,20,30]),25);
});
test('market matching excludes wrong condition, currency, bundles and future dates',()=>{
  const base={id:'a',platform:'ebay',sku:'BAS3B',size:'M',condition:'NWT',price:20,currency:'USD',market:'US',soldAt:'2026-09-01',url:'https://www.ebay.com/itm/123',verified:true,bundle:false};
  const samples=[base,{...base,id:'b',price:30,url:'https://www.ebay.com/itm/456'},{...base,id:'c',platform:'whatnot',price:100,url:'https://www.whatnot.com/listing/test'},{...base,id:'d',price:999,condition:'EUC'},{...base,id:'e',price:999,currency:'GBP'},{...base,id:'f',price:999,bundle:true},{...base,id:'g',price:999,soldAt:'2027-01-01'},{...base,id:'h',price:999,verified:false}];
  const result=summarizeMarket(samples as never,{sku:'BAS3B',size:'M',condition:'NWT'},90,new Date('2026-09-27T12:00:00Z'));
  assert.equal(result.ebay.median,25);assert.equal(result.whatnot.median,100);assert.equal(result.combined.median,30);assert.equal(result.combined.count,3);assert.equal(result.combined.insufficient,true);
});
test('invalid ranges rejected while unknown official facts remain blank',()=>{
  const p={id:'x',nameEn:'Bashful Bunny',nameZh:'',photos:[],category:'公仔',releaseDate:'',releasePrice:null,officialStatus:'',sourceUrl:'',notes:'',variants:[{id:'v',sku:'BAS3B',size:'M',condition:'NWT',purchasePrice:10,targetLow:30,targetHigh:20}],sales:[]};
  assert.ok(validateProduct(p).includes('目标价上限不能低于下限'));
  p.variants[0].targetHigh=40;assert.deepEqual(validateProduct(p),[]);
});
test('the same eBay item across URL spellings is one comparable sale',()=>{
 const base={id:'a',platform:'ebay',sku:'B',size:'M',condition:'NWT',price:100,currency:'USD',market:'US',soldAt:'2026-09-01',url:'https://www.ebay.com/itm/123456789012',verified:true,bundle:false};
 const rows=[base,{...base,id:'b',url:'https://ebay.com/itm/123456789012'},{...base,id:'c',url:'https://www.ebay.com/itm/Bunny/123456789012?x=1'},{...base,id:'d',price:10,url:'https://www.ebay.com/itm/234567890123'}];
 const r=summarizeMarket(rows as never,{sku:'B',size:'M',condition:'NWT'},90,new Date('2026-09-27'));assert.equal(r.combined.count,2);assert.equal(r.combined.median,55);
});
test('official facts belong to their SKU; unknown second sizes stay blank',async()=>{
 const {normalizeProduct,officialFor,blankProduct}=await import('../lib/domain.ts');
 const p=blankProduct();p.nameEn='test';p.releasePrice=20;p.officialStatus='retired';p.variants[0].sku='S';
 p.variants.push({...p.variants[0],id:'other',sku:'L',size:'large'});
 let n=normalizeProduct(p);assert.equal(officialFor(n,n.variants[0]).releasePrice,20);assert.equal(officialFor(n,n.variants[1]).releasePrice,null);assert.equal(officialFor(n,n.variants[1]).officialStatus,'');
 n.variants[1].releasePrice=40;n.variants[1].officialStatus='in_stock';n=normalizeProduct(n);assert.equal(officialFor(n,n.variants[0]).officialStatus,'retired');assert.equal(officialFor(n,n.variants[1]).officialStatus,'in_stock');
 assert.equal(blankProduct().variants[0].condition,'');
});
