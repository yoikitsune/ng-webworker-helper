#!/usr/bin/env node
"use strict";
const Generator = require("../src/generator").Generator;
const Utils = require ("../src/utils");
if (process.argv[2]) {
	let g = new Generator(process.argv[2]);
	console.log(Utils.template(__dirname + "/../definitions.tpl", g.service));
	process.exit(0);
}
console.log ("no file specified");
process.exit(1);
