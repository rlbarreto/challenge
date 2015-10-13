'use strict';

const Watcher = require('./engine/watcher');
const converter = require('./engine/converter');
const http = require('http');
const watcher = new Watcher('/home/rafael/projetos/challenge/files/personagens');

watcher.on('data', function (json) {

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
  let req = http.request(postRequest)
  req.write(xml);
  req.end();
});
