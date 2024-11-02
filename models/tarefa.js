const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Tarefa = sequelize.define('Tarefa', {
    Nome_Tarefa: {
        type: DataTypes.STRING,
        allowNull: false
    },
    Custo: {
        type: DataTypes.DECIMAL,
        allowNull: false
    },
    Data_Limite: {
        type: DataTypes.DATE,
        allowNull: false
    },
    Ordem_Apresentacao: {
        type: DataTypes.INTEGER,
        unique: true,
        allowNull: false
    }
});

module.exports = Tarefa;