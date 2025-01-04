import sass from 'rollup-plugin-sass';
import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import alias from '@rollup/plugin-alias';
import commonjs from '@rollup/plugin-commonjs';

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
    external: ['react', 'react-dom', 'proj4'], // , 'react/jsx-runtime'
    plugins: [
        typescript({
            tsconfig: './tsconfig.json',
        }),
        sass({
            output: 'dist/styles.css',
        }),
        alias({
            entries: [
                {find: 'react/jsx-runtime', replacement: 'react/jsx-runtime.js'}
            ]
        }),
        resolve(),
        commonjs(),
    ],
}
