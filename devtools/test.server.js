'use strict'


const express = require('express')
const session = require('express-session');




const app = express()

app.use(express.json());

const captcha = require('../cdotcaptcha').create()
const path = require('path');

app.use(session({

    secret: 'keyboard cat',

    resave: false,

    saveUninitialized: true,

}))

app.use('/c.captcha',express.static('dist'));

app.get('/', (req, res) => {

    res.sendFile(path.join(__dirname, '/public/test.html'));

})

app.post('/captcha/challenge',captcha.challenge)

app.get('/checkverified', (req, res) => {

    res.type('html')

    res.end('<p>CAPTCHA VALID: '+ captcha.isVerified(req) +'</p>')

})


app.listen(80, () => {

    console.log('server started')

})