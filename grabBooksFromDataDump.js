const fs = require("fs");
const readline = require("readline");
const axios = require("axios");

let isbnArray = [];
let jsonArray = [];

async function processLineByLine(totalBooks = 100) {
	const fileStream = fs.createReadStream(
		"/Users/jcgentr/Downloads/ol_dump_editions_2020-09-30.txt"
	);

	const rl = readline.createInterface({
		input: fileStream,
		crlfDelay: Infinity,
		tabSize: 4,
	});
	// Note: we use the crlfDelay option to recognize all instances of CR LF
	// ('\r\n') in input.txt as a single line break.
	let count = 0;
	const totalBooksWithISBN13 = 10626614;
	// total books: 28787383

	for await (const line of rl) {
		// Each line in input.txt will be successively available here as `line`.
		if (count < totalBooks) {
			var lineSplit = line.split("\t");
			var json = JSON.parse(lineSplit[4]);
			var isbn = json.isbn_13
				? json.isbn_13[0]
				: json.isbn_10
				? json.isbn_10[0]
				: null;
			var hasGoodReadsId = json.identifiers && json.identifiers.goodreads;
			if (hasGoodReadsId) {
				jsonArray.push(json);
				isbnArray.push(isbn);
			}
		} else break;
		count++;
		if (count % 1000000) {
			process.stdout.clearLine();
			process.stdout.cursorTo(0);
			process.stdout.write(
				`${count} / ${totalBooksWithISBN13} (${Math.floor(
					(count / totalBooksWithISBN13) * 100
				)}%)`
			);
		}
	}
	process.stdout.write("\n");
}

processLineByLine(50000).then(() => {
	getGRRatings(isbnArray, jsonArray);
});

const getGRRatings = async (isbnArray, jsonArray) => {
	let arrayOfAverageReviews = [];
	// TODO: loop through isbnArray using batches of 100 isbns
	for (const isbn of isbnArray) {
		try {
			const apiEndpoint = `https://www.goodreads.com/book/review_counts.json?isbns=${isbn}&key=0pOlnLRHZh3juhOQiYrg`;
			const res = await axios.get(apiEndpoint);
			// console.log(res.data.books);
			const keys_to_keep = [
				"id",
				"isbn",
				"isbn13",
				"average_rating",
				"work_ratings_count",
				"work_text_reviews_count",
			];
			const redux = (array) =>
				array.map((o) =>
					keys_to_keep.reduce((acc, curr) => {
						acc[curr] = o[curr];
						return acc;
					}, {})
				);
			arrayOfAverageReviews = arrayOfAverageReviews.concat(
				redux(res.data.books)
			);
		} catch (error) {
			continue;
		}
	}

	const newArray = jsonArray.flatMap((item) => {
		const found = arrayOfAverageReviews.find(
			(el) => el.id == item.identifiers.goodreads[0]
		);
		if (found) {
			return [
				{
					title: item.title,
					subtitle: item.subtitle ? item.subtitle : null,
					authors: item.authors ? item.authors : null,
					good_reads_id: found.id,
					average_rating: found.average_rating,
					isbn: found.isbn,
					isbn13: found.isbn13,
					work_ratings_count: found.work_ratings_count,
					work_text_reviews_count: found.work_text_reviews_count,
					number_of_pages: item.number_of_pages,
					publish_date: item.publish_date,
				},
			];
		} else return [];
	});
	console.log("ISBN Array from txt file:", isbnArray.length);
	console.log("JSON Array from txt file:", jsonArray.length);
	console.log("After GoodReads:", arrayOfAverageReviews.length);
	console.log("After merging gr and json:", newArray.length);

	// merge in author
	// callGoogleBooksAPI(newArray);
	callOL(newArray);
};

// https://openlibrary.org/authors/{author}.json
// https://openlibrary.org/authors/OL34184A.json

const callOL = async (arr) => {
	const finalArrayPromises = arr.flatMap(async (item) => {
		try {
			const authorsArray = item.authors;
			if (!authorsArray || !authorsArray[0]) {
				return [];
			}
			const olAPIEndpoint = `https://openlibrary.org${authorsArray[0].key}.json`;
			const res = await axios.get(olAPIEndpoint);
			let objToReturn = { ...item, firstAuthor: res.data.name };
			delete objToReturn.authors;
			return [objToReturn];
		} catch (error) {
			return [];
		}
	});
	const finalArray = await Promise.all(finalArrayPromises);
	console.log("After OL:", finalArray.length);

	fs.writeFileSync(
		"./goodreads.json",
		JSON.stringify(finalArray),
		"utf8",
		function (err) {
			if (err) return console.log(err);
			console.log("The file was saved!");
		}
	);
};
