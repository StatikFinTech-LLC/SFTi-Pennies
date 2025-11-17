import esbuild from 'esbuild';
import { copyFile, mkdir } from 'fs/promises';
import { dirname } from 'path';

// Ensure the output directory exists
const outdir = './index.directory/assets/js';
await mkdir(outdir, { recursive: true });

// Build the main bundle
await esbuild.build({
  entryPoints: ['./index.directory/src/main.js'],
  bundle: true,
  minify: true,
  outfile: './index.directory/assets/js/bundle.min.js',
  format: 'iife',
  globalName: 'AppBundle',
  platform: 'browser'
});

// Copy PDF.js worker file
await copyFile(
  './node_modules/pdfjs-dist/build/pdf.worker.min.mjs',
  './index.directory/assets/js/pdf.worker.min.mjs'
);

console.log('✅ Bundle built successfully: index.directory/assets/js/bundle.min.js');
console.log('✅ PDF.js worker copied: index.directory/assets/js/pdf.worker.min.mjs');

