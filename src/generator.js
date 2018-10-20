"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
const fs = require("fs");
const handlebars = require('handlebars');
const types = {
    137: "string",
    162: "function"
};
class ClassInfo {
    constructor(name, parent) {
        this.name = name;
        this.parent = parent;
        this.properties = [];
        this.methods = [];
    }
    ;
}
class PropertyInfo {
    constructor(name, type) {
        this.name = name;
        this.type = type;
    }
    ;
}
class MethodInfo {
    constructor(name) {
        this.name = name;
        this.params = [];
        this.propertyName = "";
    }
    ;
    get header() {
        let h = [];
        this.params.forEach(p => h.push(p.getString()));
        return h.join(",");
    }
    get body() {
        let b = ['"' + this.name + '"'];
        this.params.forEach(p => b.push(p.name));
        return "[" + b.join(",") + "]";
    }
}
class ParamInfo {
    constructor(name, type) {
        this.name = name;
        this.type = types[type] ? types[type] : type;
    }
    ;
    getString() {
        return this.name + ":" + this.type;
    }
}
class Service extends ClassInfo {
    constructor(name, parent, properties, methods, workerClasses, workerClassesIndex) {
        super(name, parent);
        this.properties = properties;
        this.methods = methods;
        this.workerClasses = workerClasses;
        //this.methods = service.methods;
        //this.properties = service.properties;
        //this.classes = workerClasses;
        this.properties.forEach(prop => {
            let worker = workerClassesIndex[prop.type];
            if (worker) {
                worker.methods.forEach(method => {
                    method.propertyName = prop.name;
                });
            }
        });
    }
}
class Generator {
    constructor(file) {
        this.service = this.parseJs(file);
        if (!this.service)
            throw ("Js Parsing interrupt");
    }
    template(file) {
        const template = handlebars.compile(fs.readFileSync(file).toString(), { strict: true, noEscape: true });
        const res = template(this.service);
        return res;
    }
    getType(kind) {
        return types[kind] ? types[kind] : kind;
    }
    parseJs(file) {
        let tsSourceFile = ts.createSourceFile(file, fs.readFileSync(file).toString(), ts.ScriptTarget.latest);
        let service = null;
        let workerClasses = [];
        let workerClassesIndex = {};
        let parse = function (statement) {
            if (statement.heritageClauses) {
                // found a class
                let newClass = new ClassInfo(statement.name.escapedText, statement.heritageClauses[0].types[0].expression.escapedText);
                if (newClass.parent == "BaseWorker")
                    service = newClass;
                else {
                    workerClasses.push(newClass);
                    workerClassesIndex[newClass.name] = newClass;
                }
                statement.members.forEach(member => {
                    if (member.kind == 154) {
                        // found a method
                        let method = new MethodInfo(member.name.escapedText);
                        newClass.methods.push(method);
                        member.parameters.forEach(param => {
                            // found a param
                            if (param.name.escapedText != "resolve")
                                method.params.push(new ParamInfo(param.name.escapedText, param.type.kind));
                        });
                    }
                    else if (member.kind == 152) {
                        // found a property
                        let prop = new PropertyInfo(member.name.escapedText, member.type.typeName.escapedText);
                        newClass.properties.push(prop);
                    }
                });
            }
        };
        tsSourceFile.statements.forEach(s => parse(s));
        if (service)
            return new Service(service.name, service.parent, service.properties, service.methods, workerClasses, workerClassesIndex);
        return null;
    }
}
exports.Generator = Generator;
