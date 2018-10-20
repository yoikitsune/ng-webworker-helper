"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require('fs');
const util = require('util');
const handlebars = require('handlebars');
const write = util.promisify(fs.writeFile);
class Utils {
    static checkInstall(currentDir) {
        Utils.currentDir = currentDir;
        Utils.checkDir("src");
        Utils.checkDir("build");
        Utils.checkCopy("options.json");
        Utils.checkCopy("tsconfig.json");
    }
    static checkCopy(file, path) {
        if (!fs.existsSync(file))
            fs.copyFileSync(Utils.currentDir + "/../" + file, "./" + (path ? path + "/" : ""), file);
    }
    static checkDir(dir) {
        if (!fs.existsSync(Utils.currentDir + "/" + dir))
            fs.mkdirSync(dir + "/" + dir);
    }
    static write(file, data) {
        return write(file, data);
    }
    static template(source, data) {
        const tpl = handlebars.compile(fs.readFileSync(source).toString(), { strict: true, noEscape: true });
        return tpl(data);
    }
}
Utils.currentDir = "";
exports.Utils = Utils;
