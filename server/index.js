'use strict'

const express = require('express');
const methodOverride = require('method-override')
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
const salvarPersonagem = require('./database/personagemModelo').salvarPersonagem;


let app = express();
app.use(methodOverride());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());


const routerApi = express.Router();
routerApi.use(xmlparser())

routerApi.route('/personagens').post(function salvar(req, res) {
  let personagem = req.body.personagem;


  salvarPersonagem(personagem).then(function () {
    res.json({msg: 'salvo com sucesso'});
  }).catch(function (err) {
    res.json(err);
  })

}).get(function getPersonagens(req, res) {

  let caracteristicaWhere = montarWhereCaracteristica(req.query);
  let relacionadoWhere = montarWhereRelacionado(req.query);

  let options = {include: [{model: CaracteristicaModel, as : 'caracteristica', where: caracteristicaWhere},
      {model: PersonagemModel, as: 'relacionado', through: {where: {'tipo': 'AMIGO'}}}],
    limit: 20,
    offset: req.query.offset,
    where: {}
  };
  if (req.query.nome) {
    options.where.nome = { $like: '%' + req.query.nome+ '%' };
  }
  if (req.query.sexo) {
    options.where.sexo = req.query.sexo;
  }

  //options.where = {'relacionado.relacionamento': 'AMIGO'};

  PersonagemModel.findAll(options).then(function (personagens) {
    res.json(personagens);
  })

});
app.use('/api', routerApi);

function montarWhereCaracteristica(query) {
  let caracteristicaWhere = {};
  let caracteristicas = [];
  if (query.caracteristica) {
    if  (query.caracteristica instanceof Array) {
      caracteristicas = query.caracteristica;
    } else {
      caracteristicas.push(query.caracteristica);
    }
    caracteristicaWhere.caracteristica = {$in: caracteristicas};
    return caracteristicaWhere;
  }
  return {};
}

function montarWhereRelacionado(query) {
  let relacionadoWhere = {};
  let relacionamento;
  let amigos;
  let inimigos = [];
  let mae, pai;
  if (query.amigo) {
    if  (query.amigo instanceof Array) {
      amigos = {
        $or: query.amigo.reduce(function (inicial, current) {
          inicial.push({nome: {$like: '%' + current.nome +'%', tipo: 'AMIGO'}});
        }, [])
      }

    } else {
      amigos = {nome: '%'+ query.amigo.nome+'%', tipo: 'AMIGO'};
    }
    relacionadoWhere= {relacionamento : amigos};
    return relacionadoWhere;
  }
  return {};
}

app.listen(port);
