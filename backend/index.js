const express = require('express')
const cors = require('cors')
const model = require('./model.js')

let app = express()
app.use(express.json())
app.use(cors())

app.post('/register',(req,res)=>{
    let body = req.body
    res.send(200)
})

app.post('/login',async(req,res)=>{
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

app.post('/registertransport', (req, res)=>{
 if (!req.body.nama_courier || !req.body.password || !req.body.email) {
     return res.send({
        message: 'Please provide a name, email and a password.',
     });
   } else {
       const newUser = await courier.create({
         nama_courier: req.body.nama_courier,
         email: req.body.email,
         password: req.body.password
       });

       return res.send({
        status: "created",
           message: "Account created!",
        });
    }
};

app.post('/logintransport',async(req,res)=>{
    let passwordHash = crypto.createHash('sha256').update(req.body.password).digest('base64')

    const user = await courier.findOne({where : {email : body.email, password : passwordHash}})
    if(user == null){
        return res.send({
            "status" : "failed",
            "message" : "wrong credential" 
        })
    }
    let payload = {
        "email" : body.email
    }
    const token = jwt.sign(payload,process.env.SECRET_KEY)
    return res.send({
        "status" : "ok",
        token
    })
})


app.get('/viewshipment', (req, res) => {
    shipping_details.findAll({
        include: [
            { model: shipping_details, where: { id: req.body.courierId, status: req.body.shipStatus } }
        ]
    })
    .then(data => res.json(data))
})
