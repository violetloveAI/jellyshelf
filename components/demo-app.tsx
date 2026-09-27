import {useMemo, useState, type CSSProperties} from 'react';
import {ArrowLeft, ArrowRight, ArrowUpRight, BookOpen, Camera, Check, ChevronLeft, ChevronRight, Heart, ImageIcon, Library, Radio, Search, SlidersHorizontal, Sparkles, UserRound, X} from 'lucide-react';
import {Dialog, DialogContent, DialogDescription, DialogTitle, DialogClose} from '@/components/ui/dialog';
import PhotoSearch from './photo-search';
import {demoProducts, type DemoProduct} from '@/lib/demo-products';
import {CONDITION_LABELS, costRange, money, type Product} from '@/lib/domain';
import '@/src/demo.css';

const families = ['兔兔家族', '软萌动物', '趣味食物', '随身挂件'] as const;
const familyLabels = ['兔兔', '软萌动物', '趣味食物', '随身挂件'];
const shortPrice = (p:DemoProduct) => `$${p.targetLow}–${p.targetHigh}`;
const photoStyle = (p:DemoProduct) => ({'--photo-bg':p.color} as CSSProperties);
const asProduct = (p:DemoProduct):Product => ({id:p.id,nameZh:p.nameZh,nameEn:p.nameEn,photos:p.photos,category:p.category,releaseDate:'',releasePrice:null,officialStatus:'',sourceUrl:p.sourceUrl,notes:'演示图册；品相与价格仅为界面示例。',variants:[{id:p.id+'-demo',sku:p.sku,size:p.size,condition:p.condition,purchasePrice:p.purchasePrice,targetLow:p.targetLow,targetHigh:p.targetHigh}],sales:[],revision:0});

function Flower(){return <span className="demo-flower" aria-hidden="true"><i/><i/><i/><i/></span>;}
function DemoPhoto({product, index=0, eager=false, className=''}:{product:DemoProduct;index?:number;eager?:boolean;className?:string}){
  const src=product.photos[index]||product.photos[0];
  const [failed,setFailed]=useState<string|null>(null);
  return failed===src?<div className={'demo-photo-fallback '+className}><ImageIcon size={26}/><span>照片暂未加载</span></div>:<img className={className} src={src} alt={`${product.nameZh} · 视角 ${index+1}`} loading={eager?'eager':'lazy'} decoding="async" onError={()=>setFailed(src)}/>;
}
function FavoriteButton({product, active, onClick}:{product:DemoProduct;active:boolean;onClick:()=>void}){
  return <button className={'demo-favorite '+(active?'is-liked':'')} aria-label={`${active?'取消收藏':'收藏'}${product.nameZh}`} aria-pressed={active} onClick={onClick}><Heart size={18} strokeWidth={1.6} fill={active?'currentColor':'none'} aria-hidden="true"/></button>;
}

export default function DemoApp(){
  const [page,setPage]=useState<'collection'|'live'|'mine'>('collection');
  const [query,setQuery]=useState(''),[family,setFamily]=useState('全部');
  const [favorites,setFavorites]=useState<string[]>([]),[onlyFavorites,setOnlyFavorites]=useState(false);
  const [selected,setSelected]=useState<DemoProduct|null>(null),[camera,setCamera]=useState(false),[about,setAbout]=useState(false);
  const [recent,setRecent]=useState<string[]>([]);
  const filtered=useMemo(()=>demoProducts.filter(p=>(family==='全部'||p.family===family)&&(!onlyFavorites||favorites.includes(p.id))&&query.normalize('NFKC').toLowerCase().trim().split(/\s+/).every(t=>[p.nameZh,p.nameEn,p.sku,p.family].join(' ').normalize('NFKC').toLowerCase().includes(t))),[family,query,onlyFavorites,favorites]);
  const hero=demoProducts.find(p=>p.family==='兔兔家族')||demoProducts[0];
  const showCover=page==='collection'&&!query&&family==='全部'&&!onlyFavorites;
  const photoCount=demoProducts.reduce((n,p)=>n+p.photos.length,0);
  const visionProducts=useMemo(()=>demoProducts.map(asProduct),[]);
  function open(p:DemoProduct){setSelected(p);setRecent(old=>[p.id,...old.filter(id=>id!==p.id)].slice(0,6));}
  function favorite(id:string){setFavorites(old=>old.includes(id)?old.filter(x=>x!==id):[...old,id]);}
  function changePage(next:typeof page){setPage(next);window.scrollTo({top:0,behavior:'instant'});}
  function resetFilters(){setQuery('');setFamily('全部');setOnlyFavorites(false);}
  return <div className="demo-stage">
    <aside className="demo-desktop-caption" aria-hidden="true"><span>JELLYSHELF / iOS CONCEPT</span><h2>A little shelf.<br/><em>A lot of love.</em></h2><p>一间装得下所有喜欢的<br/>软软收藏室。</p><div><span className="demo-caption-line"/>A 版 · 奶油收藏室</div></aside>
    <div className="demo-app">
      <header className="demo-header"><a className="demo-brand" href="?demo=1" aria-label="JellyShelf 演示首页"><Flower/><div><strong>JellyShelf</strong><small>THE SOFT ARCHIVE</small></div></a><div className="demo-header-actions"><button className="demo-badge" onClick={()=>setAbout(true)}>DEMO <span/></button><button className="demo-header-heart" aria-label="查看收藏" aria-pressed={onlyFavorites} onClick={()=>{setOnlyFavorites(v=>!v);setPage('collection');}}><Heart size={21} strokeWidth={1.5} fill={onlyFavorites?'currentColor':'none'}/>{favorites.length>0&&<i>{favorites.length}</i>}</button></div></header>

      {page==='mine'?<section className="demo-mine">
        <div className="demo-mini-label">YOUR LITTLE WORLD</div><h1>喜欢的，都在这里。</h1><p className="demo-muted">给每一只软软伙伴，留一个位置。</p>
        <div className="demo-profile-collage">{demoProducts.slice(0,3).map((p,i)=><div key={p.id} className={'demo-profile-photo photo-'+i} style={photoStyle(p)}><DemoPhoto product={p}/></div>)}<span className="demo-profile-seal"><Flower/></span></div>
        <div className="demo-profile-stats"><div><strong>{demoProducts.length}</strong><span>演示藏品</span></div><div><strong>{photoCount}</strong><span>多角度照片</span></div><div><strong>{favorites.length.toString().padStart(2,'0')}</strong><span>本次收藏</span></div></div>
        <button className="demo-menu-row" onClick={()=>{setOnlyFavorites(true);setFamily('全部');setQuery('');changePage('collection');}}><Heart size={20}/><div><strong>我的心头好</strong><span>看看刚刚收藏的伙伴</span></div><ChevronRight size={18}/></button>
        <button className="demo-menu-row" onClick={()=>setAbout(true)}><BookOpen size={20}/><div><strong>关于这个演示</strong><span>图片、示例数据与使用方式</span></div><ChevronRight size={18}/></button>
        <a className="demo-menu-row" href="./?app=1"><Library size={20}/><div><strong>打开本机资料库</strong><span>录入与备份你自己的商品</span></div><ArrowUpRight size={18}/></a>
        <div className="demo-mine-note">演示收藏仅保留在本次浏览中。<br/>未来的 iOS App 将继续沿用这套设计方向。</div>
      </section>:<main className={page==='live'?'demo-main demo-live':'demo-main'}>
        {!query&&<div className="demo-intro"><div>{page==='live'?<><div className="demo-mini-label">READY WHEN YOU ARE</div><h1>直播查货台<span>.</span></h1><p>品名、货号，一眼找到。</p></>:<><h1>Little things,<br/><em>big love.</em></h1><p>让每一只，都被好好收藏。</p></>}</div><div className="demo-counter"><strong>{demoProducts.length.toString().padStart(2,'0')}</strong><span>位软软伙伴</span></div></div>}
        <div className="demo-search-dock"><label className="demo-search"><Search size={19} strokeWidth={1.6}/><input aria-label="搜索演示商品" placeholder="搜名字、货号，找到那一只" value={query} onChange={e=>setQuery(e.target.value)}/>{query&&<button aria-label="清空搜索" onClick={()=>setQuery('')}><X size={16}/></button>}</label><button className="demo-scan" onClick={()=>setCamera(true)} aria-label="拍照查找演示商品"><Camera size={23} strokeWidth={1.7}/></button></div>
        <div className="demo-mode-note"><span className="demo-mode-dot"/>演示图册<span>·</span>品相与价格为示例</div>

        {showCover&&<>
          <article className="demo-hero" style={photoStyle(hero)}><button className="demo-hero-open" onClick={()=>open(hero)} aria-label={`查看${hero.nameZh}`}><div className="demo-hero-kicker">THE SOFT EDIT<span>VOL. 01 / LITTLE COMPANIONS</span></div><span className="demo-hero-arch"/><DemoPhoto product={hero} eager className="demo-hero-image"/><div className="demo-hero-copy"><span>本期封面伙伴</span><h2>{hero.nameZh}</h2><p>{hero.nameEn}</p></div><span className="demo-hero-arrow"><ArrowUpRight size={22} strokeWidth={1.5}/></span></button>{hero.photos.length>1&&<button className="demo-hero-peek" onClick={()=>open(hero)} aria-label={`查看${hero.nameZh}的多角度照片`}><DemoPhoto product={hero} index={1}/><span>另一个角度 <ArrowUpRight size={11}/></span></button>}</article>
          <div className="demo-family-row" aria-label="按系列浏览">{families.map((f,i)=>{const p=demoProducts.find(x=>x.family===f);return p&&<button key={f} onClick={()=>setFamily(f)}><span style={photoStyle(p)}><DemoPhoto product={p}/></span><strong>{familyLabels[i]}</strong></button>;})}</div>
        </>}

        {page==='live'&&recent.length>0&&!query&&<section className="demo-recents"><div className="demo-section-heading"><h2>刚刚看过</h2><span>RECENTLY VIEWED</span></div><div>{recent.map(id=>{const p=demoProducts.find(x=>x.id===id)!;return <button key={id} onClick={()=>open(p)}><span style={photoStyle(p)}><DemoPhoto product={p}/></span><small>{p.nameZh}</small></button>;})}</div></section>}
        <div className="demo-section-heading"><div><span className="demo-mini-label">{page==='live'?'LIVE COMPANION':'THE COLLECTION'}</span><h2>{query?'找到的软软伙伴':onlyFavorites?'我的心头好':family==='全部'?'一柜小欢喜':family}</h2></div><button onClick={()=>setOnlyFavorites(v=>!v)} className={onlyFavorites?'is-filtered':''} aria-label={onlyFavorites?'显示全部商品':'只看收藏'} aria-pressed={onlyFavorites}><SlidersHorizontal size={14}/>{onlyFavorites?'已收藏':filtered.length+' 款'}</button></div>
        {!showCover&&<div className="demo-filter-row" aria-label="系列筛选">{['全部',...families].map(f=><button key={f} aria-pressed={family===f} className={family===f?'active':''} onClick={()=>setFamily(f)}>{f==='全部'?'全部':familyLabels[families.indexOf(f as typeof families[number])]}</button>)}</div>}
        {filtered.length===0?<div className="demo-no-results"><Search size={28}/><h3>{onlyFavorites?'还没有收藏这组伙伴':'暂时没有找到'}</h3><p>{onlyFavorites?'点一下商品上的爱心，把喜欢的留下。':'试试中文名、英文名的一部分或货号。'}</p><button onClick={resetFilters}>查看全部伙伴 <ArrowRight size={16}/></button></div>:page==='live'?<div className="demo-live-list">{filtered.map(p=><button key={p.id} className="demo-live-row" onClick={()=>open(p)}><span className="demo-live-photo" style={photoStyle(p)}><DemoPhoto product={p}/></span><span className="demo-live-copy"><strong>{p.nameZh}</strong><small>{p.sku||'货号待核实'}</small><span>{p.condition} <i/> {p.size||'尺寸待核实'}</span></span><span className="demo-live-price"><small>示例目标价</small><strong>{shortPrice(p)}</strong><ChevronRight size={16}/></span></button>)}</div>:<div className="demo-grid">{filtered.map((p,i)=><article key={p.id} className="demo-card" style={photoStyle(p)}><div className="demo-card-visual"><button onClick={()=>open(p)} aria-label={`查看${p.nameZh}`}><DemoPhoto product={p}/><span className="demo-card-photo-count"><ImageIcon size={11}/>{p.photos.length}</span></button><FavoriteButton product={p} active={favorites.includes(p.id)} onClick={()=>favorite(p.id)}/></div><button className="demo-card-copy" onClick={()=>open(p)}><span className="demo-card-sku">{p.sku||p.family}</span><h3>{p.nameZh}</h3><p>{p.nameEn}</p><div><strong>{shortPrice(p)}</strong><span>{p.condition}</span></div></button></article>)}</div>}
        {showCover&&<button className="demo-story" onClick={()=>setFamily('随身挂件')}><div><span className="demo-mini-label">LITTLE JOYS, TO GO</span><h2>把喜欢，<br/>挂在身边。</h2><span className="demo-story-link">看看随身挂件 <ArrowRight size={16}/></span></div><div className="demo-story-pictures">{demoProducts.filter(p=>p.family==='随身挂件').slice(0,2).map((p,i)=><DemoPhoto key={p.id} product={p} className={'story-photo-'+i}/>)}</div></button>}
        <footer className="demo-endnote"><span/>Made of little happy things.<span/></footer>
      </main>}

      <nav className="demo-bottom-nav" aria-label="演示主要导航"><button className={page==='collection'?'active':''} aria-current={page==='collection'?'page':undefined} onClick={()=>changePage('collection')}><Library size={22} strokeWidth={1.5}/><span>图册</span></button><button onClick={()=>setCamera(true)}><Camera size={22} strokeWidth={1.5}/><span>拍照</span></button><button className={page==='live'?'active':''} aria-current={page==='live'?'page':undefined} onClick={()=>changePage('live')}><Radio size={22} strokeWidth={1.5}/><span>直播</span></button><button className={page==='mine'?'active':''} aria-current={page==='mine'?'page':undefined} onClick={()=>changePage('mine')}><UserRound size={22} strokeWidth={1.5}/><span>我的</span></button></nav>
    </div>
    {selected&&<DemoDetail key={selected.id} product={selected} live={page==='live'} favorite={favorites.includes(selected.id)} onFavorite={()=>favorite(selected.id)} onClose={()=>setSelected(null)}/>}
    <PhotoSearch open={camera} demo onClose={()=>setCamera(false)} products={visionProducts} onSelect={p=>{setCamera(false);const match=demoProducts.find(x=>x.id===p.id);if(match)open(match);}}/>
    <Dialog open={about} onOpenChange={setAbout}><DialogContent className="demo-about"><Flower/><DialogTitle>一间软软的收藏室。</DialogTitle><DialogDescription>这是 JellyShelf 的 A 版移动端演示，延续未来 iOS App 的设计方向。</DialogDescription><div className="demo-about-facts"><p><Check size={17}/> {demoProducts.length} 款官方商品图片，{photoCount} 张多角度照片</p><p><Check size={17}/> 搜索、收藏、图集与直播查货可体验</p><p><Check size={17}/> 演示不会写入你的本机商品库</p></div><p className="demo-about-note">中文名为检索译名。品相、拿货价和目标价为界面示例；首发资料及历史成交未核实时保持留白。图库图片通过 Jellycat 官方图片服务加载，图片版权归其权利人所有。</p><a href="./?app=1" className="demo-filled-button">打开我的本机资料库 <ArrowUpRight size={16}/></a></DialogContent></Dialog>
  </div>;
}

function DemoDetail({product:p,live,favorite,onFavorite,onClose}:{product:DemoProduct;live:boolean;favorite:boolean;onFavorite:()=>void;onClose:()=>void}){
  const [index,setIndex]=useState(0),[tab,setTab]=useState<'overview'|'cost'>(live?'cost':'overview');
  const [amount,setAmount]=useState(p.targetLow),[enlarged,setEnlarged]=useState(false);
  const cost=p.purchasePrice+4+amount*.16;
  const range=costRange(p.purchasePrice,p.targetLow,p.targetHigh)!;
  return <Dialog open onOpenChange={v=>{if(!v)onClose();}}><DialogContent showCloseButton={false} className={'demo-detail '+(live?'demo-detail-live':'')} style={photoStyle(p)}><div className="demo-detail-scroll">
    <div className="demo-detail-gallery"><div className="demo-detail-toolbar"><DialogClose asChild><button aria-label="返回图册"><ArrowLeft size={20}/></button></DialogClose><span>COLLECTION / DETAIL</span><FavoriteButton product={p} active={favorite} onClick={onFavorite}/></div><button className="demo-detail-zoom" onClick={()=>setEnlarged(true)} aria-label={`放大${p.nameZh}照片`}><DemoPhoto product={p} index={index} eager/></button><div className="demo-gallery-bottom"><span>{String(index+1).padStart(2,'0')} <i>/ {String(p.photos.length).padStart(2,'0')}</i></span><div><button aria-label="上一张照片" onClick={()=>setIndex((index-1+p.photos.length)%p.photos.length)}><ChevronLeft size={18}/></button><button aria-label="下一张照片" onClick={()=>setIndex((index+1)%p.photos.length)}><ChevronRight size={18}/></button></div></div></div>
    <div className="demo-detail-content"><div className="demo-thumb-row" aria-label="商品多角度图集">{p.photos.map((src,i)=><button key={src} className={index===i?'active':''} aria-label={`查看第 ${i+1} 张照片`} aria-pressed={index===i} onClick={()=>setIndex(i)}><DemoPhoto product={p} index={i}/></button>)}</div><div className="demo-detail-heading"><span>{p.family} <i/> {p.sku||'货号待核实'}</span><DialogTitle>{p.nameZh}</DialogTitle><DialogDescription>{p.nameEn}</DialogDescription></div><div className="demo-detail-tags"><span>{p.condition} · {CONDITION_LABELS[p.condition]}</span><span>{p.size||'尺寸待核实'}</span></div>
    <div className="demo-price-panel"><div><span>示例目标成交价</span><strong>{shortPrice(p)}</strong></div><span className="demo-price-unit">USD<br/>美元</span></div>
    <div className="demo-detail-tabs" role="tablist" aria-label="商品信息"><button role="tab" id="demo-tab-overview" aria-controls="demo-panel-overview" aria-selected={tab==='overview'} onClick={()=>setTab('overview')}>商品资料</button><button role="tab" id="demo-tab-cost" aria-controls="demo-panel-cost" aria-selected={tab==='cost'} onClick={()=>setTab('cost')}>成本试算</button></div>
    {tab==='overview'?<div role="tabpanel" id="demo-panel-overview" aria-labelledby="demo-tab-overview" className="demo-facts"><dl><div><dt>官方货号</dt><dd>{p.sku||'待核实'}</dd></div><div><dt>发售时间</dt><dd className="demo-unverified">待核实</dd></div><div><dt>美国首发价</dt><dd className="demo-unverified">待核实</dd></div><div><dt>官方销售状态</dt><dd className="demo-unverified">待核实</dd></div></dl><a href={p.sourceUrl} target="_blank" rel="noreferrer">查看官方商品页 <ArrowUpRight size={15}/></a><div className="demo-market-blank"><span><Sparkles size={17}/>建议零售价</span><strong>—</strong><p>等待核验 eBay / Whatnot 实际成交记录</p></div></div>:<div role="tabpanel" id="demo-panel-cost" aria-labelledby="demo-tab-cost" className="demo-cost"><div className="demo-cost-heading"><span>假设本次成交价</span><strong>{money(amount)}</strong></div><label className="demo-range"><span className="sr-only">演示成交价</span><input type="range" min={p.targetLow} max={p.targetHigh} step=".5" value={amount} onChange={e=>setAmount(Number(e.target.value))}/><span><i>{money(p.targetLow)}</i><i>{money(p.targetHigh)}</i></span></label><div className="demo-cost-rows"><p><span>示例拿货价</span><strong>{money(p.purchasePrice)}</strong></p><p><span>运费 / 件</span><strong>$4.00</strong></p><p><span>平台 11% ＋ 人工 5%</span><strong>{money(amount*.16)}</strong></p><p className="demo-cost-total"><span>预计总成本</span><strong>{money(cost)}</strong></p><p><span>扣除以上费用后余款</span><strong>{money(amount-cost)}</strong></p></div><p className="demo-cost-note">按目标区间预计成本 {money(range.low)}–{money(range.high)}。所有购入价和目标价为演示输入，不代表真实成交或行情。</p></div>}
    <p className="demo-detail-footnote">照片来自官方商品页 · 品相与价格为演示数据</p></div>
  </div><div className="demo-detail-footer"><button className={'demo-filled-button '+(favorite?'is-saved':'')} onClick={onFavorite}><Heart size={18} fill={favorite?'currentColor':'none'}/>{favorite?'已收入心头好':'收入我的心头好'}</button></div>
  <Dialog open={enlarged} onOpenChange={setEnlarged}><DialogContent className="demo-lightbox" showCloseButton={false}><DialogTitle className="sr-only">{p.nameZh}大图</DialogTitle><DialogDescription className="sr-only">可使用左右按钮切换商品照片</DialogDescription><DialogClose asChild><button className="demo-lightbox-close" aria-label="关闭大图"><X size={22}/></button></DialogClose><DemoPhoto product={p} index={index} eager/><div className="demo-lightbox-controls"><button onClick={()=>setIndex((index-1+p.photos.length)%p.photos.length)} aria-label="大图上一张"><ChevronLeft/></button><span>{index+1} / {p.photos.length}</span><button onClick={()=>setIndex((index+1)%p.photos.length)} aria-label="大图下一张"><ChevronRight/></button></div></DialogContent></Dialog>
  </DialogContent></Dialog>;
}
