#!/bin/bash

# clean out dist folder
rm -rf ./dist
mkdir ./dist

# build main.js
rollup --config rollup.config.js

# compile scss into css
npx sass ./styles/global.scss ./dist/styles.css --no-source-map
