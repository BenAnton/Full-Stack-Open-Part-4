const http = require("http");
const app = require("./app");
const config = require("./utils/config");
const logger = require("./utils/logger");

// Create HTTP server using Express
const server = http.createServer(app);

// Starts server and listens on port from config.js
server.listen(config.PORT, () => {
  logger.info(`Server running on port ${config.PORT}`);
});
