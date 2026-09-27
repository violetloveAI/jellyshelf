import React, {lazy, Suspense} from 'react';
import {createRoot} from 'react-dom/client';
import CatalogApp from '@/components/catalog-app';
import './globals.css';
import './cream.css';
const DemoApp=lazy(()=>import('@/components/demo-app'));
const demo=new URLSearchParams(window.location.search).get('demo')==='1';
createRoot(document.getElementById('root')!).render(<React.StrictMode>{demo?<Suspense fallback={<div style={{padding:40,textAlign:'center',color:'#8d6747'}} role="status">正在打开软软收藏室…</div>}><DemoApp/></Suspense>:<CatalogApp/>}</React.StrictMode>);
