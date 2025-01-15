const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const config = require("./utils/config");
const logger = require("./utils/logger");
const blogsRouter = require("./controllers/blogs");
const middleware = require("./utils/middleware");

const app = express();

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(config.MONGODB_URI)
  .then(() => logger.info("Connected to MongoDB"))
  .catch((error) =>
    logger.error("Error connecting to MongoDB:", error.message)
  );

//   blogsRouter to handle requests to end point.
app.use("/api/blogs", blogsRouter);

// Sends 404 error for any unknown end points.
app.use(middleware.unknownEndpoint);

// Middleware for handling other errors.
app.use(middleware.errorHandler);

module.exports = app;
