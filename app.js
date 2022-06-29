const express = require("express")
const bodyParser = require("body-parser")
const cors = require('cors')
const app = express();
const articlesRoutes = require('./routes/articles-routes');
require('dotenv').config();
const usersRoutes = require('./routes/users-routes');
const journalsRoutes = require('./routes/journals-routes');
const mongoose = require('mongoose');

const port = process.env.PORT;
app.use(bodyParser.json())
app.use(cors());

// Les routes de base (Articles & Users)
app.use("/api/articles", articlesRoutes);
app.use('/api/users', usersRoutes); 
app.use('/api/journals', journalsRoutes); 

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

