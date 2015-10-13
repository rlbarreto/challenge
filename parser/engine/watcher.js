'use strict';

const chokidar = require('chokidar');
const EventEmitter = require('events').EventEmitter;
const util = require('util');
const fs = require('fs');
const async = require('async');
const path = require('path');


module.exports = Watcher;

function Watcher(diretorio) {
  EventEmitter.call(this);
  let self = this;

  let streams;
  fs.readdir(diretorio, function (err, arquivos) {
    if (err) {
      return console.log(err);
    }
    arquivos.forEach(function (nomeArquivo) {
      var filePath = path.join(diretorio, nomeArquivo);

      fs.readFile(filePath, 'utf-8', function (err, json) {
        self.emit('data', JSON.parse(json));
      });
    });
  });

  let watcher = chokidar.watch(diretorio, {
      persistent: true,
      awaitWriteFinish: true,
      ignoreInitial: true
    });

  watcher.on('add', function (path) {
      fs.readFile(path, 'utf-8', function (err, json) {
        self.emit('data', JSON.parse(json));
      });
    });

}


util.inherits(Watcher, EventEmitter);
