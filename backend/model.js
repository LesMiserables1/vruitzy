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


const topup = sequelize.define('topup',{
  id : {
    type : DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement : true
  },
  tanggal : {
    type : DataTypes.DATE,
  },
  jumlah : {
    type : DataTypes.DOUBLE
  }
})

sequelize.sync({force : true})

module.exports = {
  topup: topup
}

const store = sequelize.define('store',{
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
  nama_toko :{
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
  }
})

sequelize.sync({force : true})

module.exports = {
  store: store
}

const product = sequelize.define('product',{
  id : {
    type : DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement : true
  },
  nama_product :{
      type : DataTypes.STRING
  },
  jenis_buah :{
      type : DataTypes.STRING
  },
  stok : {
      type : DataTypes.INTEGER
  },
  harga : {
      type : DataTypes.DOUBLE
  },
  rating : {
      type : DataTypes.INTEGER
  }
})

sequelize.sync({force : true})

module.exports = {
  product: product
}


const courier = sequelize.define('courier',{
  id : {
    type : DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement : true
  },
  nama_courier :{
      type : DataTypes.STRING
  },
  nomor_hp : {
      type : DataTypes.STRING
  }
})

sequelize.sync({force : true})

module.exports = {
  courier: courier
}

const order = sequelize.define('order',{
  id : {
    type : DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement : true
  },
  total_harga :{
      type : DataTypes.DOUBLE
  }
  status :{
      type : DataTypes.STRING
  }
  payment_date :{
    type : DataTypes.DATE
  }
})

sequelize.sync({force : true})

module.exports = {
  order: order
}

const order_details = sequelize.define('order_details',{
  id : {
    type : DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement : true
  },
  jumlah :{
      type : DataTypes.INTEGER
  }
  harga :{
      type : DataTypes.DOUBLE
  }
})

sequelize.sync({force : true})

module.exports = {
  order_details: order_details
}

const shipping_details = sequelize.define('shipping_details',{
  id : {
    type : DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement : true
  },
  alamat_sender :{
      type : DataTypes.STRING
  },
  alamat_reciever :{
      type : DataTypes.STRING
  },
  shipping_type : {
      type : DataTypes.STRING
  },
  fee : {
      type: DataTypes.DOUBLE
  }
})

sequelize.sync({force : true})

module.exports = {
  shipping_details: shipping_details
}

user.hasMany(topup);
topup.belongsTo(user);

store.hasMany(product);
product.belongsTo(store);

order.hasMany(order_details);
order_details.belongsTo(order);

order.hasOne(shipping_details);
shipping_details.belongsTo(order);

user.hasMany(order);
order.belongsTo(user);

store.hasMany(order);
order.belongsTo(store);

courier.hasMany(shipping_details);
shipping_details.belongsTo(courier);

product.hasMany(order_details);
order_details.belongsTo(product);


