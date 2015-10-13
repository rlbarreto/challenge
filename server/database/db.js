'use strict';

/*const pg = require('pgp');
const Promise = require('bluebird');

let bd = {
  connectionString: '',
  getConnection: function () {
    return new Promise(function (resolve, reject) {
      if (!connectionString) {
        return reject({msgError: 'BD não inicializado corretamente. ConnectionString: ' + bd.connectionString})
      }
      return resolve(pgp(bd.connectionString));
    });
  }
}


module.exports = function (host, database, username, password) {
  if (!bd.connectionString && (!host || !username || !database)) {
    thow new Error('não é possível iniciar o BD');
  } else if (!bd.connectionString) {
    bd.ConnectionString = 'postgres://' + username + (password ? ':' + password : '') + '@' + localhost + '/' + database;
  }

  return bd;
}

module.exports.
*/

const sequelize = require('sequelize');


exports = module.exports = {
    host: '',
    username: '',
    password: '',
    databaseName: '',
    Sequelize: sequelize,
    _sequelize: undefined,
    getSequelize: function getSequelize(host, username, password, databaseName) {
      if (this._sequelize) {
        return this._sequelize;
      }
      this.host = host;
      this.username = username;
      this.password = password;
      this.databaseName = databaseName;

      if (this.host && this.username && this.password && this.databaseName) {
        this._sequelize = new sequelize('postgres://' + this.username + ':' + this.password + '@'+ this.host+':5432/' + this.databaseName);
        return this._sequelize;
      }
      throw new Error({msgError: 'Dados incorretos'});
    }
};
