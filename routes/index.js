var express = require('express');
var router = express.Router();
const { Book } = require('../models'); // Import Book model

/* GET home page. */
router.get('/', async function(req, res, next) {
  try {
    const books = await Book.findAll();
    console.log(books);
    res.json(books);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
