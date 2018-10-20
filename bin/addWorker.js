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

let checkDir = function (dir) { if (!fs.existsSync(dir)) fs.mkdirSync(dir); };
checkDir ("./src");
checkDir ("./src/"+workerName);
checkDir ("./build");

let checkCopy = function (file, path) {
   if (!fs.existsSync(file))
    fs.copyFileSync (__dirname + "/../"+file, "./"+(path?path+"/":"")file);
};
checkCopy ("options.json")
checkCopy ("tsconfig.json")

const serviceFile = "./build/workerService.ts";
if (!fs.existsSync(serviceFile)) {
  fs.copyFileSync (__dirname + "/../src/workerService.ts", serviceFile);
}

const indexTs = "./index.ts";
if (!fs.existsSync(indexTs)) {
  let content = `export * from './build/definitions';
export { WorkerService } from './workerService';`;
  write (indexTs, content).then (() => {
    console.log ("Files created.");
  });
}

const createFile (source, target, data) {
  const template = handlebars.compile(fs.readFileSync(source).toString(), { strict: true, noEscape: true });
  const res = template(data);
  write (target, res).then (() => {
  });
}

const fileName = "./src/"+workerName+"/index.ts";
if (!fs.existsSync(fileName))
  createFile (__dirname+"/../worker.tpl", fileName, { name : workerName })
