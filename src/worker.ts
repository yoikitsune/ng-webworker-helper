import * as http from 'http';

export class WorkerClass {
	source:any;
	constructor (source) {
		this.source = source;
	}
}

export class WorkerMessage {
	source:any;
	id:number;
	method:string;
	data:any[];
	
  constructor (source, data) {
    this.source = source;
	this.id = data.pop ();
	this.method = data.shift ();
	this.data = data;
  }
  
  exec () {
	  let p = new Promise<any> ((resolve, reject) => {
		if (this.source[this.method]) {
			this.data.push (resolve);
			this.source[this.method].apply (this.source, this.data);
		}
		else
			reject ("worker : no method " + this.method + " found");
	}).then (res => {
		return { id : this.id, data : res };
	});
	return p;
  }
}

export class BaseWorker {
	ctx:Worker;
	constructor () {
		this.ctx = self as any;
		this.ctx.addEventListener ('message', e => {
			let workerClass = e.data.pop ();
			let source = workerClass == "this"?this:this[workerClass];
			if (source) {
				let message = new WorkerMessage (source, e.data);
				message.exec ().then (res => this.ctx.postMessage (res)); 
			}
			else
				console.error ("unknown source ", e);
		});
	}

	getFile (url, json?) {
		let headers = json?{'Accept': 'application/json'}:{}
		return new Promise ((resolve, reject) => {
			let options = {
			  hostname: 'localhost',
			  port: 3000,
			  path: url,
			  method: 'GET',
			  headers: headers
			};
			let req = http.request (options, response => {
				//const { statusCode } = response;
				//console.log(`STATUS: ${response.statusCode}`);
				//console.log(`HEADERS: ${JSON.stringify(response.headers)}`);
				if (response.statusCode == 200) {
					let readStream = function () {
						return new Promise<any> ((resolve, reject) => {
							var content = "";
							response.on('data', function (chunk) {
								content += chunk;
							});
							response.on('end', function () {
								resolve (content);
							});
						});
					}
					let type = response.headers['content-type'];
					if (type) {
						let pos = type.indexOf(";");
						if (pos != -1) type = type.substring (0,pos);
					 }
					switch (type) {
						case 'application/octet-stream':
							resolve (response);
							break;
						case 'application/json':
							response.setEncoding('utf8');
							readStream ().then (content => {
								try {
									resolve (JSON.parse (content));
								} catch (e) {
									console.error (e);
									console.log (content);
								}
							});
							break;
						default:
							response.setEncoding('utf8');
							readStream ().then (content => {
								resolve (content);
							});
							break;
					}
				}
				else {
					response.resume ();
					console.error ("http.get : file not retrieved " + url);
				}
			});
			req.on('error', (e) => {
			  console.error(`problem with request: ${e.message}`);
			});
			req.end();
		});
	}
}
