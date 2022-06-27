const express = require("express")
const bodyParser = require("body-parser")
const cors = require('cors')
const app = express();
require('dotenv').config();
const usersRoutes = require('./routes/users-routes');

const port = process.env.PORT;
app.use(bodyParser.json())
app.use(cors());


app.use('/api/users', usersRoutes) 


app.listen(port, () => console.log('Listenning on '+port));


