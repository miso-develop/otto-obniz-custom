@echo off

start tsc -w
timeout 5

start nodemon --watch dist dist/index.js
