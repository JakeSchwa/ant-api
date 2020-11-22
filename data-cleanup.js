const data = require("./goodreads.json");
const fs = require("fs");

console.log(data.length);
const cleanArray = data
	// .filter((item) => item.length > 0)
	.filter((item) => item.firstAuthor != null)
	.filter((item) => item.title != null);
// .map((item) => item[0]);

fs.writeFileSync(
	"./goodreads-clean.json",
	JSON.stringify(cleanArray),
	"utf8",
	function (err) {
		if (err) return console.log(err);
		console.log("The file was saved!");
	}
);
