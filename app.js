const express = require("express")
const bodyParser = require("body-parser")
const cors = require('cors')
const app = express();
require('dotenv').config();
const articlesRoutes = require('./routes/articles-routes');

const port = process.env.PORT;
app.use(bodyParser.json())
app.use(cors());

app.use("/api/articles", articlesRoutes);

app.listen(port, () => console.log('Listenning on '+port));


