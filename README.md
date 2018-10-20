# ng-worker-helper

## Purpose

The goal of of this project is to provide a helper to manage webworker inside an Angular project.
Briefly, you develop a worker with an object pattern which mean that you create public methods
in the worker class and the build command add automatically all the definitions inside 
your Angular project.

## Requirements
	This package needs a developement environment with TypeScript.

	Install TypeScript globally if necessary
	```bash
	npm install -g typescript
	git 
	```
	
## Installation
    Create a new folder for your web workers and inside it make this commands
    ```bash
	npm init --yes
	npm install --save ng-webworker-helper @types/es6-promise @types/node
	git 
	```
	Then create your worker with this command
	```bash
		./node_module/.bin/addWorker worker_name
	```
	It will create a folder worker_name inside ./src and index.ts file containing
	the worker_name class in which you develop your worker.


## Usage

