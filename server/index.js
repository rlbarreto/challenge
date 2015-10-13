'use strict'

const express = require('express');

const bodyParser = require('body-parser');
const xmlparser = require('express-xml-bodyparser');
const Transform = require('stream').Transform;
const parseString = require('xml2js').parseString;


var port = process.env.APP_PORT || 3000;
var host = process.env.DB_HOST || 'localhost';
var db_port = process.env.DB_PORT || 3306;
var user = process.env.DB_USER || 'rafael';
var password = process.env.DB_PASSWORD || '123456';
var databaseName = process.env.DB_NAME || 'teste';

//inicializando o sequelize
const db = require('./database/db')
let sequelize = db.getSequelize(host, user, password, databaseName);
const PersonagemModel = require('./database/personagemModelo').PersonagemModel;
const RelacionamentoModel = require('./database/personagemModelo').RelacionamentoModel;
const CaracteristicaModel = require('./database/personagemModelo').CaracteristicaModel;


let app = express();

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

const router = express.Router();
router.use(xmlparser())

router.post('/personagens', function salvar(req, res) {
  let personagem = req.body.personagem;

  let relacionados = personagem.pessoasrelacionadas[0];

  let amigosPromise = relacionados.amigos.map(function salvarAmigo(amigo) {
    return PersonagemModel.findOrCreate({where: {nome: amigo}});
  });

  let amigos, inimigos, mae, pai;
  Promise.all(amigosPromise)
    .then(function (amigosResolve) {
      amigos = amigosResolve.map(function (value) {
        return value[0];
      });

      let inimigosPromise = relacionados.inimigos.map(function salvarAmigo(inimigo) {
        return PersonagemModel.findOrCreate({where: {nome: inimigo}});
      });

      return Promise.all(inimigosPromise);
    }).then(function (inimigosResolve) {
      inimigos = inimigosResolve.map(function (value) {
        return value[0];
      });

      if (relacionados.mae[0]) {
        return PersonagemModel.findOrCreate({where: {nome: relacionados.mae[0]}});
      }
      return null;
    }).then(function (maeResolve) {
      if(maeResolve) {
        mae = maeResolve[0];
      }
      if (relacionados.pai[0]) {
        return PersonagemModel.findOrCreate({where: {nome: relacionados.pai[0]}});
      }
      return null;
    }).then(function(paiResolve) {
      if (paiResolve) {
        pai = paiResolve[0];
      }

      return PersonagemModel.findOrCreate({where : {nome: personagem.nome[0]}, defaults:{
        sexo: personagem.sexo[0],
        idade: personagem.idade[0],
        cabelo: personagem.cabelo[0],
        olhos: personagem.olhos[0],
        origem: personagem.origem[0],
        atividade: personagem.atividade[0],
        voz: personagem.voz[0]
      }});
    }).then(function (result){
      let personagem = result[0];
      amigos.forEach(function (amigo) {
        console.log('criando relacionamento com ' + amigo);
        personagem.addRelacionado(amigo, {tipo: 'AMIGO'});
      });

      inimigos.forEach(function(inimigo) {
        console.log('criando relacionamento com inimigo ' + inimigo);
        personagem.addRelacionado(inimigo, {tipo: 'INIMIGO'});
      });

      console.log('criando relacionamento com mae ' + mae);
      personagem.addRelacionado(mae, {tipo: 'MAE'});

      console.log('criando relacionamento com mae ' + pai);
      personagem.addRelacionado(pai, {tipo: 'PAI'});
      personagem.save();
      console.log(personagem);
    });
  /*let personagemModel PersonagemModel.build({
    nome: personagem.nome,
    sexo: personagem.sexo,
    idade: personagem.idade,
    cabelo: personagem.cabela,
    olhos: personagem.olhos,
    origem: personagem.origem,
    atividade: personagem.atividade,
    voz: personagem.voz
  });*/

  res.json({msg: 'ok'});
});

router.get('/salvar', function getSalvar(req, res) {
  res.json({msg: 'sucesso'});
});

app.use(router);
app.listen(port);
