import {fileURLToPath, URL} from 'node:url'

import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        vue(),
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    },
    server: {
        proxy: {
            "/newapi": {
                //target是代理的目标路径
                target: "https://hnust.rick.icu/new/newapi",
                changeOrigin: true, //必须要开启跨域
                rewrite: (path) => path.replace(/^\/newapi/, ""),
            },
        },
    },
    base: '/new/'
});
