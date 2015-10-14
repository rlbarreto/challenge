'use strict';

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
