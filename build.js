import { build } from 'esbuild';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { builtinModules } from 'module';

const __dirname = dirname(fileURLToPath(import.meta.url));

const nodeExternals = [
  ...builtinModules,
  ...builtinModules.map((m) => `node:${m}`),
  'fastify',
];

await build({
  entryPoints: [resolve(__dirname, 'src/index.ts')],
  outfile: resolve(__dirname, 'dist/index.js'),
  platform: 'node',
  target: 'node20',
  format: 'esm',
  bundle: true,
  minify: false,
  sourcemap: true,
  external: nodeExternals,
  banner: {
    js: `import { createRequire } from 'module'; const require = createRequire(import.meta.url);`,
  },
  logLevel: 'info',
});
console.log('Backend built → dist/index.js');

const frontendCommon = {
  platform: 'browser',
  target: ['es2022'],
  format: 'esm',
  bundle: true,
  minify: false,
  sourcemap: true,
  jsx: 'automatic',
  jsxImportSource: 'react',
  external: ['react', 'react-dom', 'react/jsx-runtime'],
  logLevel: 'info',
};

await build({
  ...frontendCommon,
  entryPoints: [resolve(__dirname, 'frontend/index.tsx')],
  outfile: resolve(__dirname, 'dist/frontend/index.js'),
});
console.log('Frontend (admin) built → dist/frontend/index.js');

await build({
  ...frontendCommon,
  entryPoints: [resolve(__dirname, 'frontend/hooks/avatar.menu.tsx')],
  outfile: resolve(__dirname, 'dist/frontend/hooks/avatar.menu.js'),
});
console.log('Frontend (avatar.menu hook) built → dist/frontend/hooks/avatar.menu.js');
