var express = require('express');
var router = express.Router();
const { Book } = require('../models'); // Import Book model

/* Redirect home page to /books */
router.get('/', function(req, res, next) {
  res.redirect('/books');
});

/* GET /books */
router.get('/books', async function(req, res, next) {
  try {
    const books = await Book.findAll();
    // console.log(books);
    res.json(books);
  } catch (error) {
    next(error);
  }
});

/* GET /books/new - Show the create new book form */
router.get('/books/new', function(req, res, next) {
  res.render('new-book');
});

/* POST /books/new - Post a new book to the database */
router.post('/books/new', async function(req, res, next) {
  try {
    const newBook = await Book.create(req.body);
    res.redirect('/books');
  } catch (error) {
    next(error);
  }
});


module.exports = router;
