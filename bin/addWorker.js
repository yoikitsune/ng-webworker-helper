#!/usr/bin/env node
"use strict";
const util = require('util');
const fs = require('fs');
const handlebars = require('handlebars');
const write = util.promisify (fs.writeFile);
if (!process.argv [2]) {
  console.log ("Specify a worker name")
  process.exit (0);
}
const workerName = process.argv [2];

if (!fs.existsSync("./src")){
    fs.mkdirSync("./src");
}
if (!fs.existsSync("./src/"+workerName)){
    fs.mkdirSync("./src/"+workerName);
}
const fileName = "./src/"+workerName+"/index.ts";
if (!fs.existsSync(fileName)) {
  const template = handlebars.compile(fs.readFileSync("worker.tpl").toString(), { strict: true, noEscape: true });
  const res = template({ name : workerName });
  write (fileName, res).then (() => {
    console.log (arguments);
  });
}

const optionsFile = "./options.json";
if (!fs.existsSync(optionsFile)) {
  fs.copyFileSync (__dirname + "/options.json", optionsFile);
}

const tsFile = "./tsconfig.json";
if (!fs.existsSync(tsFile)) {
  fs.copyFileSync (__dirname + "/tsconfig.json", tsFile);
}
