#!/usr/bin/env node
"use strict";
const Utils = require ("../src/utils");
const fs = require('fs');
if (!process.argv [2]) {
  console.log ("Specify a worker name")
  process.exit (1);
}

Utils.checkInstall (__dirname);

const workerName = process.argv [2];
Utils.checkDir ("./src/"+workerName);
const fileName = "./src/"+workerName+"/index.ts";
if (!fs.existsSync(fileName)) {
  let res = Utils.template (__dirname+"/../worker.tpl", fileName, { name : workerName });
  Utils.write (fileName);
}

/*
const serviceFile = "./build/workerService.ts";
if (!fs.existsSync(serviceFile)) {
  fs.copyFileSync (__dirname + "/../src/workerService.ts", serviceFile);
}

const indexTs = "./index.ts";
if (!fs.existsSync(indexTs)) {
  let content = `export * from './build/definitions';
export { WorkerService } from './workerService';`;
  Utils.write (indexTs, content).then (() => {
    console.log ("Files created.");
  });
}
*/
