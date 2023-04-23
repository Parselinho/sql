var express = require('express');
var router = express.Router();
const { Book } = require('../models'); // Import Book model
const { Op } = require("sequelize");
const { Sequelize } = require('sequelize');


/* Redirect home page to /books */
router.get('/', function(req, res, next) {
  res.redirect('/books');
});

/* GET /books */
router.get('/books', async function(req, res, next) {
  try {
    const books = await Book.findAll();
    // console.log(books);
    // res.json(books);
      res.render('index', { title: 'Books', books: books });
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
    if (error instanceof Sequelize.ValidationError) {
      res.render('new-book', { errors: error.errors, book: req.body });
    } else {
      next(error);
    }
  }
});





router.get('/books/:id', async function(req, res, next) {
  try {
    const book = await Book.findByPk(req.params.id);
    if (book) {
      res.render('book-detail', { book: book });
    } else {
      const notFoundError = new Error('Book Not Found');
      notFoundError.status = 404;
      next(notFoundError);
    }
  } catch (error) {
    next(error);
  }
});

/* POST /books/:id - Updates book info in the database */
router.post('/books/:id', async function(req, res, next) {
  try {
    const book = await Book.findByPk(req.params.id);
    if (book) {
      await book.update(req.body);
      res.redirect('/books');
    } else {
      const notFoundError = new Error('Book Not Found');
      notFoundError.status = 404;
      throw notFoundError;
    }
  } catch (error) {
    if (error instanceof Sequelize.ValidationError) {
      const book = Book.build(req.body);
      book.id = req.params.id; // Ensure correct book.id is being passed
      res.render('book-detail', { book: book, errors: error.errors });
    } else {
      next(error);
    }
  }
});

// GET /books/:id/edit - Show the edit book form
router.get('/books/:id/edit', async function(req, res, next) {
  try {
    const book = await Book.findByPk(req.params.id);
    if (book) {
      res.render('update-book', { book: book }); // Render the 'edit-book' template with the book object
    } else {
      const notFoundError = new Error('Book Not Found');
      notFoundError.status = 404;
      next(notFoundError);
    }
  } catch (error) {
    next(error);
  }
});


/* POST /books/:id/delete - Deletes a book */
router.post('/books/:id/delete', async function(req, res, next) {
  try {
    const book = await Book.findByPk(req.params.id);
    if (book) {
      await book.destroy();
      res.redirect('/books');
    } else {
      const notFoundError = new Error('Book Not Found');
      notFoundError.status = 404;
      throw notFoundError;
    }
  } catch (error) {
    next(error);
  }
});





module.exports = router;
