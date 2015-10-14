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
  let caracteristicas = personagem.caracteristicas;

  sequelize.transaction().then(function (t) {
    let amigosRelacionados = relacionados.amigos || [];
    let amigosPromise = amigosRelacionados.map(function salvarAmigo(amigo) {
      return PersonagemModel.findOrCreate({where: {nome: amigo}, transaction: t});
    });

    let amigos, inimigos, mae, pai;
    return Promise.all(amigosPromise)
      .then(function (amigosResolve) {
        amigos = amigosResolve.map(function (value) {
          return value[0];
        });

        let inimigosRelacionados = relacionados.inimigos || [];
        let inimigosPromise = inimigosRelacionados.map(function salvarAmigo(inimigo) {
          return PersonagemModel.findOrCreate({where: {nome: inimigo}, transaction: t});
        });

        return Promise.all(inimigosPromise);
      }).then(function (inimigosResolve) {
        inimigos = inimigosResolve.map(function (value) {
          return value[0];
        });

        if (relacionados.mae[0]) {
          return PersonagemModel.findOrCreate({where: {nome: relacionados.mae[0]}, transaction: t});
        }
        return null;
      }).then(function (maeResolve) {
        if(maeResolve) {
          mae = maeResolve[0];
        }
        if (relacionados.pai[0]) {
          return PersonagemModel.findOrCreate({where: {nome: relacionados.pai[0]}, transaction: t});
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
        }, transaction: t});
      }).then(function (result){
        let personagemPersistido = result[0];

        if(!result[1]) {
          personagemPersistido.sexo = personagem.sexo[0];
          personagemPersistido.idade= personagem.idade[0],
          personagemPersistido.cabelo= personagem.cabelo[0],
          personagemPersistido.olhos= personagem.olhos[0],
          personagemPersistido.origem= personagem.origem[0],
          personagemPersistido.atividade= personagem.atividade[0],
          personagemPersistido.voz= personagem.voz[0]
          personagemPersistido.save({transaction: t});
        }

        amigos.forEach(function (amigo) {
          console.log('criando relacionamento com ' + amigo);
          personagemPersistido.addRelacionado(amigo, {tipo: 'AMIGO'}, {transaction: t});
        });

        inimigos.forEach(function(inimigo) {
          console.log('criando relacionamento com inimigo ' + inimigo);
          personagemPersistido.addRelacionado(inimigo, {tipo: 'INIMIGO'}, {transaction: t});
        });

        console.log('criando relacionamento com mae ' + mae);
        personagemPersistido.addRelacionado(mae, {tipo: 'MAE'}, {transaction: t});

        console.log('criando relacionamento com mae ' + pai);
        personagemPersistido.addRelacionado(pai, {tipo: 'PAI'}, {transaction: t});

        caracteristicas.forEach(function (caracteristica) {
          personagemPersistido.createCaracteristica({caracteristica: caracteristica}, { transaction: t});
        });


        return personagem;
      }).then(function () {
        console.log('fazendo o commit');
        t.commit();
        res.json({msg: 'ok'});

      }).catch(function (err) {
        console.log('fazendo o rollback');
        console.log(err);
        t.rollback();
        res.json({msg: 'not ok'});
      });
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


});

router.get('/salvar', function getSalvar(req, res) {
  res.json({msg: 'sucesso'});
});

app.use(router);
app.listen(port);
