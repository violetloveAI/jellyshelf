import {useCallback, useEffect, useMemo, useRef, useState, type CSSProperties} from 'react';
import {AlertCircle, Archive, ArrowRight, ArrowUpRight, Camera, ChevronRight, Heart, ImageIcon, Library, Loader2, PackageOpen, Plus, Radio, RefreshCw, Search, ShieldCheck, UserRound, X} from 'lucide-react';
import {Toaster, toast} from 'sonner';
import {blankProduct, productSchema, type Product, type Variant} from '@/lib/domain';
import {catalogRequest} from '@/lib/local-catalog';
import {usePersonalViewport} from '@/hooks/use-personal-viewport';
import {Photo} from './catalog-app';
import ProductEditor from './product-editor';
import ProductDetail from './product-detail';
import PhotoSearch from './photo-search';
import BackupPanel from './backup-panel';
import '@/src/demo.css';
import '@/src/personal.css';

type Page = 'collection' | 'live' | 'mine';
type LoadState = 'loading' | 'ready' | 'error';
const FAVORITES_KEY = 'jellyshelf:personal-favorites:v1';
const palette = ['#eadfcc', '#e8ddd5', '#e2e4d6', '#eaded2'];
const displayName = (p: Product) => p.nameZh || p.nameEn;
const dollars = (value: number) => '$' + value.toLocaleString('en-US', {maximumFractionDigits: 2});

function targetPrice(v?: Variant): string {
  if (!v || (v.targetLow === null && v.targetHigh === null)) return '待填写';
  if (v.targetLow !== null && v.targetLow === v.targetHigh) return dollars(v.targetLow);
  return `${v.targetLow === null ? '待填' : dollars(v.targetLow)} – ${v.targetHigh === null ? '待填' : dollars(v.targetHigh)}`;
}

function matchingSkuVariant(product: Product, query: string): Variant | undefined {
  const normalized = query.normalize('NFKC').toLowerCase().trim();
  if (!normalized) return undefined;
  const exact = product.variants.find(v => v.sku.normalize('NFKC').toLowerCase().trim() === normalized);
  if (exact) return exact;
  const terms = normalized.split(/\s+/);
  return product.variants.find(v => {
    const sku = v.sku.normalize('NFKC').toLowerCase().trim();
    const text = [product.nameZh, product.nameEn, v.sku, v.size].join(' ').normalize('NFKC').toLowerCase();
    return !!sku && terms.some(term => sku.includes(term)) && terms.every(term => text.includes(term));
  });
}

function readFavorites(): string[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]');
    return Array.isArray(value)
      ? [...new Set(value.filter((id): id is string => typeof id === 'string' && id.length > 0 && id.length <= 100))].slice(0, 5000)
      : [];
  } catch { return []; }
}

function persistFavorites(ids: string[], notify = false) {
  try { localStorage.setItem(FAVORITES_KEY, JSON.stringify(ids)); }
  catch { if (notify) toast.error('收藏已在本次使用中更新，但未能保存到设备。'); }
}

function Flower() {
  return <span className="demo-flower" aria-hidden="true"><i/><i/><i/><i/></span>;
}

function Favorite({product, active, onClick}: {product: Product; active: boolean; onClick: () => void}) {
  return <button type="button" className={'demo-favorite ' + (active ? 'is-liked' : '')} aria-label={`${active ? '取消收藏' : '收藏'}${displayName(product)}`} aria-pressed={active} onClick={onClick}><Heart size={18} strokeWidth={1.6} fill={active ? 'currentColor' : 'none'}/></button>;
}

export default function PersonalApp() {
  usePersonalViewport();
  const [products, setProducts] = useState<Product[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [error, setError] = useState('');
  const [page, setPage] = useState<Page>('collection');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('全部');
  const [favorites, setFavorites] = useState<string[]>(readFavorites);
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  const [editor, setEditor] = useState<Product | null>(null);
  const [detail, setDetail] = useState<Product | null>(null);
  const [detailVariantId, setDetailVariantId] = useState<string | undefined>();
  const [camera, setCamera] = useState(false);
  const [backup, setBackup] = useState(false);
  const requestId = useRef(0);
  const searchRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    const id = ++requestId.current;
    setLoadState('loading');
    setError('');
    try {
      const response = await catalogRequest('/api/products');
      const data = await response.json() as {products?: unknown; error?: string};
      if (!response.ok) throw new Error(data.error || '本机资料库暂时无法读取。');
      const parsed = productSchema.array().safeParse(data.products);
      if (!parsed.success) throw new Error('商品资料格式不完整，请先保留备份，再重试读取。');
      if (requestId.current !== id) return;
      const ids = new Set(parsed.data.map(p => p.id));
      const validFavorites = readFavorites().filter(value => ids.has(value));
      setProducts(parsed.data);
      setFavorites(validFavorites);
      persistFavorites(validFavorites);
      setRecent(old => old.filter(value => ids.has(value)));
      setLoadState('ready');
    } catch (e) {
      if (requestId.current !== id) return;
      setError(e instanceof Error ? e.message : '本机资料库暂时无法读取。');
      setLoadState('error');
    }
  }, []);

  useEffect(() => {
    void load();
    return () => { requestId.current++; };
  }, [load]);

  useEffect(() => {
    function shortcut(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        setPage('collection');
        requestAnimationFrame(() => searchRef.current?.focus());
      }
    }
    window.addEventListener('keydown', shortcut);
    return () => window.removeEventListener('keydown', shortcut);
  }, []);

  const filtered = useMemo(() => {
    const terms = query.normalize('NFKC').toLowerCase().trim().split(/\s+/);
    return products.filter(p => {
      const text = [p.nameZh, p.nameEn, ...p.variants.flatMap(v => [v.sku, v.size])].join(' ').normalize('NFKC').toLowerCase();
      return (category === '全部' || p.category === category) && (!onlyFavorites || favorites.includes(p.id)) && terms.every(term => text.includes(term));
    });
  }, [products, query, category, favorites, onlyFavorites]);
  const categories = useMemo(() => ['全部', ...new Set(['公仔', '挂件', '其他', ...products.map(p => p.category).filter(Boolean)])], [products]);
  const ready = loadState === 'ready';
  const hero = products[0];
  const showCover = ready && !!hero && page === 'collection' && !query.trim() && category === '全部' && !onlyFavorites;
  const branchCount = products.reduce((sum, p) => sum + p.variants.length, 0);
  const photoCount = products.reduce((sum, p) => sum + p.photos.length, 0);
  const recentProducts = recent.map(id => products.find(p => p.id === id)).filter((p): p is Product => !!p);

  function changePage(next: Page) {
    setPage(next);
    window.scrollTo({top: 0, behavior: 'instant'});
  }
  function resetFilters() { setQuery(''); setCategory('全部'); setOnlyFavorites(false); }
  function openProduct(product: Product, variantId?: string) {
    const variant = product.variants.find(v => v.id === variantId) || matchingSkuVariant(product, query);
    setDetailVariantId(variant?.id);
    setDetail(product);
    setRecent(old => [product.id, ...old.filter(id => id !== product.id)].slice(0, 6));
  }
  function favorite(id: string) {
    if (!ready || !products.some(p => p.id === id)) return;
    const next = favorites.includes(id) ? favorites.filter(value => value !== id) : [...favorites, id];
    setFavorites(next);
    persistFavorites(next, true);
  }
  function upsert(product: Product) {
    setProducts(old => [product, ...old.filter(p => p.id !== product.id)]);
    if (loadState !== 'ready') void load();
  }
  function saved(product: Product) {
    upsert(product);
    setEditor(null);
    openProduct(product);
    toast.success('已保存到本机资料库');
  }
  function deleted(id: string) {
    setProducts(old => old.filter(p => p.id !== id));
    const nextFavorites = favorites.filter(value => value !== id);
    setFavorites(nextFavorites);
    persistFavorites(nextFavorites);
    setRecent(old => old.filter(value => value !== id));
    setDetail(null);
  }

  const openFavorites = () => {
    setOnlyFavorites(!onlyFavorites);
    setCategory('全部');
    setQuery('');
    changePage('collection');
  };
  const openCamera = () => {
    if (!ready) {
      toast.error(loadState === 'loading' ? '资料库还在读取，请稍候。' : '请先重新读取资料库，再拍照查货。');
      return;
    }
    setCamera(true);
  };

  return <div className="demo-stage personal-stage">
    <aside className="demo-desktop-caption" aria-hidden="true"><span>JELLYSHELF / YOUR COLLECTION</span><h2>A little shelf.<br/><em>A lot of love.</em></h2><p>一间装得下所有喜欢的<br/>软软收藏室。</p><div><span className="demo-caption-line"/>本机保存 · 从容查货</div></aside>
    <div className="demo-app personal-app">
      <header className="demo-header"><button type="button" className="demo-brand personal-brand" onClick={() => { resetFilters(); changePage('collection'); }} aria-label="JellyShelf 图册首页"><Flower/><span><strong>JellyShelf</strong><small>THE SOFT ARCHIVE</small></span></button><div className="demo-header-actions"><button type="button" className="personal-add" aria-label="新增商品" onClick={() => setEditor(blankProduct())}><Plus size={22} strokeWidth={1.6}/></button><button type="button" className="demo-header-heart" aria-label="查看我的收藏" aria-pressed={onlyFavorites} onClick={openFavorites}><Heart size={21} strokeWidth={1.5} fill={onlyFavorites ? 'currentColor' : 'none'}/>{ready && favorites.length > 0 && <i>{favorites.length}</i>}</button></div></header>

      {page === 'mine' ? <main className="demo-mine personal-mine">
        <div className="demo-mini-label">YOUR LITTLE WORLD</div><h1>喜欢的，都在这里。</h1><p className="demo-muted">每一份资料，留在你的设备里。</p>
        {ready && products.length > 0 ? <div className={'demo-profile-collage personal-collage count-' + Math.min(products.length, 3)}>{products.slice(0, 3).map((p, index) => <button type="button" key={p.id} className={'demo-profile-photo photo-' + index} style={{'--photo-bg': palette[index]} as CSSProperties} aria-label={`查看${displayName(p)}`} onClick={() => openProduct(p)}><Photo src={p.photos[0]} alt={displayName(p)}/></button>)}<span className="demo-profile-seal"><Flower/></span></div> : <div className="personal-shelf-seal"><Flower/><span>{ready ? '给第一只伙伴，留个位置。' : '你的收藏，正在等待打开。'}</span></div>}
        <div className="demo-profile-stats"><div><strong>{ready ? products.length : '—'}</strong><span>已录入款式</span></div><div><strong>{ready ? branchCount : '—'}</strong><span>尺寸 / 品相分支</span></div><div><strong>{ready ? favorites.length : '—'}</strong><span>我的心头好</span></div></div>
        {!ready && <LoadNotice state={loadState} error={error} onRetry={() => void load()} onBackup={() => setBackup(true)}/>}
        <button type="button" className="demo-menu-row" onClick={() => setEditor(blankProduct())}><Plus size={20}/><div><strong>新增一款商品</strong><span>照片、货号、品相与目标价</span></div><ChevronRight size={18}/></button>
        <button type="button" className="demo-menu-row" onClick={() => { setOnlyFavorites(true); setCategory('全部'); setQuery(''); changePage('collection'); }}><Heart size={20}/><div><strong>我的心头好</strong><span>快速找到收藏过的款式</span></div><ChevronRight size={18}/></button>
        <button type="button" className="demo-menu-row" onClick={() => setBackup(true)}><Archive size={20}/><div><strong>数据与备份</strong><span>导出完整备份，或合并恢复资料</span></div><ChevronRight size={18}/></button>
        <a className="demo-menu-row" href="privacy.html"><ShieldCheck size={20}/><div><strong>隐私政策</strong><span>了解资料和照片如何保存</span></div><ArrowUpRight size={18}/></a>
        <a className="demo-menu-row" href="support.html"><UserRound size={20}/><div><strong>帮助与支持</strong><span>使用说明与问题反馈</span></div><ArrowUpRight size={18}/></a>
        <p className="demo-mine-note">{ready && `${photoCount} 张已录入照片 · `}无需登录，资料保存在本机。<br/>换设备或清除应用数据前，请先导出备份。<br/>心头好为本机快捷标记，不包含在商品备份中。</p>
      </main> : <main className={'demo-main ' + (page === 'live' ? 'demo-live' : '')}>
        {!query && <div className="demo-intro"><div>{page === 'live' ? <><div className="demo-mini-label">READY WHEN YOU ARE</div><h1>直播查货台<span>.</span></h1><p>品名、货号，一眼找到。</p></> : <><h1>Little things,<br/><em>big love.</em></h1><p>让每一只，都被好好收藏。</p></>}</div><div className="demo-counter"><strong>{ready ? String(products.length).padStart(2, '0') : '—'}</strong><span>{ready ? '款已收录' : loadState === 'loading' ? '资料读取中' : '资料待恢复'}</span></div></div>}
        <div className="demo-search-dock"><label className="demo-search"><Search size={19} strokeWidth={1.6}/><input ref={searchRef} type="search" enterKeyHint="search" aria-label="搜索中文名、英文名或官方货号" placeholder="搜品名、货号，找到那一只" value={query} onChange={e => setQuery(e.target.value)}/>{query && <button type="button" aria-label="清空搜索" onClick={() => setQuery('')}><X size={16}/></button>}</label><button type="button" className="demo-scan" onClick={openCamera} aria-label="拍照查找本机商品"><Camera size={23} strokeWidth={1.7}/></button></div>
        <div className="demo-mode-note"><span className="demo-mode-dot"/>我的资料库<span>·</span>本机保存<span>·</span>美元 USD</div>

        {!ready ? <LoadNotice state={loadState} error={error} onRetry={() => void load()} onBackup={() => setBackup(true)}/> : products.length === 0 ? <section className="personal-empty"><div className="personal-empty-art" aria-hidden="true"><div/><span><Flower/></span><PackageOpen size={45} strokeWidth={1}/></div><div className="demo-mini-label">THE FIRST LITTLE COMPANION</div><h2>从第一只，开始收藏。</h2><p>添一张照片，记下名字与货号。<br/>下次直播，就能随手找到它。</p><button type="button" className="demo-filled-button" onClick={() => setEditor(blankProduct())}><Plus size={18}/>录入第一款商品</button><button type="button" className="personal-text-button" onClick={() => setBackup(true)}><Archive size={15}/>从备份恢复资料</button></section> : <>
          {showCover && <article className="demo-hero personal-hero" style={{'--photo-bg': palette[0]} as CSSProperties}><button type="button" className="demo-hero-open" onClick={() => openProduct(hero)} aria-label={`查看${displayName(hero)}`}><div className="demo-hero-kicker">THE SOFT EDIT<span>A PLACE FOR YOUR LITTLE THINGS</span></div><span className="demo-hero-arch"/><Photo src={hero.photos[0]} alt={displayName(hero)} className="demo-hero-image"/><div className="demo-hero-copy"><span>我的收藏封面</span><h2>{displayName(hero)}</h2><p>{hero.nameZh ? hero.nameEn : hero.category}</p></div><span className="demo-hero-arrow"><ArrowUpRight size={22} strokeWidth={1.5}/></span></button>{hero.photos.length > 1 && <button type="button" className="demo-hero-peek" onClick={() => openProduct(hero)} aria-label={`查看${displayName(hero)}的其他照片`}><Photo src={hero.photos[1]} alt={`${displayName(hero)}的另一个角度`}/><span>另一个角度 <ArrowUpRight size={11}/></span></button>}</article>}

          {page === 'live' && recentProducts.length > 0 && !query && <section className="demo-recents"><div className="demo-section-heading"><h2>刚刚看过</h2><span>RECENTLY VIEWED</span></div><div>{recentProducts.map((p, index) => <button type="button" key={p.id} onClick={() => openProduct(p)}><span style={{'--photo-bg': palette[index % palette.length]} as CSSProperties}><Photo src={p.photos[0]} alt={displayName(p)}/></span><small>{displayName(p)}</small></button>)}</div></section>}

          <div className="demo-section-heading personal-section-heading"><div><span className="demo-mini-label">{page === 'live' ? 'LIVE COMPANION' : 'THE COLLECTION'}</span><h2>{query ? '找到的软软伙伴' : onlyFavorites ? '我的心头好' : '一柜小欢喜'} <small>{filtered.length} 款</small></h2></div><button type="button" className={onlyFavorites ? 'is-filtered' : ''} aria-label={onlyFavorites ? '显示全部商品' : '只看收藏'} aria-pressed={onlyFavorites} onClick={() => setOnlyFavorites(value => !value)}><Heart size={15} fill={onlyFavorites ? 'currentColor' : 'none'}/>{onlyFavorites ? '已收藏' : '心头好'}</button></div>
          <div className="demo-filter-row personal-filters" aria-label="商品分类">{categories.map(item => <button type="button" key={item} aria-pressed={category === item} className={category === item ? 'active' : ''} onClick={() => setCategory(item)}>{item}</button>)}</div>

          {filtered.length === 0 ? <div className="demo-no-results"><Search size={28}/><h3>{onlyFavorites ? '这组里，还没有心头好。' : '暂时没有找到。'}</h3><p>{onlyFavorites ? '点一下照片上的爱心，把常用款留下。' : '试试英文名的一部分，或调整分类。'}</p><button type="button" onClick={resetFilters}>查看全部商品 <ArrowRight size={16}/></button></div> : page === 'live' ? <div className="personal-live-list">{filtered.map((p, index) => <article key={p.id} className="personal-live-card"><button type="button" className="personal-live-top" aria-label={`查看${displayName(p)}`} onClick={() => openProduct(p)}><span className="demo-live-photo" style={{'--photo-bg': palette[index % palette.length]} as CSSProperties}><Photo src={p.photos[0]} alt={displayName(p)}/></span><span className="demo-live-copy"><strong>{displayName(p)}</strong>{p.nameZh && p.nameEn && <small>{p.nameEn}</small>}<span>{p.variants.length} 个尺寸 / 品相分支</span></span><ChevronRight size={18}/></button><div className="personal-live-branches">{p.variants.map((v, branch) => <button type="button" key={v.id} className="personal-live-branch" aria-label={`查看${displayName(p)}分支 ${branch + 1}：${v.sku || '货号待填'}，${v.size || '尺寸待填'}，${v.condition || '品相待填'}`} onClick={() => openProduct(p, v.id)}><span><b>{v.condition || '品相待填'}</b><span>{v.size || '尺寸待填'}</span><small>{v.sku || '货号待填'}</small></span><span className="personal-branch-price"><small>目标成交价{p.variants.length > 1 ? ` · ${branch + 1}` : ''}</small><strong className={v.targetLow === null || v.targetHigh === null ? 'personal-unfilled' : ''}>{targetPrice(v)}</strong></span></button>)}</div></article>)}</div> : <div className="demo-grid personal-grid">{filtered.map((p, index) => <article key={p.id} className="demo-card" style={{'--photo-bg': palette[index % palette.length]} as CSSProperties}><div className="demo-card-visual"><button type="button" onClick={() => openProduct(p)} aria-label={`查看${displayName(p)}`}><Photo src={p.photos[0]} alt={displayName(p)}/><span className="demo-card-photo-count"><ImageIcon size={11}/>{p.photos.length}</span></button><Favorite product={p} active={favorites.includes(p.id)} onClick={() => favorite(p.id)}/></div><button type="button" className="demo-card-copy" onClick={() => openProduct(p)}><span className="demo-card-sku">{p.variants[0]?.sku || '货号待填写'}</span><h3>{displayName(p)}</h3><p>{p.nameZh ? p.nameEn || '英文名待填写' : p.category}</p><span className="personal-card-price-label">{p.variants.length > 1 ? '首个分支目标价' : '目标成交价'}</span><strong className={'personal-card-price ' + (p.variants[0]?.targetLow === null || p.variants[0]?.targetHigh === null ? 'personal-unfilled' : '')}>{targetPrice(p.variants[0])}</strong><span className="personal-card-branch"><span>{p.variants[0]?.condition || '品相待填'}</span><span>{p.variants.length} 个分支 <ChevronRight size={11}/></span></span></button></article>)}</div>}
          <footer className="demo-endnote"><span/>Made of little happy things.<span/></footer>
        </>}
      </main>}

      <nav className="demo-bottom-nav" aria-label="主要导航"><button type="button" className={page === 'collection' ? 'active' : ''} aria-current={page === 'collection' ? 'page' : undefined} onClick={() => changePage('collection')}><Library size={22} strokeWidth={1.5}/><span>图册</span></button><button type="button" onClick={openCamera}><Camera size={22} strokeWidth={1.5}/><span>拍照</span></button><button type="button" className={page === 'live' ? 'active' : ''} aria-current={page === 'live' ? 'page' : undefined} onClick={() => changePage('live')}><Radio size={22} strokeWidth={1.5}/><span>直播</span></button><button type="button" className={page === 'mine' ? 'active' : ''} aria-current={page === 'mine' ? 'page' : undefined} onClick={() => changePage('mine')}><UserRound size={22} strokeWidth={1.5}/><span>我的</span></button></nav>
    </div>

    {editor && <ProductEditor key={editor.id} product={editor} onClose={() => setEditor(null)} onSaved={saved}/>}
    {detail && <ProductDetail key={detail.id + ':' + (detailVariantId || '')} product={detail} initialVariantId={detailVariantId} days={90} combined isSample={false} onClose={() => setDetail(null)} onEdit={() => { setEditor(detail); setDetail(null); }} onDeleted={() => deleted(detail.id)} onSaved={p => { upsert(p); setDetail(p); }}/>}
    <PhotoSearch open={camera} products={products} onClose={() => setCamera(false)} onSelect={p => { setCamera(false); openProduct(p); }}/>
    <BackupPanel open={backup} onClose={() => setBackup(false)} onRestored={() => { setDetail(null); resetFilters(); void load(); }}/>
    <Toaster richColors position="top-center" offset={{top:'calc(env(safe-area-inset-top) + 16px)'}} mobileOffset={{top:'calc(env(safe-area-inset-top) + 16px)',left:16,right:16}}/>
  </div>;
}

function LoadNotice({state, error, onRetry, onBackup}: {state: LoadState; error: string; onRetry: () => void; onBackup: () => void}) {
  if (state === 'loading') return <section className="personal-load-state" role="status"><Loader2 className="spin" size={25}/><h2>正在打开收藏室…</h2><p>读取本机保存的商品与照片。</p></section>;
  return <section className="personal-load-state" role="alert"><AlertCircle size={28}/><h2>资料暂时没有打开。</h2><p>{error}</p><button type="button" className="demo-filled-button" onClick={onRetry}><RefreshCw size={17}/>重新读取</button><button type="button" className="personal-text-button" onClick={onBackup}><Archive size={16}/>打开备份与恢复</button></section>;
}
