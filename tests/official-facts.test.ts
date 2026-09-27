import {test} from 'node:test';
import assert from 'node:assert/strict';
import {blankProduct,blankVariant,normalizeProduct,officialFor,beginSkuEdit,commitSkuEdit,type Product} from '../lib/domain.ts';

function twoSkus():Product {
  return normalizeProduct({...blankProduct(),nameZh:'测试商品',variants:[
    {...blankVariant(),sku:'SKU-A',condition:'NWT',purchasePrice:8,releaseDate:'2024',releasePrice:10,officialStatus:'retired',sourceUrl:'https://us.jellycat.com/a/'},
    {...blankVariant(),sku:'SKU-A',condition:'EUC',purchasePrice:5},
    {...blankVariant(),sku:'SKU-B',condition:'NWT',purchasePrice:12,releaseDate:'2025',releasePrice:20,officialStatus:'in_stock',sourceUrl:'https://us.jellycat.com/b/'},
  ]});
}

test('an added SKU retains confirmed official facts when its launch price is unknown',()=>{
  const p=normalizeProduct({...blankProduct(),nameZh:'测试商品'});
  p.variants[0].sku='SKU-A';
  p.variants.push({...blankVariant(),sku:'SKU-B',releaseDate:'2025-01',officialStatus:'retired',sourceUrl:'https://us.jellycat.com/b/'});
  const saved=normalizeProduct(p);
  assert.deepEqual(officialFor(saved,saved.variants[1]),{
    releaseDate:'2025-01',releasePrice:null,officialStatus:'retired',sourceUrl:'https://us.jellycat.com/b/',
  });
});

test('changing a preceding branch to an existing SKU adopts that SKU without overwriting it',()=>{
  const before=twoSkus();
  const changed={...before,variants:before.variants.map((v,i)=>i===1?{...v,sku:'SKU-B'}:v)};
  const saved=normalizeProduct(changed,before);
  const expected={releaseDate:'2025',releasePrice:20,officialStatus:'in_stock',sourceUrl:'https://us.jellycat.com/b/'};
  assert.deepEqual(officialFor(saved,saved.variants[1]),expected);
  assert.deepEqual(officialFor(saved,saved.variants[2]),expected);
  assert.equal(saved.variants[1].condition,'EUC');
  assert.equal(saved.variants[1].purchasePrice,5);
});

test('moving the leading branch to a new SKU clears its old facts and retains the old group edits',()=>{
  const before=twoSkus();
  before.variants[0].releaseDate='2024-03';
  before.variants[0].releasePrice=11;
  const changed={...before,variants:before.variants.map((v,i)=>i===0?{...v,sku:'SKU-C'}:v)};
  const saved=normalizeProduct(changed,before);
  assert.deepEqual(officialFor(saved,saved.variants[0]),{releaseDate:'',releasePrice:null,officialStatus:'',sourceUrl:''});
  assert.deepEqual(officialFor(saved,saved.variants[1]),{
    releaseDate:'2024-03',releasePrice:11,officialStatus:'retired',sourceUrl:'https://us.jellycat.com/a/',
  });
  assert.equal(saved.variants[0].purchasePrice,8);
});

test('formatting a SKU preserves facts while clearing it does not borrow another unnamed branch',()=>{
  const before=twoSkus();
  const formatted={...before,variants:before.variants.map((v,i)=>i===0?{...v,sku:' sku-a '}:v)};
  const same=normalizeProduct(formatted,before);
  assert.equal(officialFor(same,same.variants[0]).releasePrice,10);
  const changed={...before,variants:before.variants.map((v,i)=>i===0?{...v,sku:''}:v)};
  const cleared=normalizeProduct(changed,before);
  assert.deepEqual(officialFor(cleared,cleared.variants[0]),{releaseDate:'',releasePrice:null,officialStatus:'',sourceUrl:''});
  assert.equal(officialFor(cleared,cleared.variants[1]).releasePrice,10);
});

test('retyping the same SKU character by character retains facts when submitted without blur',()=>{
  const form=normalizeProduct({...blankProduct(),nameZh:'测试',variants:[twoSkus().variants[0]]});
  const edit=beginSkuEdit(form,form.variants[0].id);
  // react-hook-form mutates its values while the focused input is being edited.
  for(const sku of ['', 's', 'sk', 'sku', 'sku-', 'sku-a'])form.variants[0].sku=sku;
  const saved=commitSkuEdit(form,edit);
  assert.equal(saved.variants[0].sku,'sku-a');
  assert.deepEqual(officialFor(saved,saved.variants[0]),{
    releaseDate:'2024',releasePrice:10,officialStatus:'retired',sourceUrl:'https://us.jellycat.com/a/',
  });
});

test('facts entered before an unnamed SKU are retained through multi-character entry',()=>{
  const form=normalizeProduct({...blankProduct(),nameZh:'测试',variants:[{...blankVariant(),
    releaseDate:'2025-03',releasePrice:null,officialStatus:'sold_out',sourceUrl:'https://us.jellycat.com/new/',
  }]});
  const edit=beginSkuEdit(form,form.variants[0].id);
  for(const sku of ['N','NE','NEW','NEW-','NEW-1'])form.variants[0].sku=sku;
  const saved=commitSkuEdit(form,edit);
  assert.deepEqual(officialFor(saved,saved.variants[0]),{
    releaseDate:'2025-03',releasePrice:null,officialStatus:'sold_out',sourceUrl:'https://us.jellycat.com/new/',
  });
});

test('typing a new SKU clears only the old official facts and preserves other form edits',()=>{
  const form=twoSkus();
  const edit=beginSkuEdit(form,form.variants[0].id);
  for(const sku of ['N','NE','NEW'])form.variants[0].sku=sku;
  form.notes='保存前新写的备注';
  form.variants[0].targetLow=50;
  form.variants[2].releasePrice=22;
  const saved=commitSkuEdit(form,edit);
  assert.deepEqual(officialFor(saved,saved.variants[0]),{releaseDate:'',releasePrice:null,officialStatus:'',sourceUrl:''});
  assert.equal(officialFor(saved,saved.variants[1]).releasePrice,10);
  assert.equal(officialFor(saved,saved.variants[2]).releasePrice,22);
  assert.equal(saved.variants[0].targetLow,50);
  assert.equal(saved.notes,'保存前新写的备注');
});

test('typing an existing SKU adopts its facts without changing either group',()=>{
  const form=twoSkus();
  const edit=beginSkuEdit(form,form.variants[0].id);
  for(const sku of ['S','SK','SKU','SKU-','SKU-B'])form.variants[0].sku=sku;
  const saved=commitSkuEdit(form,edit);
  assert.equal(officialFor(saved,saved.variants[0]).releasePrice,20);
  assert.equal(officialFor(saved,saved.variants[1]).releasePrice,10);
  assert.equal(officialFor(saved,saved.variants[2]).releasePrice,20);
  // Once the SKU is committed, newly entered facts must survive the final save.
  saved.variants[0].releasePrice=23;
  assert.equal(officialFor(commitSkuEdit(saved),saved.variants[0]).releasePrice,23);
});
