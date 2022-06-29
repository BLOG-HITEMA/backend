const { Article } = require('../models/article');
const { app } = require("../app");
const request = require("supertest");
const mongoose = require("mongoose");

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

beforeEach((done) => {
	mongoose.connect(
		process.env.URL_MONGO,
		{ useNewUrlParser: true },
		() => done()
	)
})

afterEach((done) => {
	mongoose.connection.close(() => done())
})

beforeAll(async() => {
    mongoose.connect(
		process.env.URL_MONGO,
		{ useNewUrlParser: true }
	)

    const article = new Article({
        _id : "abcdf8f8f8f8f8f8f8f8f8f8",
        title: "Titre initial",
        content: "Contenu initial",
        published: false,
        image: "image.png",
        message: "Message initial"
    });

    await article.save();

    mongoose.connection.close();
});

afterAll( async () => {
    await Article.findByIdAndDelete("abcdf8f8f8f8f8f8f8f8f8f8");
    // mongoose.connection.close(() => done())
});

describe("CRUD Articles", () => {
    // Ne pas créer un nouvel article
    it.each(articlesInvalid)(
        "POST /create devrait refuser %p sans l'insérer.",
        async (invalidObject) => {
            const result = await request(app)
                .post("/api/articles/create")
                .send(invalidObject)
                .expect(400)
                .expect("Content-Type", /json/)
            ;
        }
    );
    // Créer un nouvel article
    it.each(articlesValid)(
        "POST /create devrait insérer %p dans les articles.",
        
        async (article) => {
            const result = await request(app)
                .post("/api/articles/create")
                .send(article)
            ;
            expect(201);
        }

    );


    // Ne pas mettre à jour un article
    it.each(articlesInvalid)(
        "PATCH /update/:id ne devrait pas insérer %p dans les articles.", 
        async (articleUpdated) => {
            const article = new Article({
                _id : "abcdf8f8f8f8f8f8f8f8f8f8",
                title: "Titre initial",
                content: "Contenu initial",
                published: false,
                image: "image.png",
                message: "Message initial"
            });

            const articleInitial = {...article};

            const result = await request(app)
                .patch("/api/articles/update/abcdf8f8f8f8f8f8f8f8f8f8")
                .send(articleUpdated)
                .expect(400)
                .expect("Content-Type", /json/)
            ;

            expect(article).toEqual(articleInitial);
        }
    );
    // Mettre à jour un article
    it.each(articlesValid)(
        "PATCH /update/:id devrait insérer %p dans les articles.", 
        async (articleUpdated) => {
            const articleInitial = await Article.findById("abcdf8f8f8f8f8f8f8f8f8f8");

            const result = await request(app)
                .patch("/api/articles/update/abcdf8f8f8f8f8f8f8f8f8f8")
                .send(articleUpdated)
                .expect(200)
                .expect("Content-Type", /json/)
            ;

            expect(result.body).not.toEqual(articleInitial._doc);
        }
    );


    // Ne pas supprimer un article
    it("DELETE /delete/:id ne devrait pas supprimer un article.", 
        async () => {
            const result = await request(app)
                .delete("/api/articles/delete/abcdf8f8f8f8f8f8f8f8f8f9")
                .expect(404)
                .expect("Content-Type", /json/);

        }
    );

    // Supprimer un article
    it("DELETE /delete/:id devrait supprimer un article.", 
        async () => {
            const result = await request(app)
                .delete("/api/articles/delete/abcdf8f8f8f8f8f8f8f8f8f8")
                .expect(200)
            ;
        }
    );
})