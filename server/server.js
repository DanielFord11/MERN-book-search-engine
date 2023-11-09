const express = require("express");
const path = require("path");
const cors = require("cors"); // Add this line for the cors middleware
const db = require("./config/connection");
const { ApolloServer } = require("apollo-server-express");
const { typeDefs, resolvers } = require("./schemas");
const { authMiddleware } = require("./utils/auth");
const errorHandler = require("./utils/errorHandler");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Log incoming requests
app.use((req, res, next) => {
  console.log(`Incoming ${req.method} request to ${req.url}`);
  next();
});

// CORS configuration
app.use(cors()); // Add this line for the cors middleware

// Error handling middleware
app.use(errorHandler);

// Serve client/build as static assets in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/build")));
}

// Start Apollo server and apply middleware
const startServer = async () => {
  console.log("this ran");
  try {
    const server = new ApolloServer({
      typeDefs,
      resolvers,
      context: authMiddleware,
    });

    await server.start();

    server.applyMiddleware({ app });

    // Note that the Apollo Server might be running on a different port
    app.listen(PORT, () => {
      console.log(`🌍 Now listening on http://localhost:${PORT}`);
      console.log(`Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`);
    });

    db.once("open", () => {
      console.log("MongoDB database connection established successfully");
    });
  } catch (error) {
    console.error("Error starting the Apollo Server:", error);
  }
};

console.log("line 60 ran");
startServer();
