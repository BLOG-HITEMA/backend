const express = require("express")
const bodyParser = require("body-parser")
const cors = require('cors')
const app = express();
require('dotenv').config();

const port = process.env.PORT;
app.use(bodyParser.json())
app.use(cors());

app.get('/home', (req, res)=>{
    console.log('hehe');
    res.send('HELLO WORLD')
})

app.listen(port, () => console.log('Listenning on '+port));


