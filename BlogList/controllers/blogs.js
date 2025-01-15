const express = require("express");
const Blog = require("../models/blog");

// Creating router instance for handling blog routes
const blogsRouter = express.Router();

// GET route for fetching all blog posts from DB
blogsRouter.get("/", async (request, response) => {
  const blogs = await Blog.find({});
  response.json(blogs);
});

// Route for creating a new blog
blogsRouter.post("/", async (request, response, next) => {
  const body = request.body;

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes || 0,
  });

  try {
    const savedBlog = await blog.save();
    response.status(201).json(savedBlog);
  } catch (error) {
    if (error.name === "Validation Error") {
      response.status(400).json({ error: error.message });
    } else {
      next(error);
    }
  }
});

// Route for deleting a blog
blogsRouter.delete("/:id", async (request, response) => {
  await Blog.findByIdAndDelete(request.params.id);
  response.status(204).end();
});

module.exports = blogsRouter;
