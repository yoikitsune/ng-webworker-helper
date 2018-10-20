#!/usr/bin/env node
"use strict";
const fs = require('fs');
const Generator = require("../src/generator").Generator;
const { spawn } = require('child_process');
const options = require (process.env.PWD + "/options.json");
const path = require ("path");

function exec (cmd, args) {
  return new Promise ((resolve, reject) => {
    const child = spawn(cmd, args);
    let data = "";
    let error = false;

    child.on ("error", e => {
      console.log ("Fatal error : " + cmd + " " + args.join (" "), e);
      error = true;
    });

    child.stdout.on('data', (d) => {
      data += d.toString ();
    });

    child.stderr.on('data', (error) => {
      data += error.toString ();
      error = true;
    });

    child.on('exit', function (code, signal) {
      if (error || code != 0)
        reject ({cmd : cmd + " " + args.join (" "), e : "stderr", data : data});
      else
        resolve (data);
    });
  });
}

const sourceDir = process.env.PWD + '/' + options.workersPath;
let fileContent = "";
let workers = [];
new Promise ((resolve, reject) => {
  const folders = fs.readdirSync (sourceDir);
  const next = function (i) {
    if (i < folders.length ) {
      let dir = folders[i];
      workers.push (dir);
      process.stdout.write ("Creating "+dir+"....");
      let args = [
        path.resolve (sourceDir, dir, 'index.js'),
        "-o",
        "./.build/"+dir+".js",
        "-d"
      ];
      exec ('browserify', args)
        .then (() => {
          exec (__dirname + "/generate.js", [path.resolve (sourceDir, dir, "index.ts")])
            .then (r => {
              fileContent += r;
              process.stdout.write ("done.\n");
              next (i+1);
            })
            .catch (e => {
              process.stdout.write ("error.\n");reject (e);
            });
        }).catch (e => {
          process.stdout.write ("error.\n");reject (e);
        });
    }
    else {
      resolve ();
    }
  };
  next (0);
}).then (() => {
  new Promise ((resolve, reject) => {
    fileContent = 'import { WorkerClass, WorkerService } from "./workerService";\n' + fileContent;
    fs.writeFile(options.projectPath+"/src/app/"+options.definitionFile, fileContent, function(err) {
        if(err) reject (err);
        workers.forEach (name => {
          fs.rename ("./.build/"+name+".js", options.projectPath + "/src/assets/"+name+".js", err => {
            if(err) reject (err);
            resolve ();
          })
        })
    })
  }).then (() => { console.log ("Files installed.");process.exit (0); })
  .catch ((err) => { console.error (err);process.exit (1); });
}).catch ((e) => {
  if (e.cmd) {
    console.error ("Error on " + e.cmd);
    console.log (e.data);
  }
  else {
    console.log (e);
  }
  process.exit (1);
});
/*
set -e
moduleDir
sourceDir=$(realpath "./src");
targetDir=$(realpath "../chess/");
echo '' > ./dist/$defFileName
for f in $sourceDir/*; do
	name=$(basename $f);
	echo -n "Create $name...";
	browserify $sourceDir/$name/index.js -o ./dist/$name.js -d
	./node_modules/generate.js $sourceDir/$name/index.ts >> ./dist/$defFileName
	echo "done.";
done

definitionsPath="$targetDir/src/app"
mv ./dist/$defFileName $definitionsPath/

webWorkerPath="$targetDir/src/assets"
mv ./dist/* $webWorkerPath

echo "Done."*/
