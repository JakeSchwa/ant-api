const resolvers = {
  Query: {
    books: async (parent, args, { models }) => {
      return await models.Book.findAll();
    },
  },
};

exports.resolvers = resolvers;