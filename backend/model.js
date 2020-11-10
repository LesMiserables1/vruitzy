require('dotenv').config()

const { Sequelize,DataTypes } = require('sequelize');
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USERNAME,process.env.DB_PASSWORD,{
  host : 'dev-story.my.id',
  dialect : 'mysql',
  port : process.env.DB_PORT
})

// buat model untuk tiap table pada database
const user = sequelize.define('user',{
  id : {
    type : DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement : true
  },
  email : {
    type : DataTypes.STRING,
    unique : true
  },
  password : {
    type : DataTypes.STRING
  },
  alamat : {
      type : DataTypes.STRING
  },
  nama :{
      type : DataTypes.STRING
  },
  saldo : {
      type : DataTypes.DOUBLE
  },
  nomor_hp : {
      type : DataTypes.STRING
  },
  kota : {
      type : DataTypes.STRING
  },
  gender : {
    type : DataTypes.STRING
  },
  tanggal_lahir : {
    type : DataTypes.DATE
  }
})

sequelize.sync({force : true})

module.exports = {
  user: user
}