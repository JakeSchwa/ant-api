const data = require("./goodreads-clean.json");

const addBooks = async (models) => {
	for (const item of data) {
		await models.Book.create({
			title: item.title,
			author: item.firstAuthor,
		});
	}
};

exports.addBooks = addBooks;
