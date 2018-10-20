# ng-webworker-helper

## Purpose

The goal of of this project is to provide a helper to manage web workers through
an angular service. The web worker is created with browserify, out of angular. So
you can provide npm packages that are not compatible with angular and communicate
with them through web workers.

## Principle
Briefly, you develop a worker with an object pattern which means that you create
public methods in the worker class and the build command make them accessible
in an angular service.

## Requirements
I'm using and testing it with Angular6

This package needs a developement environment with TypeScript.
Install TypeScript globally if necessary

```
npm install -g typescript
```

You need to install browserify globally
```
npm install -g browserify
```

## Installation
Create a new folder for your web workers and inside it make this commands
```
npm init --yes
npm install --save @types/es6-promise @types/node
```
This package is not on npm so you have to clone it and install locally
```
git clone https://github.com/yoikitsune/ng-webworker-helper.git
npm install --save ./ng-webworker-helper
```
Then create your worker with this command
```
./node_module/.bin/addWorker worker_name
```
It will create a folder worker_name inside ./src and an index.ts containing
the worker_name class in which you develop your worker.

It will also create tsconfig.json and options.json in which you have to set your
angular project path.
```
// options.json
{
  "projectPath": "YOUR ANGULAR PROJECT PATH",
  "workersPath": "./src/",
  "definitionFile" : "workerService.definitions.ts"
}
```

## Usage

To make easy change on typescript files you can use this command in a terminal
```
cd WORKERS_PATH
tsc -w -p .
```
Once you have added some public methods inside your worker class, you can launch
```
./node_modules/.bin/buildWorkers
```
Il will create the workers in src/assets and the definition file in src/app of
your Angular project.

And now create a service named worker_name.
```
ng generate service worker_name

```
In that file, import definitions
```
import { WorkerNameWorker } from './webworker.definitions.ts';

```
and extends service
```
export class WorkerNameService extends WorkerNameWorker {}
```
you also need to copy workerService.ts to src in your angular projectPath

and all the public methods inside the web worker are available in angular through
the service.
