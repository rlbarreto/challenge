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
sequelize.sync({force:true});

module.exports.PersonagemModel = PersonagemModel;
module.exports.RelacionamentoModel = RelacionamentoModel;
module.exports.CaracteristicaModel = CaracteristicaModel;
