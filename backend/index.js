const express = require('express')
const cors = require('cors')
const model = require('./model.js')
const crypto = require('crypto')
const jwt = require("jsonwebtoken");
const verifyToken = require('./verify.js');
const { store } = require('./model.js');
const { Op } = require('sequelize')
let app = express()
app.use(express.json())
app.use(cors())

// api untuk customer
app.post('/customer/register', async (req, res) => {
    let body = req.body
    let passwordHash = crypto.createHash('sha256').update(body.password).digest('base64')

    try {
        const customer = await model.customer.create({
            "email": body.email,
            "password": passwordHash
        })
        return res.send({
            status: 'ok'
        })
    } catch (error) {
        return res.send({
            status: 'failed',
            msg: "email is already registered"
        })
    }
})

app.post('/customer/login', async (req, res) => {
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
        "role": "customer",
        "id": customer.id
    }
    const token = jwt.sign(payload, process.env.SECRET_KEY)
    return res.send({
        "status": "ok",
        token
    })
})

app.post('/customer/update', verifyToken, async (req, res) => {
    let body = req.body

    if (req.decode.role != 'customer') {
        res.send({
            "status": "failed",
            "msg": "role is incorrect"
        })
    }
    let customer = await model.customer.findOne({ id: req.decode.id })
    if (customer == null) {
        return res.send({
            "status": "failed",
            "msg": "user does not exist"
        })
    }
    customer.alamat = body.alamat
    customer.nama = body.nama
    customer.nomor_hp = body.nomor_hp
    customer.kota = body.kota
    customer.tanggal_lahir = body.tanggal_lahir
    customer.save()

    return res.send({
        status: "ok"
    })
})

app.post('/customer/retrieve/data', verifyToken, async (req, res) => {

    if (req.decode.role != 'customer') {
        return res.send({
            "status": "failed",
            "msg": "role is incorrect"
        })
    }


    const customer = await model.customer.findOne({ id: req.decode.id })
    if (customer == null) {
        return res.send({
            "status": "failed",
            "msg": 'user does not exist'
        })
    }
    return res.send({
        "status": 'ok',
        "data": customer
    })
})


// api untuk store
app.post('/store/register', async (req, res) => {
    let body = req.body
    let passwordHash = crypto.createHash('sha256').update(body.password).digest('base64')

    try {
        const customer = await model.store.create({
            "email": body.email,
            "password": passwordHash
        })
        return res.send({
            status: 'ok'
        })
    } catch (error) {
        return res.send({
            status: "failed"
        })
    }

})

app.post('/store/login', async (req, res) => {
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
        "role": "store",
        "id": store.id
    }
    const token = jwt.sign(payload, process.env.SECRET_KEY)
    return res.send({
        "status": "ok",
        token
    })
})

app.post('/store/update', verifyToken, async (req, res) => {
    let body = req.body
    console.log(req.decode)
    if (req.decode.role != 'store') {
        res.send({
            "status": "failed",
            "msg": "role is incorrect"
        })
    }
    let store = await model.store.findOne({ id: req.decode.id })
    store.alamat = body.alamat
    store.nama_toko = body.nama_toko
    store.nomor_hp = body.nomor_hp
    store.kota = body.kota
    store.save()

    res.send({
        status: "ok",
    })
})

app.post('/store/retrieve/data', verifyToken, async (req, res) => {

    if (req.decode.role != 'store') {
        return res.send({
            "status": "failed",
            "msg": "role is incorrect"
        })
    }
    const store = await model.store.findOne({ id: req.decode.id })

    res.send({
        "status": 'ok',
        "data": store
    })
})

// api untuk product
app.post('/store/create/product', verifyToken, async (req, res) => {

    let body = req.body
    if (req.decode.role != 'store') {
        return res.send({
            "status": "failed",
            "msg": "role is incorrect"
        })
    }
    try {
        let product = await model.product.create({
            nama_product: body.nama_product,
            jenis_buah: body.jenis_buah,
            stok: body.stok,
            harga: body.harga,
            storeId: req.decode.id
        })
        return res.send({
            "status": 'ok'
        })
    } catch (error) {
        return res.send({
            "status": "failed"
        })
    }

})

app.post('/store/update/product', verifyToken, async (req, res) => {
    let body = req.body
    if (req.decode.role != 'store') {
        return res.send({
            "status": "failed",
            "msg": "role is incorrect"
        })
    }
    let product = await model.product.findOne({
        id: body.id,
    })
    if (product == null) {
        return res.send({
            "status": "failed"
        })
    }
    product.name_product = body.name_product
    product.jenis_buah = body.jenis_buah
    product.stok = body.stok
    product.harga = body.harga

    product.save()

    return res.send({
        "status": "ok"
    })
})
app.post('/store/retrieve/product', verifyToken, async (req, res) => {
    if (req.decode.role != 'store') {
        return res.send({
            "status": "failed",
            "msg": "role is incorrect"
        })
    }

    let product = await model.product.findAll({
        storeId: req.decode.id
    })

    return res.send({
        status: 'ok',
        data: product
    })
})

app.post('/customer/search/product', verifyToken, async (req, res) => {
    if (req.decode.role != 'customer') {
        return res.send({
            "status": "failed",
            "msg": "role is incorrect"
        })
    }

    let body = req.body
    let product = await model.product.findAll({
        where: {
            nama_product: {
                [Op.like]: `%${body.query}%`
            }
        }
    })
    return res.send({
        "status": "ok",
        data: product
    })
})
app.post('/store/delete/product/', verifyToken, async (req, res) => {
    let body = req.body

    if (req.decode.role != 'store') {
        res.send({
            "status": "failed",
            "msg": "role is incorrect"
        })
    }

    await model.product.destroy({
        where: { id: body.id }
    })
    res.send({
        status: "ok"
    })
})
app.post('/customer/retrieve/product', verifyToken, async (req, res) => {
    if (req.decode.role != 'customer') {
        return res.send({
            "status": "failed",
            "msg": "role is incorrect"
        })
    }

    let product = await model.product.findAll()

    return res.send({
        "status": "ok",
        data: product
    })
})


/* 
    TODO :
    1. validasi role client apakah transport atau bukan
    2. validasi fungsi api
*/
app.post('/transport/register', async (req, res) => {
    let body = req.body
    let passwordHash = crypto.createHash('sha256').update(body.password).digest('base64')

    try {
        const transport = await model.courier.create({
            nama_courier: req.body.nama_courier,
            email: req.body.email,
            password: passwordHash
        })
        return res.send({
            status: "ok",
        })
    } catch (error) {
        return res.send({
            "status" : "failed",
            "msg" : "email is already registered"
        }) 
    }

})


app.post('/transport/login', async (req, res) => {
    let body = req.body
    let passwordHash = crypto.createHash('sha256').update(req.body.password).digest('base64')

    const transport = await model.courier.findOne({ where: { email: body.email, password: passwordHash } })
    if (transport == null) {
        return res.send({
            "status": "failed",
            "message": "wrong credential"
        })
    }
    let payload = {
        "role": "transport",
        "id": transport.id
    }
    const token = jwt.sign(payload, process.env.SECRET_KEY)
    return res.send({
        "status": "ok",
        token
    })
})

app.post('/transport/update', verifyToken, async (req, res) => {
    let body = req.body

    if (req.decode.role != 'transport') {
        return res.send({
            "status": "failed",
            "msg": "role is incorrect"
        })
    }
    let transport = await model.courier.findOne({ id: req.decode.id })
    if(transport == null){
        return res.send({
            "status" : "failed"
        })
    }
    transport.alamat = body.alamat
    transport.nama_courier = body.nama_courier
    transport.nomor_hp = body.nomor_hp
    transport.kota = body.kota
    transport.save()

    return res.send({
        status: "ok",
    })
})

app.post('/transport/retrieve/data', verifyToken, async (req, res) => {

    if (req.decode.role != 'transport') {
        res.send({
            "status": "failed",
            "msg": "role is incorrect"
        })
    }
    const transport = await model.transport.findOne({ id: req.decode.id })

    return res.send({
        "status": 'ok',
        "data": transport
    })
})

app.get('/transport/details',verifyToken, async (req, res) => {
    
    if (req.decode.role != 'transport') {
        res.send({
            "status": "failed",
            "msg": "role is incorrect"
        })
    }
    let data = await model.shipping_details.findAll({
        where: { id: req.body.courierId, status: { [Op.or]: ['ON DELIVERY', 'DELIVERED'] } }
    })
    return res.send({
        "status": 'ok',
        "data": data
    })
})

app.post('/transport/update/details',verifyToken,async(req,res)=>{
    
    if (req.decode.role != 'transport') {
        res.send({
            "status": "failed",
            "msg": "role is incorrect"
        })
    }
    
    let body = req.body
    let data = await model.shipping_details.findByPk(body.id)
    data.status = body.status
    data.save()

    return res.send({
        "status" : "ok"
    })
})

//api order
app.post('/order/make', verifyToken, async (req, res) => {
    let body = req.body
    if (req.decode.role != 'customer') {
        res.send({
            "status": "failed",
            "msg": "role is incorrect"
        })
    }

    //bikin record order
    var order = model.order_details.create({
        status: "UNPAID",
        customerId: req.decode.id
    })

    //bikin order detail untuk tiap jenis product yang dibeli
    let result = body.order_details
    for (member in result) {
        var harga_satuan = model.product.findOne({
            attributes: ['harga']
        },
            {
                where: { id: member.productid }
            })
        model.order_details.create({
            jumlah: member.jumlah,
            harga: harga_satuan * member.jumlah,
            orderId: order.id
        })
    }

    //bikin shipping details
    const ship = model.shipping_details.create({
        alamat_sender: body.alamat_sender,
        alamat_reciever: body.reciever,
        fee: body.fee,
        orderId: order.id,
        courierId: body.courierId
    })

    //itung total harga, update total harga di order
    var total = model.order_details.sum('harga', { where: { orderId: order.id } });
    total = total + ship.fee

    model.order.update(
        {
            total_harga: total
        },
        { where: { id: oder.orderid } }
    )
})

app.post('/order/payment/', async (req, res) => {
    let body = req.body
    var order = model.order.findOne(
        { where: { id: body.orderid } }
    )

    var user = model.customer.findOne({
        where: { id: order.customerId }
    }
    );
    //itung sisa saldo 
    var sisa = user.saldo - order.total_harga
    if (sisa < 0) {
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
        where: { oderId: order.id }
    }
    );

    transport.status = "IN"
    await transport.save();

})

app.post('/order/ship', (req, res) => {
    let body = req.body
    //update status di shipping details jadi on delivery
    model.shipping_details.update(
        {
            status: 'ON DELIVERY'
        },
        { where: { orderId: body.orderid } }
    )
})

app.post('/order/retrieve/data', async (req, res) => {
    let body = req.body
    const order = await model.order.findOne({ id: body.id })
    const details = await model.order.findAll({ orderId: body.id })
    res.send({
        "status": 'ok',
        "data": order,
        "details": details
    })
})

app.listen(4000)
