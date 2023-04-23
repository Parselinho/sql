var express = require('express');
var router = express.Router();
const { Book } = require('../models'); // Import Book model
const { Op } = require("sequelize");
const { Sequelize } = require('sequelize');
const BOOKS_PER_PAGE = 10;


/* Redirect home page to /books */
router.get('/', function(req, res, next) {
  res.redirect('/books');
});

/* GET /books */
// Route handler for the '/books' GET request
router.get('/books', async function (req, res, next) {
  try {
    // Get the search term from the query string, or use an empty string if not provided
    const search = req.query.search || '';
    // Get the requested page number, or default to the first page if not provided
    const page = parseInt(req.query.page) || 1;
    // Calculate the offset for pagination based on the current page and the number of books per page
    const offset = (page - 1) * BOOKS_PER_PAGE;
    
    // Fetch the books and their count from the database, applying search filters and pagination
    const books = await Book.findAndCountAll({
      where: {
        [Op.or]: [
          { title: { [Op.like]: `%${search}%` } },
          { author: { [Op.like]: `%${search}%` } },
          { genre: { [Op.like]: `%${search}%` } },
          { year: { [Op.like]: `%${search}%` } },
        ],
      },
      limit: BOOKS_PER_PAGE,
      offset: offset,
    });

    // Calculate the total number of pages needed for the search results
    const totalPages = Math.ceil(books.count / BOOKS_PER_PAGE);

    // Render the 'index' template with the fetched books, search term, current page, and total pages
    res.render('index', {
      title: 'Books',
      books: books.rows,
      search: search,
      page: page,
      totalPages: totalPages,
    });
  } catch (error) {
    // Pass any errors to the next middleware for error handling
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
    const newBook = await Book.create(req.body); // Create a new book in the database with the data from the request body
    res.redirect('/books'); // Redirect the user to the '/books' page
  } catch (error) {
    if (error instanceof Sequelize.ValidationError) {
      res.render('new-book', { errors: error.errors, book: req.body }); // Render the 'new-book' template with any validation errors that occurred
    } else {
      next(error); // Pass any other errors to the error handler middleware
    }
  }
});




/* GET /books/:id - Show the book details */
router.get('/books/:id', async function(req, res, next) {
  try {
    const book = await Book.findByPk(req.params.id);
    if (book) {
      res.render('book-detail', { book: book }); // Render the 'book-detail' template with the retrieved book
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
    const book = await Book.findByPk(req.params.id); // Retrieve the book from the database by its primary key
    if (book) {
      await book.update(req.body); // Update the book with the new information
      res.redirect('/books'); // Redirect the user to the '/books' page
    } else {
      const notFoundError = new Error('Book Not Found');
      notFoundError.status = 404;
      throw notFoundError; // Throw a 404 error if the book isn't found
    }
  } catch (error) {
    if (error instanceof Sequelize.ValidationError) {
      const book = Book.build(req.body); // Create a new book object with the updated information
      book.id = req.params.id; // Ensure correct book.id is being passed
      res.render('book-detail', { book: book, errors: error.errors }); // Render the 'book-detail' template with any validation errors that occurred
    } else {
      next(error); // Pass any other errors to the error handler middleware
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
    const book = await Book.findByPk(req.params.id); // Retrieve the book from the database by its primary key
    if (book) {
      await book.destroy(); // Delete the book from the database
      res.redirect('/books'); // Redirect the user to the '/books' page
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
