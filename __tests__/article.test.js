const { app } = require("../app");
const request = require("supertest");

describe("CRUD Articles", () => {

    // Ne pas créer un nouvel article
    it.each([
            {  }, // Aucun des 2 paramètres requis
            { title : "" }, // 1 seul paramètre requis mais vide
            { title : 10 }, // 1 seul paramètre requis mais n'est pas une string 
            { title : "test title" }, // 1 seul paramètre requis
            { title : "test title", content : "" }, // 2 paramètres requis mais un vide
            { title : "test title", content : 234567 }, // 2 paramètres requis mais l'un n'est pas une string
        ])(
        "POST /create devrait refuser %p sans l'insérer.",
        async (invalidObject) => {
            const result = await request(app)
                .post("/api/articles/create")
                .send(invalidObject)
                .expect(400);
        }
    );

    // Créer un nouvel article
    it.each([
        { title : "test title", content : "test content" },
    ])(
    "POST /create devrait insérer %p. dans les articles.",
    async () => {
        const result = await request(app)
            .post("/api/articles/create")
            .expect(201);
    }
);
})