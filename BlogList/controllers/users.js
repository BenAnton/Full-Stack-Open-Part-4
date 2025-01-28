const bcrypt = require("bcrypt");
const usersRouter = require("express").Router();
const User = require("../models/user");
const Blog = require("../models/blog");

const users = [
  {
    username: "TestUser",
    name: "Test User",
    passwordHash: bcrypt.hashSync("TestPassword", 10),
  },
  {
    username: "AnotherUser",
    name: "Another User",
    passwordHash: bcrypt.hashSync("AnotherPassword", 10),
  },
];

module.exports = users;

usersRouter.post("/", async (request, response) => {
  console.log("POST request received to api/users");
  const { username, name, password } = request.body;

  if (password.length < 3) {
    return response
      .status(400)
      .json({ error: "Password must be at least 3 characters long" });
  }

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const user = new User({
    username,
    name,
    passwordHash,
  });

  try {
    const savedUser = await user.save();
    response.status(201).json(savedUser);
  } catch (error) {
    if (error.name === "MongoServerError" && error.code === 11000) {
      response.status(400).json({ error: "Username must be unique" });
    } else {
      response.status(400).json({ error: error.message });
    }
  }
});

usersRouter.get("/", async (request, response) => {
  const users = await User.find({}).populate("blogs", {
    title: 1,
    author: 1,
    url: 1,
  });

  response.json(users);
});

module.exports = usersRouter;
