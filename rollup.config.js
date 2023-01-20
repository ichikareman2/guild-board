import {defineConfig} from 'rollup'
import {rollupPluginHTML as html} from '@web/rollup-plugin-html';
import json from '@rollup/plugin-json'
import typescript from '@rollup/plugin-typescript'
import { babel } from '@rollup/plugin-babel';
import htmlFileAsString from './rollup-plugins/html-file-as-string.plugin.js';
import nodeResolve from '@rollup/plugin-node-resolve';
import postcss from 'rollup-plugin-postcss';
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer';


const config = defineConfig({
    input: 'src/index.html',
    output: {dir: 'dist'},
    plugins: [
        htmlFileAsString(),
        nodeResolve(),
        typescript(),
        json(),
        html(),
        babel({ babelHelpers: 'bundled' }),
        postcss({
            plugins: [
                tailwindcss(),
                autoprefixer,
            ]
        }),
    ]
})

export default config;