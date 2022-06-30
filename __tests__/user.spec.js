const {app} = require("../app");
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const request = require("supertest");
const mongoose = require("mongoose")

const baseUrl = "/api/users"

// Tester la route POST de user sans BD
describe("Tester la route api/users", () => {
  // 1) la route api/users/signup
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
  // Si le mot de passe est vide, ont doit avoir une erreur
  it("Doit renvoyer une erreur si le mot de passe est vide", async () => {
    try {
      await new User({
        name: "Deadpool",
        firstname: "Deadool",
        password: "",
        email: "deadpool@gmail.com",
        role: "editor"
      }).save()
    } catch (err) {
      expect(err.errors.password.message).toContain("shorter")
    }
    //Supprimer l'utilisateur de test de la BD
    const delUser = await User.deleteOne({email: "deadpool@gmail.com"});
  })
  // Si le mot de passe est inférieur de 6 caractères on doit avoir une erreur
  it("Doit renvoyer une erreur si le mot de passe est inférieur de 6 caractères", async () => {
    try {
      await new User({
        name: "Deadpool",
        firstname: "Deadool",
        password: "12345",
        email: "deadpool@gmail.com",
        role: "editor"
      }).save()
    } catch (err) {
      expect(err.errors.password.message).toContain("is shorter than")
    }
    //Supprimer l'utilisateur de test de la BD
    const delUser = await User.deleteOne({email: "deadpool@gmail.com"});

  })
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

  // 2) La route PATCH api/users/:name
  it("Doit modifier et retourner un status 200", async () => {
    let nameUnique = (Math.random() + 1).toString(36).substring(7);
    const user = {
      name: nameUnique,
      firstname: "Deadool",
      password: "secret1234"
    }
    user.password = await bcrypt.hash(user.password, 12);
    const result = request(app)
      .patch(baseUrl+"/admin")
      .send(user)
      .expect(200);
  });
  // 3) La route DELETE api/users/:name
  it("Doit supprimer et retourner un status 200", async () => {
    const userDeTest = await User.create({
      name: "UserX",
      firstname: "FirstnameX",
      password: "secret1234",
      email: "testXX@gmail.com",
      role: "editor"
    })
    const result = request(app)
      .delete(baseUrl+"/UserX")
      .expect(200);
    await userDeTest.delete();
  });
})

// Se connecter à MONGO DB avant chaque test qui concerne la BD
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
  // Supprimer l'utilisateur de test.
  const delUser = await User.deleteOne({email: newUser.email});
  setTimeout(async ()=>{
    request(app)
    //Récupérer l'utilisateur inséré avec son NAME
		.get("/api/users/User1")
		.expect(200)
		.then(async (response) => {
			
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
    
  },4000)
})

// Vérifier la connexion de l'utilisateur
test("Vérifier la connexion de l'utilisateur", async () => {
  let r = (Math.random() + 1).toString(36).substring(7);
  let name = (Math.random() + 1).toString(35).substring(3);
  let email = r+"@gmail.com";
  //Créer un utilisateur de test et le stocker dans Mongo
  let hashedPassword = await bcrypt.hash("secret1234", 12);
  const user = {
    name,
    firstname: "toto",
    password: hashedPassword,
    email,
    role: "editor"
  }
  // Insérer l'utilisateur dans la BD
	const newUser = await User.create(user)
  const userConnect = {
    password: "secret1234",
    email: email
  }
  const result = request(app)
  .post(baseUrl+"/login")
  .send(userConnect)
  .expect(200);
  
  const existingUser = await User.findOne({email: userConnect.email});
  const rs = await bcrypt.compare(userConnect.password, existingUser.password);
  expect(rs).toEqual(true)
  // Supprimer l'utilisateur de test.
  const delUser = await User.deleteOne({email: email});
  
})
it("Renvoie une erreur si le mot de passe est faux", async () => {
  try {
    await new User({ name: "sam",firstname:"toto", email: "test-jest@gmail.com", password: 'qwer213', role:"editor"}).save()
    let result = await User.findOne({ email: "test-jest@gmail.com" })
    let wrongPassword = "123456"
    expect(wrongPassword).not.toEqual(result.password)
    const delUser = await User.deleteOne({email: "test-jest@gmail.com"});
  }
  catch (err) {
    throw new Error(err)
  }

})

// Vérifier la modification de l'utilisateur
it("Modifie l'utilisateur", async () => {
  let r = (Math.random() + 1).toString(36).substring(7);
  let name = (Math.random() + 1).toString(35).substring(3);
  let email = r+"@gmail.com";
  //Créer un utilisateur de test et le stocker dans Mongo
  let hashedPassword = await bcrypt.hash("secret1234", 12);
  const user = {
    name,
    firstname: "toto",
    password: hashedPassword,
    email,
    role: "editor"
  }
  // Insérer l'utilisateur dans la BD
	const newUser = await User.create(user)
  newUser.name="tahaUpdated";
  newUser.firstname="totUpdated";
  const userUpdate = {
    name: "tahaUpdated",
    firstname: "totUpdated"
  }
  const result = request(app)
  .patch(baseUrl+"/"+newUser._id)
  .send(userUpdate)
  .expect(201);
  const delUser = await User.deleteOne({email: email});

})
// Vérifier la suppréssion de l'utilisateur
it("Supprimer l'utilisateur", async () => {
  let r = (Math.random() + 1).toString(36).substring(7);
  let name = (Math.random() + 1).toString(35).substring(3);
  let email = r+"@gmail.com";
  //Créer un utilisateur de test et le stocker dans Mongo
  let hashedPassword = await bcrypt.hash("secret1234", 12);
  const user = {
    name,
    firstname: "toto",
    password: hashedPassword,
    email,
    role: "editor"
  }
  // Insérer l'utilisateur dans la BD
	const newUser = await User.create(user)
  
  
  const result = request(app)
  .delete(baseUrl+"/"+newUser._id)
  .expect(200);
  const delUser = await User.deleteOne({email: email});
})
// Fermer la connexion
afterEach((done) => {
	mongoose.connection.db.dropDatabase(() => {
		mongoose.connection.close(() => done())
	})
})