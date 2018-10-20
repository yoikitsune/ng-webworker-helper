#!/usr/bin/env node
"use strict";
const Generator = require("../src/generator").Generator;
if (process.argv[2]) {
	let g = new Generator(process.argv[2]);
	let content = g.template(__dirname + "/../definitions.tpl");
	console.log(content);
	process.exit(0);
}
console.log ("no file specified");
process.exit(1);
