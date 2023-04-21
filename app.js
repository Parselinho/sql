var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

const { sequelize } = require('./models'); // Import sequelize instance

// Test database connection and sync models
sequelize.authenticate()
  .then(() => {
    console.log('Database connection established successfully.');
    return sequelize.sync();
  })
  .catch((error) => {
    console.error('Unable to connect to the database:', error);
  });

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  // create a new error object
  const notFoundError = new Error('Page Not Found');
  // set the status to 404
  notFoundError.status = 404;
  //set the msg
  notFoundError.message = 'Sorry, the page not found'
  //render the page-not found
  res.status(notFoundError.status)
  res.render('page-not-found', { error: notFoundError });
});

// error handler
app.use(function(err, req, res, next) {
  // Set the err.status property to 500 if status isn't already defined
  if (!err.status) {
    err.status = 500;
  }

  // Set the err.message property to a user-friendly message if message isn't already defined
  if (!err.message) {
    err.message = "An unexpected error";
  }

  // Log the err object's status and message properties to the console
  console.error(`Error Status: ${err.status}, Error Message: ${err.message}`);

  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // Render the error template, passing the updated err object as the second parameter in the render method
  res.status(err.status);
  res.render('error', { err: err });

});

module.exports = app;
