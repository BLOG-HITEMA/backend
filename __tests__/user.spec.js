const {app} = require("../app");
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const request = require("supertest");
const mongoose = require("mongoose")

const baseUrl = "/api/users"

// Tester la route POST de user sans BD
describe("Tester la route api/users/signup", () => {
  it("Doit ajouter et retourner un status 201", () => {
    const user = {
      name: "Deadpool",
      firstname: "Deadool",
      password: "secret1234",
      email: "deadpool@gmail.com",
      role: "editor"
    }
    const result = request(app)
      .post(baseUrl+"/signup")
      .send(user)
      .expect(201);
  });
  // Vérifier dans le cas où l'utilisateurs oublie de mettre une donnée
  it.each([
    { name: "PasDeEmail",firstname:"firstnameTest",password:"test123",role:"editor" }, 
    { password: "PasdeName",firstname:"testing",email:"test@jest.fr",role:"autor" },
    { name: "PasdePassword",firstname:"testing",email:"test@jest.fr",role:"autor"},
    { name: "PasdeRole",firstname:"testing",email:"test@jest.fr", password:"Test123"},
  ])(
    "Si l'utilisateur ne mets pas une des données demandés",
    (invalidObject) => {
      const result = request(app)
        .post(baseUrl+"/signup")
        .send(invalidObject)
        .expect(422);
    }
  );
})

// Se connecter à MONGO DB
beforeEach((done) => {
	mongoose.connect(
		process.env.URL_MONGO,
		{ useNewUrlParser: true },
		() => done()
	)
})

// Vérifier si l'utilisateur a été bien ajouté dans MONGO
test("POST user to database and check if all data are inserted", async () => {
  // Générer un faux email
  let r = (Math.random() + 1).toString(36).substring(7);
  let email = r+"@gmail.com";
  const user = {
    name: "User1",
    firstname: "Firstname",
    password: "secret1234",
    email: email,
    role: "editor"
  }
  // Insérer l'utilisateur dans la BD
	const newUser = await User.create(user)

  setTimeout(async ()=>{
    request(app)
    //Récupérer l'utilisateur inséré avec son NAME
		.get("/api/users/User1")
		.expect(200)
		.then((response) => {
			
			expect(Array.isArray(response.body)).toBeTruthy()
			expect(response.body.length).toEqual(1)

			// Vérifier si les données qui se trouve dans le body
      // sont égaux aux données récupérer de la BD
      // pour conclure que l'utilisateur a été bien ajouté dans la BD
			expect(response.body[0]._id).toBe(newUser.id)
			expect(response.body[0].name).toBe(newUser.name)
			expect(response.body[0].firstname).toBe(newUser.firstname)
			expect(response.body[0].email).toBe(newUser.email)
			expect(response.body[0].role).toBe(newUser.role)
		}).catch((ex)=>{})
    // Supprimer l'utilisateur de test.
    const delUser = await User.deleteOne({email: email});
  },4000)
})

// Fermer la connexion
afterEach((done) => {
	mongoose.connection.db.dropDatabase(() => {
		mongoose.connection.close(() => done())
	})
})