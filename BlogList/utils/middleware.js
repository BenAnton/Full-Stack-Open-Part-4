// 404 error if endpoint is not found.
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

// Error handling.
const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === "ValidationError") {
    return response.status(400).send({ error: error.message });
  }

  //   pass error to next middleware if there is any
  next(error);
};

module.exports = {
  unknownEndpoint,
  errorHandler,
};
