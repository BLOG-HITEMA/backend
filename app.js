const express = require("express")
const bodyParser = require("body-parser")
const cors = require('cors')
const app = express();
const articlesRoutes = require('./routes/articles-routes');
require('dotenv').config();
const usersRoutes = require('./routes/users-routes');
const journalsRoutes = require('./routes/journals-routes');
const mongoose = require('mongoose');

app.use(bodyParser.json())
const corsOption = {
    exposedHeaders: "Authorization"
}
app.use(cors(corsOption));

const port = process.env.PORT;

app.use((req, res, next) => {
    res.setHeader('Access-Controll-Allow-Origin', '*');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Origin, X-Request-With, Content-Type, Accept, Authorization'
    );
    res.setHeader('Access-Control-Allow-Methods','GET, POST, PATCH, DELETE');

    next();
})

// Les routes de base (Articles & Users)
app.use("/api/articles", articlesRoutes);
app.use('/api/users', usersRoutes); 
app.use('/api/journals', journalsRoutes); 

// Si on demande une route qui n'existe pas
app.use((req, res, next) => {
    const error = new HttpError('La route est introuvable!',404);
    throw error;
});

app.use((error, req, res, next) => {
    if(res.headerSent){
        return next(error)
    }
    res.status(error.code || 500);
    res.json({message : error.message || 'Erreur inconnu!'});
})

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

