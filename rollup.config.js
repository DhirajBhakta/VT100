import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';

const resolveBinaryPlugin = () => ({
	name: 'rollup-plugin-unresolve-binaries',
	resolveId: (source) => {
		if (source.endsWith('.node')) {
			return false;
		}
		return null;
	},
	banner: '#!/usr/bin/env node'
});

export default [{
	input: 'src/index.ts',
	output: {
		file: '.bin/index.js',
		format: 'es'
	},
	plugins: [typescript(),commonjs(),resolveBinaryPlugin()]
}, {
	input: 'src/scripts/master.ts',
	output: {
		file: '.bin/scripts/master.js',
		format: 'es'
	},
	plugins: [typescript(), commonjs()]
}, {
	input: 'src/scripts/metrics.ts',
	output: {
		file: '.bin/scripts/metrics.js',
		format: 'es'
	},
	plugins: [typescript(), commonjs()]
}];