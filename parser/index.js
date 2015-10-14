'use strict';

const Watcher = require('./engine/watcher');
const converter = require('./engine/converter');
const http = require('http');
const request = require('request');
const watcher = new Watcher('/home/rafael/projetos/challenge/files/personagens');

let onExecution = false;
watcher.on('data', function (json) {
  enviar(json);
});

function enviar(obj) {
  if(obj instanceof Array) {
    if (obj.length) {
      enviarUm(obj.shift(), function (err, response) {
        console.log('enviou 1 do array');
        enviar(obj);
      });
    }
  } else {

    enviarUm(obj, function (err, response) {
      console.log('enviou 1');
    });
  }
}

function enviarUm(json, callback) {
  let xml = converter.parseToXML(json);


  let bufferLength = Buffer.byteLength(xml);
  let postRequest = {
    host: "localhost",
    path: "/personagens",
    port: 3000,
    method: "POST",
    headers: {
        'Cookie': "cookie",
        'Content-Type': 'text/xml',
        'Content-Length': bufferLength
    }
  };
  request.post({
    url: 'http://localhost:3000/personagens',
    method: 'POST',
    headers: {
        "content-type": "application/xml",  // <--Very important!!!
    },
    body: xml
  }, callback);
  /*let req = http.request(postRequest)
  req.write(xml);
  req.end();*/
}
