const express = require("express");
const Blog = require("../models/blog");

// Creating router instance for handling blog routes
const blogsRouter = express.Router();

// GET route for fetching all blog posts from DB
blogsRouter.get("/", async (request, response) => {
  const blogs = await Blog.find({});
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
blogsRouter.delete("/:id", async (request, response) => {
  await Blog.findByIdAndDelete(request.params.id);
  response.status(204).end();
});

module.exports = blogsRouter;
