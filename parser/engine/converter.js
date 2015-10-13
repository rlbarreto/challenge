'use strict';

const nodexml = require('nodexml');

module.exports.parseToXML = function parseToXML(jsonObj) {

  return nodexml.obj2xml(jsonObj, "Personagem");
}
