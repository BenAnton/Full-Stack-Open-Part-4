require("dotenv").config();
const { test, beforeEach, after } = require("node:test");
const assert = require("node:assert");
const supertest = require("supertest");
const mongoose = require("mongoose");
const app = require("../app");
const bcrypt = require("bcrypt");

const api = supertest(app);

const Blog = require("../models/blog");
const User = require("../models/user");

const initialBlogs = [
  {
    _id: "5a422a851b54a676234d17f7",
    title: "React patterns",
    author: "Michael Chan",
    url: "https://reactpatterns.com/",
    likes: 7,
    __v: 0,
  },
  {
    _id: "5a422aa71b54a676234d17f8",
    title: "Go To Statement Considered Harmful",
    author: "Edsger W. Dijkstra",
    url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
    likes: 5,
    __v: 0,
  },
];

beforeEach(async () => {
  try {
    await Blog.deleteMany({});
    await User.deleteMany({});

    const passwordHash = await bcrypt.hash("TestPassword", 10);
    const user = new User({
      username: "TestUser",
      name: "TestPassword",
      passwordHash,
    });

    const savedUser = await user.save();

    const blogsWithUser = initialBlogs.map((blog) => ({
      ...blog,
      user: savedUser._id,
    }));

    for (let blog of blogsWithUser) {
      let blogObject = new Blog(blog);
      await blogObject.save();
    }

    const blogIds = (await Blog.find({})).map((blog) => blog._id);
    await User.findByIdAndUpdate(
      savedUser._id,
      { blogs: blogIds },
      { new: true }
    );

    console.log("Database initialized with initial blogs and user");
  } catch (error) {
    console.error("Error in beforeEach:", error);
    throw error;
  }
});

test("blogs are returned as json", async () => {
  try {
    await api
      .get("/api/blogs")
      .expect(200)
      .expect("Content-Type", /application\/json/);
  } catch (error) {
    console.error("Error in test 'blogs are returned as json:", error);
    throw error;
  }
});

test("all blogs are returned", async () => {
  try {
    const response = await api.get("/api/blogs");
    assert.strictEqual(response.body.length, initialBlogs.length);
  } catch (error) {
    console.error("Error in test, all blogs are returned", error);

    throw error;
  }
});

test("check id and not _id", async () => {
  const blog = new Blog({
    title: "Test Title",
    author: "Test Author",
    url: "testURL.com",
    likes: 99,
  });

  const savedBlog = await blog.save();
  const blogJSON = savedBlog.toJSON();

  assert.ok(blogJSON.id, "id field is not defined");
  assert.strictEqual(
    blogJSON._id,
    undefined,
    "The _id field should be undefined"
  );
});

test("create new post and check that the amount of blogs is incremented", async () => {
  const loginResponse = await api
    .post("/api/login")
    .send({ username: "TestUser", password: "TestPassword" });

  const token = loginResponse.body.token;

  const initialBlogs = await api.get("/api/blogs");
  const initialBlogCount = initialBlogs.body.length;

  const newBlog = {
    title: "Test Title",
    author: "Test Author",
    url: "testURL.com",
    likes: 99,
  };

  await api
    .post("/api/blogs")
    .set("Authorization", `Bearer ${token}`)
    .send(newBlog)
    .expect(201);

  const updatedBlogs = await api.get("/api/blogs");
  const updatedBlogCount = updatedBlogs.body.length;

  assert.strictEqual(initialBlogCount + 1, updatedBlogCount);

  const titles = updatedBlogs.body.map((blog) => blog.title);
  assert(titles.includes(newBlog.title));
});

test("creating a blog without a token fails", async () => {
  const newBlog = {
    title: "Test Title",
    author: "Test Author",
    url: "testURL.com",
  };

  await api
    .post("/api/blogs")
    .send(newBlog)
    .expect(401)
    .expect("Content-Type", /application\/json/);
});

test("testing for likes inclusion and defaulting to zero", async () => {
  const loginResponse = await api.post("/api/login").send({
    username: "TestUser",
    password: "TestPassword",
  });

  const token = loginResponse.body.token;

  const newBlog = {
    title: "Test Title",
    author: "Test Author",
    url: "testURL.com",
  };

  if (!newBlog.hasOwnProperty("likes")) {
    newBlog.likes = 0;
  }

  await api
    .post("/api/blogs")
    .set("Authorization", `Bearer ${token}`)
    .send(newBlog)
    .expect(201);

  const response = await api.get("/api/blogs");
  const createdBlog = response.body.find(
    (blog) => blog.title === newBlog.title
  );

  assert.strictEqual(createdBlog.likes, 0);
});

test("checking for missing title properties", async () => {
  const loginResponse = await api.post("/api/login").send({
    username: "TestUser",
    password: "TestPassword",
  });

  const token = loginResponse.body.token;

  const newBlog = {
    author: "Test Author",
    url: "testURL.com",
  };

  await api
    .post("/api/blogs")
    .set("Authorization", `Bearer ${token}`)
    .send(newBlog)
    .expect(400);

  const response = await api.get("/api/blogs");
  assert.strictEqual(response.body.length, initialBlogs.length);
});

test("checking for missing author properties", async () => {
  const loginResponse = await api
    .post("/api/login")
    .send({ username: "TestUser", password: "TestPassword" });

  const token = loginResponse.body.token;

  const newBlog = {
    title: "Test Title",
    url: "testURL.com",
  };

  await api
    .post("/api/blogs")
    .set("Authorization", `Bearer ${token}`)
    .send(newBlog)
    .expect(400);

  const response = await api.get("/api/blogs");
  assert.strictEqual(response.body.length, initialBlogs.length);
});

test("checking for missing url property", async () => {
  const loginResponse = await api.post("/api/login").send({
    username: "TestUser",
    password: "TestPassword",
  });

  const token = loginResponse.body.token;

  const newBlog = {
    title: "Test Title",
    author: "Test Author",
  };

  await await api
    .post("/api/blogs")
    .set("Authorization", `Bearer ${token}`)
    .send(newBlog)
    .expect(400);

  const response = await api.get("/api/blogs");
  assert.strictEqual(response.body.length, initialBlogs.length);
});

test("Testing the deletion of a Blog", async () => {
  const loginResponse = await api.post("/api/login").send({
    username: "TestUser",
    password: "TestPassword",
  });

  const token = loginResponse.body.token;

  const blogsAtStart = await api.get("/api/blogs");
  const blogsCountStart = blogsAtStart.body.length;

  const blogToDelete = blogsAtStart.body[0];

  await api
    .delete(`/api/blogs/${blogToDelete.id}`)
    .set("Authorization", `Bearer ${token}`)
    .expect(204);

  const blogsAtEnd = await api.get("/api/blogs");
  const blogsCountEnd = blogsAtEnd.body.length;

  assert.strictEqual(blogsCountEnd, blogsCountStart - 1);

  const contents = blogsAtEnd.body.map((r) => r.title);
  assert(!contents.includes(blogToDelete.title));
});

test("Testing the updating of likes", async () => {
  const blogsAtStart = await api.get("/api/blogs");
  const originalBlog = blogsAtStart.body[0];

  const originalBlogLikes = originalBlog.likes;
  const originalBlogID = originalBlog.id;

  const updatedLikes = originalBlogLikes + 1;
  const updatedBlog = { ...originalBlog, likes: updatedLikes };

  const putResponse = await api
    .put(`/api/blogs/${originalBlogID}`)
    .send(updatedBlog)
    .expect(200);
  console.log("PUT response:", putResponse.body);

  const getResponse = await api.get(`/api/blogs/${originalBlogID}`);
  console.log("GET response:", getResponse.body);
  const updatedBlogLikes = getResponse.body.likes;

  console.log("LIKES LIKES LIKES:", updatedBlogLikes);
  assert.strictEqual(updatedBlogLikes, updatedLikes);
});

after(async () => {
  try {
    await mongoose.connection.close();
  } catch (error) {
    console.error("Error in after hook:", error);
  }
});
