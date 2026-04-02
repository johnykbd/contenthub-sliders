#!/usr/bin/env node

const { sassPlugin } = require("esbuild-sass-plugin");

require("esbuild")
    .build({
        entryPoints: ['src/index.tsx'],
        bundle: true,
        minify: true,
        format: 'esm',
        sourcemap: true,
        outfile: 'dist/index.js',
        plugins: [
            sassPlugin({ type: "style" }),
        ],
    }).catch(() => process.exit(1));