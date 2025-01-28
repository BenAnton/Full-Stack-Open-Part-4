const express = require("express");
const Blog = require("../models/blog");
const User = require("../models/user");
const jwt = require("jsonwebtoken");

// Creating router instance for handling blog routes
const blogsRouter = express.Router();

// GET route for fetching all blog posts from DB
blogsRouter.get("/", async (request, response) => {
  const blogs = await Blog.find({}).populate("user", { username: 1, name: 1 });
  response.json(blogs);
});

// GET route for getting single ID
blogsRouter.get("/:id", async (request, response, next) => {
  try {
    const blog = await Blog.findById(request.params.id);
    if (blog) {
      response.json(blog);
    } else {
      response.status(404).end();
    }
  } catch (error) {
    next(error);
  }
});

// Route for creating a new blog
blogsRouter.post("/", async (request, response, next) => {
  const { title, author, url } = request.body;

  if (!title || !author || !url) {
    return response
      .status(400)
      .json({ error: "title. author and url are required" });
  }

  if (!request.user) {
    return response.status(401).json({ error: "user not authenticated" });
  }

  const blog = new Blog({
    title,
    author,
    url,
    user: request.user._id,
  });

  const savedBlog = await blog.save();
  request.user.blogs = request.user.blogs.concat(savedBlog._id);
  await request.user.save();

  response.status(201).json(savedBlog);
});

// Route for updating likes
blogsRouter.put("/:id", async (request, response, next) => {
  const body = request.body;

  console.log("Received data for update:", body);

  const blog = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
  };

  try {
    const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, {
      new: true,
    });
    if (updatedBlog) {
      console.log("Updated blog:", updatedBlog);
      response.json(updatedBlog);
    } else {
      response.status(404).end();
    }
  } catch (error) {
    console.error("Error updating blog:", error);
    next(error);
  }
});

// Route for deleting a blog
blogsRouter.delete("/:id", async (request, response, next) => {
  if (!request.user) {
    return response.status(401).json({ error: "User not authenicated" });
  }

  const blog = await Blog.findById(request.params.id).populate("user");
  if (!blog) {
    return response.status(404).json({ error: "not found" });
  }
  console.log("Authenticated User:", request.user.id);
  console.log("Blog Owner:", blog.user);

  if (!blog.user || blog.user.id.toString() !== request.user._id.toString()) {
    return response.status(403).json({ error: "Not authorized" });
  }

  try {
    await Blog.findByIdAndDelete(request.params.id);
    response.status(204).end();
  } catch (error) {
    next(error);
  }
});

module.exports = blogsRouter;
