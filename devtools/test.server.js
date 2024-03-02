'use strict'

//intialize some stuff like express and sessions

const express = require('express')
const session = require('express-session');

const app = express()

app.use(express.json());

const path = require('path');

app.use(session({

    secret: 'keyboard cat',

    resave: false,

    saveUninitialized: true,

}))

// inti captcha

const captcha = require('../cdotcaptcha').create()




// init captcha js and css to use in frontend html

app.use('/c.captcha',express.static('dist'));

/// init html test file

app.get('/', (req, res) => {

    res.sendFile(path.join(__dirname, '/public/test.html'));

})

// init challange url for captcha backend

app.post('/captcha/challenge',captcha.challenge)

//test your cptcha status

app.get('/checkverified', (req, res) => {

    res.type('html')

    res.end('<p>CAPTCHA VALID: '+ captcha.isVerified(req) +'</p>')

})

// run server

app.listen(80, () => {

    console.log('server started')

})