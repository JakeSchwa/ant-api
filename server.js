require('dotenv').config()
const express = require('express');
const { ApolloServer } = require('apollo-server-express');

const { schema } = require("./schema/books");
const { resolvers } = require("./resolvers/books");
const { models, sequelize } = require("./models/books");
 
const server = new ApolloServer({
  typeDefs: schema,
  resolvers,
  context: {
    models
  },
});

const app = express();
server.applyMiddleware({ app });

const eraseDatabaseOnSync = true;

const { addBooks } = require("./seed")

sequelize.sync({ force: eraseDatabaseOnSync }).then(async () => {
  if (eraseDatabaseOnSync) {
    console.log("Adding books to database...");
    addBooks(models);
  }

  app.listen({ port: 4000 }, () =>
    console.log(`\n🚀 Server ready at http://localhost:4000${server.graphqlPath}\n`)
  );
});