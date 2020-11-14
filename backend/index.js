const express = require('express')
const cors = require('cors')
const model = require('./model.js')
const crypto = require('crypto')
const jwt = require("jsonwebtoken");
const verifyToken = require('./verify.js');
const { store } = require('./model.js');
let app = express()
app.use(express.json())
app.use(cors())

// api untuk customer
app.post('/customer/register',async(req,res)=>{
    let body = req.body
    let passwordHash = crypto.createHash('sha256').update(body.password).digest('base64')

    const customer = await model.customer.create({
        "email" : body.email,
        "password" : passwordHash
    })
    res.send({
        status : 'ok'
    })
})


app.post('/customer/login',async(req,res)=>{
    let body = req.body
    let passwordHash = crypto.createHash('sha256').update(body.password).digest('base64')

    const customer = await model.customer.findOne({ where: { email: body.email, password: passwordHash } })
    if (customer == null) {
        return res.send({
            "status": "failed",
            "message": "wrong credential"
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
    customer.alamat = body.alamat
    customer.nama = body.nama
    customer.nomor_hp = body.nomor_hp
    customer.kota = body.kota
    customer.tanggal_lahir = body.tanggal_lahir
    customer.save()
    
    res.send({
        status : "ok"
    })
})  

app.post('/customer/retrieve/data',verifyToken,async(req,res)=>{
    
    if(req.decode.role != 'customer'){
        res.send({
            "status" : "failed",
            "msg" : "role is incorrect"
        })
    }
    const customer = await model.customer.findOne({id : req.decode.id})
    
    res.send({
        "status" : 'ok',
        "data" : customer
    })
})

// api untuk store

app.post('/store/register',async(req,res)=>{
    let body = req.body
    let passwordHash = crypto.createHash('sha256').update(body.password).digest('base64')

    const customer = await model.store.create({
        "email" : body.email,
        "password" : passwordHash
    })
    res.send({
        status : 'ok'
    })
})

app.post('/store/login',async(req,res)=>{
    let body = req.body
    let passwordHash = crypto.createHash('sha256').update(body.password).digest('base64')

    const store = await model.store.findOne({ where: { email: body.email, password: passwordHash } })
    if (store == null) {
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
        res.send({
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

// api untuk transport
app.post('/transport/register', async(req, res) => {
    let passwordHash = crypto.createHash('sha256').update(req.body.password).digest('base64')
    if (!req.body.nama_courier || !req.body.password || !req.body.email) {
        res.send({
            message: 'Please provide a name, email and a password.',
        });
    } else {
        
        const transport = await model.courier.create({
            nama_courier: req.body.nama_courier,
            email: req.body.email,
            password: passwordHash
        })
        res.send({
            status: "ok",
            message: "Account created!",
        })
    }
})


app.post('/transport/login', async(req, res) => {
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
        "role" : "transport",
        "id": user.id
    }
    const token = jwt.sign(payload, process.env.SECRET_KEY)
    return res.send({
        "status": "ok",
        token
    })
})

app.post('/transport/update',verifyToken,async(req,res)=>{
    let body = req.body
    console.log(req.decode)
    if(req.decode.role != 'transport'){
        res.send({
            "status" : "failed",
            "msg" : "role is incorrect"
        })
    }
    let transport = await model.courier.findOne({id : req.decode.id})
    transport.alamat = body.alamat
    transport.nama_courier = body.nama_courier
    transport.nomor_hp = body.nomor_hp
    transport.kota = body.kota
    transport.save()
    
    res.send({
        status : "ok",
    })
})

app.post('/transport/retrieve/data',verifyToken,async(req,res)=>{
    
    if(req.decode.role != 'transport'){
        res.send({
            "status" : "failed",
            "msg" : "role is incorrect"
        })
    }
    const transport = await model.transport.findOne({id : req.decode.id})
    
    res.send({
        "status" : 'ok',
        "data" : transport
    })
})

app.get('/transport/details', async(req, res) => {
    const data = await model.shipping_details.findAll({
        where: { id: req.body.courierId, status: {[Op.or]: ['ON DELIVERY', 'DELIVERED']}} 
    })
    res.send({
        "status" : 'ok',
        "data" : data
    })
})

//api order
app.post('/order/make', verifyToken, async(req, res) => {
    let body = req.body
    if(req.decode.role != 'customer'){
        res.send({
            "status" : "failed",
            "msg" : "role is incorrect"
        })
    }

    //bikin record order
    var order = model.order_details.create({
        status: "UNPAID"
    })

    //bikin order detail untuk tiap jenis product yang dibeli
    let result = body.order_details
    for (member in result){
        var harga_satuan = model.product.findOne({
            attributes: ['harga']},
            {where: { id: member.productid}
        })
        model.order_details.create({
            jumlah: member.jumlah,
            harga: harga_satuan*member.jumlah,
            orderId: order.id
        })
    }

    //bikin shipping details
    const ship = model.shipping_details.create({
        alamat_sender : body.alamat_sender,
        alamat_reciever : body.reciever,
        fee: body.fee,
        orderId: order.id,
        courierId: body.courierId	
    })

    //itung total harga, update total harga di order
    var total = model.order_details.sum('harga', { where: { orderId: order.id}  });
    total = total + ship.fee

    model.order.update(
        {   
            total_harga : total
        },
        { where: { id: oder.orderid } }
    )
})

app.post('/order/payment/', async(req, res) => {
    let body = req.body
    var order = model.order.findOne(
        { where: { id: body.orderid } }
    )
    
    var user = model.customer.findOne({
        where: { id: order.userId}}
    );
    //itung sisa saldo user
    var sisa =  user.saldo - order.total_harga
    if (sisa <0){
        return res.send({
            "message": "Saldo tidak cukup!",
        })
    }
    user.saldo = sisa
    await user.save();

    order.status = "PAID"
    await order.save();

    //update status di shipping_details jadi "IN"
    var transport = model.shipping_details.findOne({
        where: { oderId: order.id}}
    );

    transport.status = "IN"
    await transport.save();

})

app.post('/order/ship', (req, res) => {
    let body = req.body
    //update status di shipping details jadi on delivery
    model.shipping_details.update(
        {   
            status : 'ON DELIVERY'
        },
        { where: { orderId: body.orderid } }
    )
})

app.post('/order/retrieve/data', async(req,res)=>{
    let body = req.body
    const order = await model.order.findOne({id : body.id})
    const details = await model.order.findAll({orderId : body.id})
    res.send({
        "status" : 'ok',
        "data" : order,
        "details" : details
    })
})

//api untuk product
app.post('/product/add', verifyToken, async(req, res) => {
    let body = req.body
    
    if(req.decode.role != 'store'){
        res.send({
            "status" : "failed",
            "msg" : "role is incorrect"
        })
    }
    
    model.product.create({
        nama_product: body.name,
        jenis_buah: body.jenis_buah,
        stok: body.stok,
        harga: body.harga,
        storeId: req.decode.id
    })
    res.send({
        status: "created",
        message: "Product added!",
    });
})

app.delete('/product/delete/', verifyToken, (req, res) => {
    let body = req.body
    
    if(req.decode.role != 'store'){
        res.send({
            "status" : "failed",
            "msg" : "role is incorrect"
        })
    }
    
    model.product.destroy({
        where: { id: body.id }
    })   
    res.send({
        message: "Product deleted!"
    })
})

app.post('/product/update', verifyToken, (req, res) => {
    let body = req.body
    
    if(req.decode.role != 'store'){
        res.send({
            "status" : "failed",
            "msg" : "role is incorrect"
        })
    }

    model.product.update(
        {   nama_product: body.name,
            jenis_buah: body.jenis_buah,
            stok: body.stok,
            harga: body.harga
        },
        { where: { id: body.id } }
    )

    res.send({
        status : "ok"
    })
})

app.post('/product/view', async(req, res) => {
    let body = req.body
    const data = await model.product.findAll({where: {storeId : body.id}})
    res.send({
        "status" : 'ok',
        "data" : data
    });
})


app.listen(4000)
