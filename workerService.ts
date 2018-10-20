import { Observable, Subject, BehaviorSubject, fromEvent } from 'rxjs';
import { first, map } from 'rxjs/operators';
/*export function CustomInjectable(annotation: any) {
  return function (target: Function) {
    var parentTarget = Object.getPrototypeOf(target.prototype).constructor;
    var parentParamTypes = Reflect.getMetadata('design:paramtypes', parentTarget);
    var parentParameters = Reflect.getMetadata('parameters', parentTarget);

    Reflect.defineMetadata('design:paramtypes', parentParamTypes, target);
    Reflect.defineMetadata('parameters', parentParameters, target);
  }
}*/

export class WorkerService {
  worker:Worker;
  observable:Observable<Event>;
  spool : number[] = [];
  messages:{} = {};
  id :number =  0;

  constructor(file) {
    this.worker = new Worker (file);
    this.observable = fromEvent(this.worker, 'message');
    this.observable.subscribe (r => {
      let data = r["data"];
      let message = this.messages[data.id];
      message.subject.next (data.data);
      this.spool.splice (this.spool.indexOf (data.id), 1);
      if (this.spool.length == 0)
        this.id = 0;
      delete this.messages [message.id];
    });
  }

  get (args:any[], workerClass : string) {
    let message = new WorkerMessage (this.id++, args, workerClass);
    this.messages [message.id] = message;
    this.spool.push (message.id);
    this.worker.postMessage (message.data);
    return message.$onDone;
  }
}

export class WorkerServiceClass {
  constructor (public service:WorkerService) {}
}

class WorkerMessage {
  subject:Subject<any>;
  $onDone:Observable<any>;
  responseMethod:null;

  constructor (public id:number, public data:any[], public workerClass:string) {
    this.data.push (id);
    this.data.push (workerClass);
    this.subject = new Subject<any>();
    this.$onDone = this.subject.asObservable ();
  }

}
