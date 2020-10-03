const addBooks = async (models) => {
  await models.Book.create(
    {
      title: "Deep Work",
      author: "Cal Newport"
    }
  );
  await models.Book.create(
    {
      title: "Digital Minimalism",
      author: "Cal Newport"
    }
  );
  await models.Book.create(
    {
      title: "Why We Sleep",
      author: "Matthew Walker"
    }
  );
  await models.Book.create(
    {
      title: "Alice's Adventures in Wonderland",
      author: "Lewis Carroll"
    }
  );
};

exports.addBooks = addBooks;