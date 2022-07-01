const { Article } = require('../models/article');
const { app } = require("../app");
const request = require("supertest");
const mongoose = require("mongoose");
const User = require('../models/user');
const { login, signup } = require('../controllers/users-controllers');
const bcrypt = require('bcryptjs');

jest.setTimeout(10000);

describe("CRUD Articles", () => {
    const articlesValid = [
        { title : "test title", content : "test content" }, 
        { title : "test title", content : "test content", image : "image.png" },
        { title : "test title", content : "test content", image : "" },
        { title : "test title", content : "test content", image : "image.png", published : true },
        { title : "test title", content : "test content", image : "image.png", published : false },
        { title : "test title", content : "test content", image : "image.png", published : false, message : "test message" },
        { title : "test title", content : "test content", image : "image.png", published : true, message : "test message" },
        { title : "test title", content : "test content", image : "image.png", published : true, message : "" },
        { title : "test title", content : "test content", image : "image.png", published : false, message : "" }
    ];
    
    const articlesInvalid = [
        {  }, // Aucun des 2 paramètres requis
        { title : "" }, // 1 seul paramètre requis mais vide
        { title : 10 }, // 1 seul paramètre requis mais n'est pas une string 
        { title : "test title" }, // 1 seul paramètre requis
        { title : "test title", content : "" }, // 2 paramètres requis mais un vide
        { title : "test title", content : 234567 }, // 2 paramètres requis mais l'un n'est pas une string
    ];
    
    let article;
    // let token;

    async function signup() {
        const userSignup = {
            name: "User-Test", 
            firstname : "user", 
            email : "user1234test@gmail.com", 
            password : "test1234", 
            role : "author"
        }
        
        const userSignupMongoose = new User({
            ...userSignup,
            password : await bcrypt.hash(userSignup.password, 12)
        });
    
        await userSignupMongoose.save();
    };

    async function deleteUser() {
        const findUser = await User.findOne({email : "user1234test@gmail.com"});
    
        if(findUser){
            await User.findByIdAndDelete(findUser._id);
        }
    };

    async function connexion() {
        const userLogin = {
            email : "user1234test@gmail.com", 
            password : "test1234"
        }
    
        const login = await request(app)
            .post("/api/users/login")
            .send({
                email : userLogin.email,
                password : userLogin.password
            })
        ;
    
        let tokenConnexion = login.headers.authorization.split(' ')[1];
        return tokenConnexion;
    }
    
    beforeAll((done) => {
        mongoose.connect(
            process.env.URL_MONGO,
            { useNewUrlParser: true },
            () => done()
        )
    
        signup();
    });
    
    beforeEach( (done) => {
        mongoose.connect(
            process.env.URL_MONGO,
            { useNewUrlParser: true },
            async () => {
                const findArticle = await Article.findById("abcdf8f8f8f8f8f8f8f8f8f8");
            
                if (!findArticle) {
                    article = new Article({
                        _id : "abcdf8f8f8f8f8f8f8f8f8f8",
                        title: "Titre initial",
                        content: "Contenu initial",
                        published: false,
                        image: "image.png",
                        message: "Message initial"
                    });
            
                    await article.save();
                }
    
                done();
            }
        )
    })


    // Ne pas récupérer un article
    it("GET /:id ne devrait pas récupérer un article.",
        async () => {
            const result = await request(app)
                .get("/api/articles/abcdf8f8f8f8f8f8f8f8f8f9")
                .expect(404)
                .expect("Content-Type", /json/);
        }
    );
    // Récupérer un article
    it("GET /:id devrait récupérer un article.",
        async () => {
            const result = await request(app)
                .get("/api/articles/abcdf8f8f8f8f8f8f8f8f8f8")
                .expect(200)
                .expect("Content-Type", /json/);
        }
    );

    // Récupérer tous les articles
    it("GET / devrait récupérer tous les articles.",
        async () => {
            const result = await request(app)
                .get("/api/articles")
                .expect(200)
                .expect("Content-Type", /json/);
        }
    );


    // Ne pas créer un nouvel article
    it.each(articlesInvalid)(
        "POST / devrait refuser %p sans l'insérer.",
        (invalidObject) => {
            connexion()
                .then( async (token) => {
                    const result = await request(app)
                        .post("/api/articles/")
                        .set('Authorization', 'Bearer ' + token)
                        .send(invalidObject)
                        .expect(400)
                        .expect("Content-Type", /json/)
                    ;
                })
        }
    );
    // Créer un nouvel article
    it.each(articlesValid)(
        "POST / devrait insérer %p dans les articles.",
        
        (article) => {
            connexion()
                .then( async (token) => {
                    const result = await request(app)
                        .post("/api/articles/")
                        .set('Authorization', 'Bearer ' + token)
                        .send(article)
                    ;
                    expect(201);
                })
        }

    );


    // Ne pas mettre à jour un article
    it.each(articlesInvalid)(
        "PATCH /:id ne devrait pas insérer %p dans les articles.", 
        (articleUpdated) => {
            connexion()
                .then( async (token) => {
                    const articleInitial = {...article};

                    const result = await request(app)
                        .patch("/api/articles/abcdf8f8f8f8f8f8f8f8f8f8")
                        .set('Authorization', 'Bearer ' + token)
                        .send(articleUpdated)
                        .expect(400)
                        .expect("Content-Type", /json/)
                    ;

                    // expect(article).toEqual(articleInitial);
                })
        }
    );
    // Mettre à jour un article
    it.each(articlesValid)(
        "PATCH /:id devrait insérer %p dans les articles.", 
        (articleUpdated) => {
            connexion()
                .then( async (token) => {
                    const articleInitial = await Article.findById("abcdf8f8f8f8f8f8f8f8f8f8");

                    const result = await request(app)
                        .patch("/api/articles/abcdf8f8f8f8f8f8f8f8f8f8")
                        .set('Authorization', 'Bearer ' + token)
                        .send(articleUpdated)
                        .expect(200)
                        .expect("Content-Type", /json/)
                    ;

                    expect(result.body).not.toEqual(articleInitial._doc);
                })
        }
    );


    // Ne pas supprimer un article
    it("DELETE /:id ne devrait pas supprimer un article.", 
        () => {
            connexion()
                .then( async (token) => {
                    const result = await request(app)
                        .delete("/api/articles/abcdf8f8f8f8f8f8f8f8f8f9")
                        .set('Authorization', 'Bearer ' + token)
                        .expect(404)
                        .expect("Content-Type", /json/)
                    ;

                })
        }
    );
    // Supprimer un article
    it("DELETE /:id devrait supprimer un article.", 
        () => {
            connexion()
                .then( async (token) => {
                    const result = await request(app)
                        .delete("/api/articles/abcdf8f8f8f8f8f8f8f8f8f8")
                        .set('Authorization', 'Bearer ' + token)
                        .expect(200)
                    ;
                })
        }
    );


    it("POST /search/:page devrait récupérer les articles qui contiennent le terme recherché et sont publiés.",
        async () => {
            let articlesPublished = await Article.find();

            articlesPublished = articlesPublished.filter(
                article => 
                article.title == "titre" && article.published === true ||
                article.content == "titre" && article.published === true
            )

            const result = await request(app)
                .post("/api/articles/search/1")
                .send({
                    search: "titre"
                })
                .expect(200)
                .expect("Content-Type", /json/)
            ;

            expect(result.body.articles).toEqual(articlesPublished);
        }
    )


    afterEach( async () => {
        const findArticle = await Article.findById("abcdf8f8f8f8f8f8f8f8f8f8");
    
        if (findArticle) {
            await Article.findByIdAndDelete("abcdf8f8f8f8f8f8f8f8f8f8");
        }
        mongoose.connection.close()
    })
    
    afterAll( (done) => {
        // await Article.findByIdAndDelete("abcdf8f8f8f8f8f8f8f8f8f8");
        mongoose.connect(
            process.env.URL_MONGO,
            { useNewUrlParser: true },
            () => {
                deleteUser();
                done()
            }
        )
    
        // mongoose.connection.close(() => done())
    });
})

