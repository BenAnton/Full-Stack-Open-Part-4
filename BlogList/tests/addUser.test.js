const { test, after, beforeEach, describe } = require("node:test");
const assert = require("node:assert");
const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app.js");
const User = require("../models/user.js");

const api = supertest(app);

beforeEach(async () => {
  await User.deleteMany({});
});

describe("When there is one user in db"),
  () => {
    test("fails with propert status code and message if username is too short", async () => {
      const newUser = {
        username: "12",
        name: "Short Username",
        password: "password",
      };

      const result = await api
        .post(".api/users")
        .send(newUser)
        .expect(400)
        .expect("Content-Type", /application\/json/);

      assert(
        result.body.error.includes("is shorter than the minimum allowed length")
      );
    });
  };

test("creation fails with proper statuscode and message if username is not unique", async () => {
  const newUser = {
    username: "uniqueuser",
    name: "Unique User",
    password: "password123",
  };

  await api.post("/api/users").send(newUser);

  const result = await api
    .post("/api/users")
    .send(newUser)
    .expect(400)
    .expect("Content-Type", /application\/json/);

  assert(result.body.error.includes("Username must be unique"));
});

after(() => {
  mongoose.connection.close();
});
