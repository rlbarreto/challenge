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
  let relacionadoFiltroTipo = {};
  if (req.query.amigo) {
    relacionadoFiltroTipo.where = {tipo: 'AMIGO'};
  } else if (req.query.inimigo) {
    relacionadoFiltroTipo.where = {tipo: 'INIMIGO'};
  } else if (req.query.mae) {
    relacionadoFiltroTipo.where = {tipo: 'MAE'};
  } else if (req.query.pai) {
    relacionadoFiltroTipo.where = {tipo: 'PAI'};
  }
  let options = {include: [{model: CaracteristicaModel, as : 'caracteristica', where: caracteristicaWhere},
      //{model: PersonagemModel, as: 'relacionado', through: {where: {'tipo': 'AMIGO'}}, where: relacionadoWhere.amigo}],
      {model: PersonagemModel, as: 'relacionado', through: relacionadoFiltroTipo, where: relacionadoWhere}],
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
  if (req.query.atividade) {
    options.where.atividade = req.query.atividade;
  }
  if (req.query.voz) {
    options.where.voz = req.query.voz;
  }
  if (req.query.origem) {
    options.where.origem = req.query.origem;
  }
  if (req.query.olhos) {
    options.where.olhos = req.query.olhos;
  }
  if (req.query.cabelo) {
    options.where.cabelo = req.query.cabelo;
  }
  if (req.query.idade) {
    options.where.idade = req.query.idade;
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
  let relacionadoWhere = {
    amigos: undefined,
    inimigos: undefined,
    mae: undefined,
    pai: undefined
  };
  let relacionamento = query.amigo || query.inimigo;
  let amigos;
  let inimigos = [];
  let mae, pai;
  if (relacionamento) {
    if  (relacionamento instanceof Array) {
      amigos = {
        $or: relacionamento.reduce(function (inicial, current) {
          inicial.push({nome: {$like: '%' + current.nome +'%'}});
        }, [])
      }

    } else {
      amigos = {nome: {$like: '%'+ relacionamento.nome+'%'}};
    }
    relacionadoWhere = amigos;
    return relacionadoWhere;
  }
  return {};
}

app.listen(port);
