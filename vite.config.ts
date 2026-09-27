import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {fileURLToPath} from 'node:url';
export default defineConfig(({mode})=>({base:'./',plugins:[react()],resolve:{alias:{'@':fileURLToPath(new URL('.',import.meta.url))}},server:{port:5176,strictPort:true},build:{target:'es2022',outDir:mode==='native'?'dist-native':'dist'}}));
