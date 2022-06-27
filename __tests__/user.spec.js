const { app } = require("../app");
const User = require('../models/user');

const request = require("supertest");


describe("POST /signup", () => {

    it("Doit ajouter dans la BD et retourner => message : CREATED", async () => {
      const result = await request(app)
        .post("/signup")
        .send({
          name: "Toufik",
          firstname: "Taha",
          password: "test123",
          email: "taha@gmail.com",
          role: "creator"
        })
        .expect(201);
      expect(result.body).toEqual({
          message: "CREATED"
      });
    });
  
    it("should add to DB with hashed password", async () => {
      const result = await request(app)
        .post("/signup")
        .send({
          name: "MonTest",
          firstname:"Toto",
          password: "test123",
          email: "test@gmail.com",
          role:"editor"
        })
        .expect(201);
  
      const { id, found: user } = User.findByProperty("name", "MonTest");
      const hashedPassword = user.password;
      expect(hashedPassword).not.toMatch(/test123/);
    });
  });