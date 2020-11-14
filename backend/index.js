const express = require('express')
const cors = require('cors')
const model = require('./model.js')
const crypto = require('crypto')
const jwt = require("jsonwebtoken");
const verifyToken = require('./verify.js')
let app = express()
app.use(express.json())
app.use(cors())


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
