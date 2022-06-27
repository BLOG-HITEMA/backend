const express = require("express")
const bodyParser = require("body-parser")
const cors = require('cors')
const app = express();
const articlesRoutes = require('./routes/articles-routes');
const usersRoutes = require('./routes/users-routes');
const mongoose = require('mongoose');
require('dotenv').config();

const port = process.env.PORT;
app.use(bodyParser.json())
app.use(cors());

// Les routes de base (Articles & Users)
app.use("/api/articles", articlesRoutes);
app.use('/api/users', usersRoutes) 

if(process.env.NODE_ENV !== "test"){
    // Essayer de se connecter à la BD MONGO
    mongoose
    .connect(process.env.URL_MONGO)
    .then(() => {
        // Si c'est bon on lance le serveur
        console.log('Connected to database');
        app.listen(port, () => {
            console.log('Listenning... '+port);
        });
    })
    .catch(err => {
        console.log(err)
    });
}

module.exports= {app};

