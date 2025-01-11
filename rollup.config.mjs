import alias from '@rollup/plugin-alias';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import sass from 'rollup-plugin-sass';
import typescript from '@rollup/plugin-typescript';
import svgr from '@svgr/rollup';
import babel from '@rollup/plugin-babel';

export default {
    input: 'src/index.ts',
    output: [
        /* Build ES Modules */
        {
            file: 'dist/index.js',
            format: 'esm',
            sourcemap: true,
        },

        /* Build CommonJS */
        {
            file: 'dist/index.cjs',
            format: 'cjs',
            sourcemap: true,
        }
    ],
    external: ['react', 'react-dom', 'proj4', '../../../package.json'], // , 'react/jsx-runtime'
    plugins: [
        babel({
            babelHelpers: 'bundled',
            presets: [
                '@babel/preset-react',
                '@babel/preset-typescript',
            ],
            plugins: [
                '@babel/plugin-syntax-import-assertions',
            ],
            extensions: ['.js', '.jsx', '.ts', '.tsx'],
            compact: false,
        }),
        alias({
            entries: [
                { find: 'react/jsx-runtime', replacement: 'react/jsx-runtime.js' }
            ]
        }),
        json(),
        resolve(),
        commonjs(),
        typescript({
            tsconfig: './tsconfig.json',
            sourceMap: true,
            declaration: true,
            declarationDir: 'dist/types',
        }),
        sass({
            output: 'dist/styles.css',
        }),
        svgr(),
    ],
}
