require('dotenv').config()

const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
  host: 'localhost',
  dialect: 'mysql',
  port: process.env.DB_PORT
})

// buat model untuk tiap table pada database
const customer = sequelize.define('customer', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  email: {
    type: DataTypes.STRING,
    unique: true
  },
  username: {
    type: DataTypes.STRING,
    unique: true
  },
  password: {
    type: DataTypes.STRING
  },
  alamat: {
    type: DataTypes.STRING
  },
  nama: {
    type: DataTypes.STRING
  },
  saldo: {
    type: DataTypes.DOUBLE,
    defaultValue : 0
  },
  nomor_hp: {
    type: DataTypes.STRING
  },
  kota: {
    type: DataTypes.STRING
  },
  gender: {
    type: DataTypes.STRING
  },
  tanggal_lahir: {
    type: DataTypes.DATE
  }
})

const transaction = sequelize.define('transaction', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  harga :{
    type : DataTypes.DOUBLE
  },
  fee : {
    type : DataTypes.DOUBLE
  },
})

const store = sequelize.define('store', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  email: {
    type: DataTypes.STRING,
    unique: true
  },
  password: {
    type: DataTypes.STRING
  },
  alamat: {
    type: DataTypes.STRING
  },
  nama_toko: {
    type: DataTypes.STRING
  },
  saldo: {
    type: DataTypes.DOUBLE,
    defaultValue : 0
  },
  nomor_hp: {
    type: DataTypes.STRING
  },
  kota: {
    type: DataTypes.STRING
  },
  nama: {
    type: DataTypes.STRING
  }
})


const product = sequelize.define('product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nama_product: {
    type: DataTypes.STRING
  },
  stok: {
    type: DataTypes.INTEGER
  },
  harga: {
    type: DataTypes.DOUBLE
  },
  rating: {
    type: DataTypes.INTEGER
  }
})

const courier = sequelize.define('courier', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  email: {
    type: DataTypes.STRING,
    unique: true
  },
  password: {
    type: DataTypes.STRING
  },
  nama_courier: {
    type: DataTypes.STRING
  },
  nomor_hp: {
    type: DataTypes.STRING
  },
  alamat: {
    type: DataTypes.STRING
  },
  kota: {
    type: DataTypes.STRING
  },
  saldo: {
    type: DataTypes.DOUBLE,
    defaultValue : 0
  }
})

const typeShipment = sequelize.define('typeShipment',{
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  tipe : {
    type : DataTypes.STRING,
  },
  fee : {
    type : DataTypes.INTEGER
  }
})

const order = sequelize.define('order', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  total_harga: {
    type: DataTypes.DOUBLE
  },
  status: {
    type: DataTypes.STRING
  },
  payment_date: {
    type: DataTypes.DATE
  }
})

const order_details = sequelize.define('order_details', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  jumlah: {
    type: DataTypes.INTEGER
  },
  harga: {
    type: DataTypes.DOUBLE
  }
})

const shipping_details = sequelize.define('shipping_detail', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  alamat_sender: {
    type: DataTypes.STRING
  },
  alamat_receiver: {
    type: DataTypes.STRING
  },
  status: {
    type: DataTypes.STRING,
    defaultValue : "OUT"
  }
})



store.hasMany(product);
product.belongsTo(store);

order.hasMany(order_details);
order_details.belongsTo(order);

order.hasOne(shipping_details);
shipping_details.belongsTo(order);

courier.hasMany(typeShipment)
typeShipment.belongsTo(courier)

customer.hasMany(order);
order.belongsTo(customer);

store.hasMany(order)
order.belongsTo(store)

typeShipment.hasMany(shipping_details);
shipping_details.belongsTo(typeShipment);

product.hasMany(order_details);
order_details.belongsTo(product);


sequelize.sync({ force: false })

module.exports = {
  order: order,
  customer: customer,
  transaction: transaction,
  store: store,
  product: product,
  courier: courier,
  order_details: order_details,
  shipping_details: shipping_details,
  typeShipment : typeShipment
}
