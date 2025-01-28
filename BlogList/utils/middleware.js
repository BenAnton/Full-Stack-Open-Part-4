const jwt = require("jsonwebtoken");
const User = require("../models/user");

// 404 error if endpoint is not found.
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

// Error handling.
const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === "ValidationError") {
    return response.status(400).send({ error: error.message });
  } else if (error.name === "JsonWebTokenError") {
    return response.status(404).json({ error: "token invalid" });
  }

  //   pass error to next middleware if there is any
  next(error);
};

const getTokenFrom = (request, response, next) => {
  const authorization = request.get("authorization");
  if (authorization && authorization.startsWith("Bearer ")) {
    request.token = authorization.replace("Bearer ", "");
  } else {
    request.token = null;
  }
  next();
};

const userExtractor = async (request, response, next) => {
  if (request.token) {
    try {
      const decodedToken = jwt.verify(request.token, process.env.SECRET);
      if (decodedToken.id) {
        request.user = await User.findById(decodedToken.id);
      }
    } catch (error) {
      return response.status(401).json({ error: "token invalid" });
    }
  }
  next();
};

module.exports = {
  unknownEndpoint,
  errorHandler,
  getTokenFrom,
  userExtractor,
};
