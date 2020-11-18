const express = require('express')
const cors = require('cors')
const model = require('./model.js')
const crypto = require('crypto')
const jwt = require("jsonwebtoken");
const verifyToken = require('./verify.js');
const { store } = require('./model.js');
const { Sequelize } = require('sequelize/types');
const {Op} = require(Sequelize)
let app = express()
app.use(express.json())
app.use(cors())



// api untuk customer
app.post('/customer/register',async(req,res)=>{
    let body = req.body
    let passwordHash = crypto.createHash('sha256').update(body.password).digest('base64')

    try {
        const customer = await model.customer.create({
            "email" : body.email,
            "password" : passwordHash
        })   
        return res.send({
            status : 'ok'
        })
    } catch (error) {
        return res.send({
            status : 'failed',
            msg : "email is already registered"
        })
    }
})

app.post('/customer/login',async(req,res)=>{
    let body = req.body
    let passwordHash = crypto.createHash('sha256').update(body.password).digest('base64')

    const customer = await model.customer.findOne({ where: { email: body.email, password: passwordHash } })
    if (customer == null) {
        return res.send({
            "status": "failed",
            "message": "kredensial salah"
        })
    }
    let payload = {
        "role" : "customer",
        "id" : customer.id
    }
    const token = jwt.sign(payload, process.env.SECRET_KEY)
    return res.send({
        "status": "ok",
        token
    })
})

app.post('/customer/update',verifyToken,async(req,res)=>{
    let body = req.body

    if(req.decode.role != 'customer'){
        res.send({
            "status" : "failed",
            "msg" : "role is incorrect"
        })
    }
    let customer = await model.customer.findOne({id : req.decode.id})
    if(customer == null){
        return res.send({
            "status" : "failed",
            "msg" : "user does not exist"
        })
    }
    customer.alamat = body.alamat
    customer.nama = body.nama
    customer.nomor_hp = body.nomor_hp
    customer.kota = body.kota
    customer.tanggal_lahir = body.tanggal_lahir
    customer.save()
    
    return res.send({
        status : "ok"
    })
})  

app.post('/customer/retrieve/data',verifyToken,async(req,res)=>{
    
    if(req.decode.role != 'customer'){
        return res.send({
            "status" : "failed",
            "msg" : "role is incorrect"
        })
    }


    const customer = await model.customer.findOne({id : req.decode.id})
    if(customer == null){
        return res.send({
            "status" : "failed",
            "msg" : 'user does not exist'
        })
    }
    return res.send({
        "status" : 'ok',
        "data" : customer
    })
})


// api untuk store
app.post('/store/register',async(req,res)=>{
    let body = req.body
    let passwordHash = crypto.createHash('sha256').update(body.password).digest('base64')

    try {
        const customer = await model.store.create({
            "email" : body.email,
            "password" : passwordHash
        })
        return res.send({
            status : 'ok'
        })   
    } catch (error) {
        return res.send({
            status : "failed"
        })    
    }
    
})

app.post('/store/login',async(req,res)=>{
    let body = req.body
    let passwordHash = crypto.createHash('sha256').update(body.password).digest('base64')

    const customer = await model.store.findOne({ where: { email: body.email, password: passwordHash } })
    if (customer == null) {
        return res.send({
            "status": "failed",
            "message": "wrong credential"
        })
    }
    let payload = {
        "role" : "store",
        "id" : store.id
    }
    const token = jwt.sign(payload, process.env.SECRET_KEY)
    return res.send({
        "status": "ok",
        token
    })
})

app.post('/store/update',verifyToken,async(req,res)=>{
    let body = req.body
    console.log(req.decode)
    if(req.decode.role != 'store'){
        res.send({
            "status" : "failed",
            "msg" : "role is incorrect"
        })
    }
    let store = await model.store.findOne({id : req.decode.id})
    store.alamat = body.alamat
    store.nama_toko = body.nama_toko
    store.nomor_hp = body.nomor_hp
    store.kota = body.kota
    store.save()
    
    res.send({
        status : "ok",
    })
})

app.post('/store/retrieve/data',verifyToken,async(req,res)=>{
    
    if(req.decode.role != 'store'){
        return res.send({
            "status" : "failed",
            "msg" : "role is incorrect"
        })
    }
    const store = await model.store.findOne({id : req.decode.id})
    
    res.send({
        "status" : 'ok',
        "data" : store
    })
})

// api untuk product
app.post('/store/create/product',verifyToken,(req,res)=>{
    
    let body = req.body
    if(req.decode.role != 'store'){
        return res.send({
            "status" : "failed",
            "msg" : "role is incorrect"
        })
    }
    try {
        let product = await model.product.create({
            nama_product : body.name_product,
            jenis_buah : body.jenis_buah,
            stok : body.stok,
            harga : body.harga,
            storeId : req.decode.id
        })
        return res.send({
            "status" : 'ok'
        })
    } catch (error) {
        return res.send({
            "status" : "failed"
        })
    }

})

app.post('/store/update/product',async (req,res)=>{
    let body = req.body
    if(req.decode.role != 'store'){
        return res.send({
            "status" : "failed",
            "msg" : "role is incorrect"
        })
    }
    let product = await model.product.findOne({
        id : body.id,
    })
    if(product == null){
        return res.send({
            "status" : "failed"
        })
    }
    product.name_product = body.name_product
    product.jenis_buah = body.jenis_buah
    product.stok = body.stok
    product.harga = body.harga
    
    product.save()

    return res.send({
        "status" : "ok"
    })
})
app.post('/store/retrieve/product',verifyToken,async(req,res)=>{
    if(req.decode.role != 'store'){
        return res.send({
            "status" : "failed",
            "msg" : "role is incorrect"
        })
    }

    let product = await model.product.findAll({
        storeId : req.decode.id
    })

    return res.send({
        status:'ok',
        data: product
    })
})

app.get('/customer/search/product',verifyToken,async(req,res)=>{
    if(req.decode.role != 'customer'){
        return res.send({
            "status" : "failed",
            "msg" : "role is incorrect"
        })
    }

    let body = req.body
    let product = await model.product.findAll({
        where :{
            name_product : {
                [Op.like] : `%${body.name}%`
            }
        }
    })
    return res.send({
        "status" : "ok",
        data : product
    })
})

/* 
    TODO :
    1. validasi role client apakah transport atau bukan
    2. validasi fungsi api
*/
app.post('/transport/register', async(req, res) => {
    let passwordHash = crypto.createHash('sha256').update(req.body.password).digest('base64')
    if (!req.body.nama_courier || !req.body.password || !req.body.email) {
        res.send({
            message: 'Please provide a name, email and a password.',
        });
    } else {
        
        model.courier.create({
            nama_courier: req.body.nama_courier,
            email: req.body.email,
            password: passwordHash
        })
        res.send({
            status: "created",
            message: "Account created!",
        });
    }
})


app.post('/transport/login', async (req, res) => {

    let body = req.body
    let passwordHash = crypto.createHash('sha256').update(req.body.password).digest('base64')

    const user = await model.courier.findOne({ where: { email: body.email, password: passwordHash } })
    if (user == null) {
        return res.send({
            "status": "failed",
            "message": "wrong credential"
        })
    }
    let payload = {
        "email": body.email
    }
    const token = jwt.sign(payload, process.env.SECRET_KEY)
    return res.send({
        "status": "ok",
        token
    })
})


app.get('/shipment/details', (req, res) => {

    shipping_details.findAll({
        include: [
            { model: shipping_details, where: { id: req.body.courierId, status: req.body.shipStatus } }
        ]
    })
        .then(data => res.json(data))
})

app.listen(4000)
