import React from 'react';
import {createRoot} from 'react-dom/client';
import CatalogApp from '@/components/catalog-app';
import './globals.css';
import './cream.css';
createRoot(document.getElementById('root')!).render(<React.StrictMode><CatalogApp/></React.StrictMode>);
