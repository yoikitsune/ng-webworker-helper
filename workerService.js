"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rxjs_1 = require("rxjs");
/*export function CustomInjectable(annotation: any) {
  return function (target: Function) {
    var parentTarget = Object.getPrototypeOf(target.prototype).constructor;
    var parentParamTypes = Reflect.getMetadata('design:paramtypes', parentTarget);
    var parentParameters = Reflect.getMetadata('parameters', parentTarget);

    Reflect.defineMetadata('design:paramtypes', parentParamTypes, target);
    Reflect.defineMetadata('parameters', parentParameters, target);
  }
}*/
class WorkerService {
    constructor(file) {
        this.spool = [];
        this.messages = {};
        this.id = 0;
        this.worker = new Worker(file);
        this.observable = rxjs_1.fromEvent(this.worker, 'message');
        this.observable.subscribe(r => {
            let data = r["data"];
            let message = this.messages[data.id];
            message.subject.next(data.data);
            this.spool.splice(this.spool.indexOf(data.id), 1);
            if (this.spool.length == 0)
                this.id = 0;
            delete this.messages[message.id];
        });
    }
    get(args, workerClass) {
        let message = new WorkerMessage(this.id++, args, workerClass);
        this.messages[message.id] = message;
        this.spool.push(message.id);
        this.worker.postMessage(message.data);
        return message.$onDone;
    }
}
exports.WorkerService = WorkerService;
class WorkerServiceClass {
    constructor(service) {
        this.service = service;
    }
}
exports.WorkerServiceClass = WorkerServiceClass;
class WorkerMessage {
    constructor(id, data, workerClass) {
        this.id = id;
        this.data = data;
        this.workerClass = workerClass;
        this.data.push(id);
        this.data.push(workerClass);
        this.subject = new rxjs_1.Subject();
        this.$onDone = this.subject.asObservable();
    }
}
