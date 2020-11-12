const express = require('express')
const cors = require('cors')
const model = require('./model.js')

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

    const user = await db.user.findOne({where : {username : body.username,password : passwordHash}})
    if(user == null){
        return res.send({
            "status" : "failed",
            "message" : "wrong credential" 
        })
    }
    let payload = {
        "username" : body.username
    }
    const token = jwt.sign(payload,process.env.SECRET_KEY)
    return res.send({
        "status" : "ok",
        token
    })
})