'use strict';

const db = require('./db');
const sequelize = db.getSequelize();

const PersonagemModel = sequelize.define('personagem', {
  id: { type: db.Sequelize.UUID, defaultValue: db.Sequelize.UUIDV4, primaryKey: true },
    nome: db.Sequelize.STRING,
    sexo: db.Sequelize.STRING,
    idade: db.Sequelize.INTEGER,
    cabelo: db.Sequelize.STRING,
    olhos: db.Sequelize.STRING,
    origem: db.Sequelize.STRING,
    atividade: db.Sequelize.STRING,
    voz: db.Sequelize.STRING
}, {
  underscored: true,
  freezeTableName: true,
  tableName: 'personagem'
});

const RelacionamentoModel = sequelize.define('relacionamento', {
    id: { type: db.Sequelize.UUID, defaultValue: db.Sequelize.UUIDV4, primaryKey: true },
    tipo: {type: db.Sequelize.ENUM('PAI', 'MAE', 'AMIGO', 'INIMIGO'), unique: 'teste'},
    personagem_id: {type: db.Sequelize.UUID, unique: 'teste'},
    relacionado_id: {type: db.Sequelize.UUID, unique: 'teste'},
}, {
  underscored: true,
  freezeTableName: true,
  tableName: 'relacionamento'
});

PersonagemModel.belongsToMany(PersonagemModel, { as: 'relacionado', through: {model: RelacionamentoModel, unique: false} });


const CaracteristicaModel = sequelize.define('caracteristica', {
  id: { type: db.Sequelize.UUID, defaultValue: db.Sequelize.UUIDV4, primaryKey: true },
  caracteristica: db.Sequelize.STRING
}, {
  underscored: true,
  freezeTableName: true,
  tableName: 'caracteristica'
});

PersonagemModel.hasMany(CaracteristicaModel, { as: 'caracteristica'});

/*PersonagemModel.sync({force: true});
RelacionamentoModel.sync({force:true});
CaracteristicaModel.sync({force: true});*/
//sequelize.sync({force:true});

module.exports.PersonagemModel = PersonagemModel;
module.exports.RelacionamentoModel = RelacionamentoModel;
module.exports.CaracteristicaModel = CaracteristicaModel;

module.exports.salvarPersonagem = function (personagem) {
  let relacionados = personagem.pessoasrelacionadas[0];
  let caracteristicas = personagem.caracteristicas;

  return sequelize.transaction().then(function (t) {
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
}
