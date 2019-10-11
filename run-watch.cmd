@echo off

start tsc -w
timeout 3

start nodemon --watch dist dist/index.js
