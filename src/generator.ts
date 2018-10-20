const ts = require("typescript")
const fs = require ("fs");
const handlebars = require('handlebars');

interface Types {
	[key:number]: string;
}
const types:Types = {
	137 : "string",
	162 : "function"
};

class ClassInfo {
	properties : PropertyInfo[] = [];
	methods:MethodInfo[] = [];
	constructor (
		public name:string,
		public parent:string,
	) {};
}
class PropertyInfo {
	constructor (
		public name:string,
		public type:string,
	) {};
}
class MethodInfo {
	params:ParamInfo[] = [];
	propertyName : string = "";
	constructor (
		public name:string,
	) {};
	get header () {
		let h:string[] = [];
		this.params.forEach (p => h.push(p.getString()));
		return h.join (",");
	}
	get body () {
		let b: string [] = ['"'+this.name+'"'];
		this.params.forEach (p => b.push(p.name));
		return "["+b.join (",")+"]";
	}
}
class ParamInfo {
	type : number | string;
	constructor (
		public name:string,
		type:number
	) {
		this.type = types[type]?types[type]:type;
	};
	getString () {
		return this.name + ":" + this.type;
	}
}

class Service extends ClassInfo {
	constructor (name, parent,
	  public properties:PropertyInfo[],
	  public methods:MethodInfo[],
	  public workerClasses:ClassInfo[],
	  workerClassesIndex) {
		super (name, parent);
		//this.methods = service.methods;
		//this.properties = service.properties;
		//this.classes = workerClasses;

		this.properties.forEach (prop => {
			let worker = workerClassesIndex [prop.type];
			if (worker) {
				worker.methods.forEach (method => {
					method.propertyName = prop.name;
				});
			}
		});
	}
}

export class Generator {
	service:Service | null;

	constructor (file) {
		this.service = this.parseJs (file);
		if (!this.service) throw ("Js Parsing interrupt");
	}

	public template (file) {
		const template = handlebars.compile(
			fs.readFileSync(file).toString(),
			{ strict: true, noEscape : true }
		);
		const res = template(this.service);
		return res;
	}	

	private getType (kind:number):string | number {
		return types[kind]?types[kind]:kind;
	}
	
	private parseJs (file):Service | null {
		let tsSourceFile = ts.createSourceFile(
		  file,
		  fs.readFileSync(file).toString(),
		  ts.ScriptTarget.latest
		);
		let service : any = null;
		let workerClasses : ClassInfo[] = [];
		let workerClassesIndex : { [key:string] :ClassInfo } = {};
		let parse = function (statement) {
			if (statement.heritageClauses) {
				// found a class
				let newClass:ClassInfo = new ClassInfo (
					statement.name.escapedText,
					statement.heritageClauses[0].types[0].expression.escapedText
				);
				if (newClass.parent == "BaseWorker")
					service = newClass;
				else {
					workerClasses.push (newClass);
					workerClassesIndex [newClass.name] = newClass;
				}
				statement.members.forEach (member => {
					if (member.kind == 154) {
						// found a method
						let method:MethodInfo = new MethodInfo (
							member.name.escapedText
						);
						newClass.methods.push (method);
						member.parameters.forEach (param => {
							// found a param
							if (param.name.escapedText != "resolve")
								method.params.push (new ParamInfo (
									param.name.escapedText,
									param.type.kind
								));
						});
					}
					else if (member.kind == 152) {
						// found a property
						let prop = new PropertyInfo (
							member.name.escapedText,
							member.type.typeName.escapedText
						);
						newClass.properties.push (prop);
					}
				});
			}
		}
		tsSourceFile.statements.forEach (s => parse (s));
		if (service)
			return new Service (
				service.name,
				service.parent,
				service.properties,
				service.methods,
				workerClasses,
				workerClassesIndex
			);
		return null;
	}
	
}
