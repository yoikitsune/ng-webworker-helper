# ng-worker-helper

## Purpose

The goal of of this project is to provide a helper to manage webworker through
an angular service.
Briefly, you develop a worker with an object pattern which mean that you create public methods
in the worker class and the build command make them accessible in your service.

## Requirements
This package needs a developement environment with TypeScript.

Install TypeScript globally if necessary

```
npm install -g typescript
```
I'm using and testing it with Angular6

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
```bash
./node_module/.bin/addWorker worker_name
```
It will create a folder worker_name inside ./src and index.ts file containing
the worker_name class in which you develop your worker.

It will also create tsconfig.json and options.json in which you have to set your
angular project path.

## Usage

To make easy change on typescript files you can use this command
```
tsc -w -p.
```
Once you add some public methods inside your worker class, you can launch
```
./node_modules/.bin/buildWorkers
```
Il will create the workers in src/assets, the definition file in src/app

And now create a service named worker_name. In that file, import definitions
```
import { WorkerNameWorker } from './webworker.definitions.ts';

```
and extends service
```
export class WorkerNameService extends WorkerNameWorker {}
```

and all the methods inside the web worker are available in angular through a
service
