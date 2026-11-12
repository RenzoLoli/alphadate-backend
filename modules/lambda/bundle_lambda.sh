#!/bin/bash

set -e

lambda_path="$1" # src/interfaces/lambdas/*
sourcepoint="$2" # app.ts
entrypoint="$3"  # app.handler

if [ -z "$entrypoint" ]; then
  echo "Missing entrypoint"
  exit 1
fi

if [ -z "$lambda_path" ]; then
  echo "Missing lambda_path"
  exit 1
fi

if [ -z "$sourcepoint" ]; then
  echo "Missing sourcepoint"
  exit 1
fi

echo "Bundling lambda $lambda_path"

outdir="$lambda_path/dist"
outfile="$outdir/app.js"

echo "  source:    $sourcepoint"
echo "  entrypoint $entrypoint"
echo "  output:    $outfile"

npx esbuild "$lambda_path/$sourcepoint" \
  --bundle \
  --platform=node \
  --target=node22 \
  --minify \
  --format=cjs \
  --sourcemap \
  --outfile="$outfile"

handler="${entrypoint#*.}"
if [ "$handler" != "handler" ]; then
  echo "Warning: handler is 'app.$handler', Terraform expects 'app.handler'"
fi

echo "Bundled $lambda_path -> $outfile"
