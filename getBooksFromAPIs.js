const https = require('https')
const url = "https://www.googleapis.com/books/v1/volumes?q=a&startIndex=1&maxResults=40"

const req = https.request(url, res => {
  console.log(`statusCode: ${res.statusCode}`)

  let body = '';

  res.on('data', chunk => {
    body += chunk
  })

  res.on('end', function(){
    let fbResponse = JSON.parse(body)
    // console.log("Got a response: ", fbResponse.items)
    showBooks(fbResponse.items)
  })
})

req.on('error', error => {
  console.error(error)
})

req.end()

function showBooks(items) {
  const books = items.filter(item => {
    const ids = item.volumeInfo.industryIdentifiers
    let hasISBN13 = false
    ids.forEach(element => {
      if(element.type === "ISBN_13") hasISBN13 = true
    })
    if(hasISBN13) return true
  })
  const filtered = books.filter(book => book.volumeInfo.authors !== undefined)
  // console.log(filtered.map(item => item.volumeInfo.authors))
  const booksLite = filtered.map(book => {
    let isbn13 = ""
    book.volumeInfo.industryIdentifiers.map(id => {
      if(id.type === "ISBN_13") isbn13 = id.identifier
    })
    const bookObj = {
      title: book.volumeInfo.title,
      author: book.volumeInfo.authors[0], // first author 
      publishedDate: book.volumeInfo.publishedDate,
      isbn13: isbn13,
      pageCount: book.volumeInfo.pageCount,
      printType: book.volumeInfo.printType
    }
    return bookObj
  })

  console.log(booksLite.length)
}