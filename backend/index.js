const express = require('express')
const cors = require('cors')
const model = require('./model.js')
const crypto = require('crypto')
const jwt = require("jsonwebtoken");
const verifyToken = require('./verify.js');
const { Op } = require('sequelize');

let app = express()
app.use(express.json())
app.use(cors())

app.use(express.static('../frontend/PPL'))

// api untuk register customer
app.post('/customer/register', async (req, res) => {
    let body = req.body
    let passwordHash = crypto.createHash('sha256').update(body.password).digest('base64')

    try {
        const customer = await model.customer.create({
            "email": body.email,
            "password": passwordHash,
            "username": body.username,
            "alamat": body.alamat,
            "nama": body.nama
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

// api untuk login customer
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

// api untuk update data customer
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

    if (body.alamat)
        customer.alamat = body.alamat
    if (body.nama)
        customer.nama = body.nama
    if (body.nomor_hp)
        customer.nomor_hp = body.nomor_hp
    if (body.kota)
        customer.kota = body.kota
    if (body.tanggal_lahir)
        customer.tanggal_lahir = body.tanggal_lahir
    customer.save()

    return res.send({
        status: "ok"
    })
})

// api untuk mendapatkan data customer
app.post('/customer/retrieve/data', verifyToken, async (req, res) => {

    if (req.decode.role != 'customer') {
        return res.send({
            "status": "failed",
            "msg": "role is incorrect"
        })
    }
    const customer = await model.customer.findByPk(req.decode.id)
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

// api untuk search product customer
app.post('/customer/search/product', verifyToken, async (req, res) => {
    if (req.decode.role != 'customer') {
        return res.send({
            "status": "failed",
            "msg": "role is incorrect"
        })
    }

    let body = req.body
    let product = await model.product.findAll({
        include : model.store,
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


// api untuk mendapatkan product
app.post('/customer/get/products', verifyToken, async (req, res) => {
    if (req.decode.role != 'customer') {
        return res.send({
            "status": "failed",
            "msg": "role is incorrect"
        })
    }

    let product = await model.product.findAll({
        include : model.store,
    })

    return res.send({
        "status": "ok",
        data: product
    })
})

app.post('/customer/retrieve/product',verifyToken,async(req,res)=>{
    if (req.decode.role != 'customer') {
        return res.send({
            "status": "failed",
            "msg": "role is incorrect"
        })
    }
    let body = req.body
    let product = await model.product.findOne(
        {
            include : model.store,
            where : {id : body.productId}
    })
    return res.send({
        "status" : "ok",
        data : product
    })
})
app.post('/customer/retrieve/order',verifyToken,async(req,res)=>{
    let body = req.body
    if (req.decode.role != 'customer') {
        return res.send({
            "status": "failed",
            "msg": "role is incorrect"
        })
    }
    let order = await model.order.findAll(
        {
            include : [
                model.shipping_details,
                {
                    model : model.order_details,
                    include : model.product
                }
                ],
            where : { customerId : req.decode.id}
        }
    )
    return res.send({
        status : "ok",
        data : order
    })
})
app.post('/customer/topup', verifyToken, async (req, res) => {
    let body = req.body
    if (req.decode.role != 'customer') {
        return res.send({
            "status": "failed",
            "msg": "role is incorrect"
        })
    }
    let customer = await model.customer.findByPk(req.decode.id)
    customer.saldo = customer.saldo + body.saldo
    customer.save()
    return res.send({
        status: 'ok'
    })
})
// api untuk register store
app.post('/store/register', async (req, res) => {
    let body = req.body
    let passwordHash = crypto.createHash('sha256').update(body.password).digest('base64')

    try {
        const customer = await model.store.create({
            "email": body.email,
            "password": passwordHash,
            "nama_toko": body.nama_toko,
            "alamat": body.alamat,
            "nama": body.nama
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

// api untuk login store
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

// api untuk update data store
app.post('/store/update', verifyToken, async (req, res) => {
    let body = req.body
    console.log(req.decode)
    if (req.decode.role != 'store') {
        res.send({
            "status": "failed",
            "msg": "role is incorrect"
        })
    }
    let store = await model.store.findByPk(req.decode.id)
    if (body.alamat)
        store.alamat = body.alamat
    if (body.nama_toko)
        store.nama_toko = body.nama_toko
    if (body.nomor_hp)
        store.nomor_hp = body.nomor_hp
    if (body.kota)
        store.kota = body.kota
    store.save()

    res.send({
        status: "ok",
    })
})

// api untuk mengambil data store
app.post('/store/retrieve/data', verifyToken, async (req, res) => {

    if (req.decode.role != 'store') {
        return res.send({
            "status": "failed",
            "msg": "role is incorrect"
        })
    }
    const store = await model.store.findByPk(req.decode.id)

    res.send({
        "status": 'ok',
        "data": store
    })
})

// api untuk membuat product
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
        console.log(error)
        return res.send({
            "status": "failed"
        })
    }

})

// api untuk mengupdate product
app.post('/store/update/product', verifyToken, async (req, res) => {
    let body = req.body
    if (req.decode.role != 'store') {
        return res.send({
            "status": "failed",
            "msg": "role is incorrect"
        })
    }
    let product = await model.product.findByPk(body.productId)
    if (product == null) {
        return res.send({
            "status": "failed"
        })
    }

    if (body.nama_product)
        product.nama_product = body.nama_product
    if (body.stok)
        product.stok = body.stok
    if (body.harga)
        product.harga = body.harga

    product.save()

    return res.send({
        "status": "ok"
    })
})

// api untuk mendapatkan products
app.post('/store/get/products', verifyToken, async (req, res) => {
    if (req.decode.role != 'store') {
        return res.send({
            "status": "failed",
            "msg": "role is incorrect"
        })
    }

    let product = await model.product.findAll({ where: { storeId: req.decode.id } })
    return res.send({
        status: 'ok',
        data: product
    })
})

// api untuk mendapatkan data product
app.post('/store/retrieve/product', verifyToken, async (req, res) => {
    if (req.decode.role != 'store') {
        return res.send({
            "status": "failed",
            "msg": "role is incorrect"
        })
    }
    let body = req.body
    let product = await model.product.findByPk(body.productId, { include: model.order_details })
    let sold = product.order_details.length
    return res.send({
        status: 'ok',
        data: product,
        sold: sold
    })
})

// api untuk menghapus product
app.post('/store/delete/product/', verifyToken, async (req, res) => {
    let body = req.body

    if (req.decode.role != 'store') {
        res.send({
            "status": "failed",
            "msg": "role is incorrect"
        })
    }

    await model.product.destroy({
        where: { id: body.productId }
    })
    return res.send({
        status: "ok"
    })
})

app.post('/store/retrieve/order',verifyToken,async(req,res)=>{
    if (req.decode.role != 'store') {
        res.send({
            "status": "failed",
            "msg": "role is incorrect"
        })
    }
    let order = await model.order.findAll(
        {
            include : [
                model.shipping_details,
                {
                    model : model.order_details,
                    include : model.product
                }
                ],
            where : { storeId : req.decode.id , status : "PAID" }
        }
    )
    return res.send({
        status : 'ok',
        data : order
    })
})
// api untuk register transport
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
            "status": "failed",
            "msg": "email is already registered"
        })
    }

})

// api login transport
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

// api untuk update transport
app.post('/transport/update', verifyToken, async (req, res) => {
    let body = req.body

    if (req.decode.role != 'transport') {
        return res.send({
            "status": "failed",
            "msg": "role is incorrect"
        })
    }
    let transport = await model.courier.findOne(req.decode.id)
    if (transport == null) {
        return res.send({
            "status": "failed"
        })
    }
    if (body.alamat)
        transport.alamat = body.alamat
    if (body.nama_courier)
        transport.nama_courier = body.nama_courier
    if (body.nomor_hp)
        transport.nomor_hp = body.nomor_hp
    if (body.kota)
        transport.kota = body.kota
    transport.save()

    return res.send({
        status: "ok",
    })
})

app.post('/transport/add/type', verifyToken, async (req, res) => {
    let body = req.body

    const type = await model.typeShipment.create({
        "tipe": body.tipe,
        "fee": body.fee,
        "courierId": req.decode.id
    })
    return res.send({
        "status": "ok"
    })
})
// api untuk mendapatkan data transport
app.post('/transport/retrieve/data', verifyToken, async (req, res) => {

    if (req.decode.role != 'transport') {
        res.send({
            "status": "failed",
            "msg": "role is incorrect"
        })
    }
    const transport = await model.courier.findByPk(req.decode.id)

    return res.send({
        "status": 'ok',
        "data": transport
    })
})

// api untuk mendapatkan shipment details
app.post('/retrieve/shipment/details', verifyToken, async (req, res) => {

    let body = req.body
    if (req.decode.role != 'transport') {
        res.send({
            "status": "failed",
            "msg": "role is incorrect"
        })
    }
    let data = await model.shipping_details.findAll(
        {
            include : [
                {
                    model : model.typeShipment,
                    where: { courierId: req.decode.id }
                },
                {
                    model : model.order,
                    include : [model.store,model.customer]
                }
            ],
            where : {status : body.filter}
        }
    )
    return res.send({
        "status": 'ok',
        "data": data
    })
})

// api untuk update shipment details
app.post('/shipment/update/details', verifyToken, async (req, res) => {

    if (req.decode.role != 'transport') {
        res.send({
            "status": "failed",
            "msg": "role is incorrect"
        })
    }

    let body = req.body
    let data = await model.shipping_details.findByPk(body.shipmentId)
    data.status = body.status
    data.save()

    return res.send({
        "status": "ok"
    })
})

//api untuk membuat order
app.post('/customer/create/order', verifyToken, async (req, res) => {
    let body = req.body
    if (req.decode.role != 'customer') {
        res.send({
            "status": "failed",
            "msg": "role is incorrect"
        })
    }

    //bikin record order
    let order = await model.order.create({
        status: "UNPAID",
        customerId: req.decode.id,
    })

    //bikin order detail untuk tiap jenis product yang dibeli
    let result = body.order_details
    let store
    for (let i = 0; i < result.length; ++i) {
        var harga_satuan = await model.product.findOne({
            attributes: ['harga'],
            include: model.store,
            where: { id: result[i].productId }
        },
        )
        let orders_details = await model.order_details.create({
            jumlah: result[i].jumlah,
            harga: harga_satuan.harga * result[i].jumlah,
            orderId: order.id,
            productId: result[i].productId
        })
        store = harga_satuan.store
    }
    order.storeId = store.id
    await order.save()

    //bikin shipping details
    let customer = await model.customer.findByPk(order.customerId)

    let ship = await model.shipping_details.create({
        alamat_sender: customer.alamat,
        alamat_receiver: store.alamat,
        orderId: order.id,
        typeShipmentId: body.typeShipmentId
    })
    let typeShipment = await model.typeShipment.findByPk(ship.typeShipmentId)
    let fee = typeShipment.fee
    //itung total harga, update total harga di order
    var total = await model.order_details.sum('harga', { where: { orderId: order.id } });
    total = total + fee

    await model.order.update(
        {
            total_harga: total
        },
        { where: { id: order.id } }
    )
    return res.send({
        status: 'ok'
        "orderId" : order.id
    })
})

app.post('/customer/order/payment/', async (req, res) => {
    let body = req.body
    var order = await model.order.findOne(
        {
            include: model.customer,
            where: { id: body.orderId }
        },
    )

    var user = order.customer

    let store = await model.store.findByPk(order.storeId)
    //itung sisa saldo 
    var sisa = user.saldo - order.total_harga
    if (sisa < 0) {
        return res.send({
            "status": "failed",
            "message": "Saldo tidak cukup!",
        })
    }
    var total = await model.order_details.sum('harga', { where: { orderId: body.orderId } });

    user.saldo = sisa
    await user.save();

    store.saldo = store.saldo + total
    await store.save()

    order.payment_date = Date.now()
    order.status = "PAID"
    await order.save();
    //update status di shipping_details jadi "IN"
    var transport = await model.shipping_details.findOne(
        {
            include: [
                {
                    model: model.typeShipment,
                    include: model.courier
                },
            ],
            where : { orderId: order.id }
        }
    );

    transport.status = "IN"
    console.log(transport.typeShipment)
    transport.typeShipment.courier.saldo += transport.typeShipment.fee
    await transport.typeShipment.courier.save()
    await transport.save();

    return res.send({
        "status": 'ok'
    })

})

// app.post('/order/retrieve/data', async (req, res) => {
//     let body = req.body

//     let order = await model.order.findOne(
//         {
//             include : [
//                 model.shipping_details,
//                 {
//                     model : model.order_details,
//                     include : model.product
//                 }
//                 ],
//             where : { orderId :  , status : "PAID" }
//         }
//     )
//     return res.send({
//         "status": 'ok',
//         "data": order,
//     })
// })
app.listen(process.env.APP_PORT)
