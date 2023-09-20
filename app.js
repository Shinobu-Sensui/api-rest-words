const express = require('express')
const morgan = require('morgan')
const app = express()
const bodyParser = require('body-parser')

app
   .use(function(req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    })
    .use(bodyParser.json())
    .use(morgan('dev'))

require('./routes/login')(app)
require('./routes/loadRoutes')(app)

app.listen(8000, () => console.log('Connexion au serveur établie.'))



