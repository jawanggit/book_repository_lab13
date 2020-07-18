DROP TABLE IF EXISTS books;

CREATE TABLE books (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255),
  author VARCHAR(255),
  description VARCHAR(3000),
  image VARCHAR(255),
  isbn VARCHAR(255),
  bookshelf VARCHAR(255)
);
