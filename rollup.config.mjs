import alias from '@rollup/plugin-alias';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import sass from 'rollup-plugin-sass';
import typescript from '@rollup/plugin-typescript';

export default {
    input: 'src/index.ts',
    output: [
        {
            file: 'dist/index.js',
            format: 'esm',
            sourcemap: true,
        },
        {
            file: 'dist/index.cjs',
            format: 'cjs',
            sourcemap: true,
        }
    ],
    external: ['react', 'react-dom', 'proj4', '../../../package.json'], // , 'react/jsx-runtime'
    plugins: [
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
    ],
}
