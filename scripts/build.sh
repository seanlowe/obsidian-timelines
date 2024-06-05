#!/bin/bash

# clean out dist folder
rm -rf ./dist
mkdir ./dist

# build main.js
npx rollup --config rollup.config.js --bundleConfigAsCjs

# compile scss into css
npx sass ./styles/global.scss ./dist/styles.css --no-source-map

# make a copy of manifest.json
cp ./manifest.json ./dist/manifest.json
