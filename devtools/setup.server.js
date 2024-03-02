'use strict'

const express = require('express')

const bodyParser = require('body-parser')

const app = express()



const fs = require('fs');
const jsonfile = require('jsonfile')


const path = require('path');
app.use(bodyParser.urlencoded({ extended: true }))

app.use(express.json({limit: '50mb'}));



app.get('/', (req, res) => {

    res.sendFile(path.join(__dirname, '/public/setup.html'));

})

app.post('/upload', (req, res) => {

    var r = Date.now();

   

    ensureDirectoryExistence("c.capcha-images/"+r);
    jsonfile.writeFileSync("c.capcha-images/"+r,req.body);


    return res.json( { status: 'added'} );

})

function ensureDirectoryExistence(filePath) {
    var dirname = path.dirname(filePath);
    if (fs.existsSync(dirname)) {
      return true;
    }
    ensureDirectoryExistence(dirname);
    fs.mkdirSync(dirname);
}


app.listen(3000, () => {

    console.log('server started on port 3000')

})