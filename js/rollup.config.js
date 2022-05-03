import resolve from '@rollup/plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: 'src/degausser.js',
  output: {
    file: 'dist/degausser.js',
    format: 'umd',
    name: 'degausser'
  },
  plugins: [
    resolve(),
    commonjs({
      include: /node_modules/,
    }),
    babel({
      exclude: 'node_modules/**' // only transpile our source code
    })
  ]
};
