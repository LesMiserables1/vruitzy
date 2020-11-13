const express = require('express')
const cors = require('cors')
const model = require('./model.js')
const crypto = require('crypto')
var jwt = require("jsonwebtoken");

let app = express()
app.use(express.json())
app.use(cors())


app.post('/user/register',(req,res)=>{
    let body = req.body
    res.send(200)
})

app.post('/user/login',async(req,res)=>{
    let body = req.body
    let passwordHash = crypto.createHash('sha256').update(body.password).digest('base64')

    const user = await db.user.findOne({ where: { username: body.username, password: passwordHash } })
    if (user == null) {
        return res.send({
            "status": "failed",
            "message": "wrong credential"
        })
    }
    let payload = {
        "username": body.username
    }
    const token = jwt.sign(payload, process.env.SECRET_KEY)
    return res.send({
        "status": "ok",
        token
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
