
const express = require('express');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const dbPath = path.join(__dirname, 'books.db');

let db = null;

async function initializeDBAndServer() {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
      console.log('SQLite database connected successfully!');
    });
  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  }
}

app.get('/books/', async (req, res) => {
  try {
    const books = await db.all('SELECT * FROM book;');
    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch books' });
  }
});


app.post('/books/', async (req, res) => {
  try {
    const { title, author, price, pages } = req.body;

    if (
      typeof title !== 'string' || !title.trim() ||
      typeof author !== 'string' || !author.trim() ||
      !Number.isInteger(price) || price < 0 ||
      !Number.isInteger(pages) || pages <= 0
    ) {
      return res.status(400).json({
        error: 'Valid title, author, price and pages are required'
      });
    }

    const result = await db.run(
      'INSERT INTO book (title, author, price, pages) VALUES (?, ?, ?, ?);',
      [title.trim(), author.trim(), price, pages]
    );

    res.status(201).json({
      message: 'Book added successfully',
      bookId: result.lastID
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add book' });
  }
});


app.get('/books/:bookId/', async (req, res) => {
  try {
    const { bookId } = req.params;

    const book = await db.get(
      'SELECT * FROM book WHERE id = ?;',
      [bookId]
    );

    if (!book) {
      return res.status(404).json({
        error: 'Book not found'
      });
    }

    res.status(200).json(book);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch book'
    });
  }
});


app.put('/books/:bookId/', async (req, res) => {
  try {
    const { bookId } = req.params;
    const { title, author, price, pages } = req.body;

    if (
      !/^[1-9]\d*$/.test(bookId) ||
      typeof title !== 'string' || !title.trim() ||
      typeof author !== 'string' || !author.trim() ||
      !Number.isInteger(price) || price < 0 ||
      !Number.isInteger(pages) || pages <= 0
    ) {
      return res.status(400).json({
        error: 'Valid book ID, title, author, price and pages are required'
      });
    }

    const result = await db.run(
      'UPDATE book SET title = ?, author = ?, price = ?, pages = ? WHERE id = ?;',
      [title.trim(), author.trim(), price, pages, Number(bookId)]
    );

    if (result.changes === 0) {
      return res.status(404).json({
        error: 'Book not found'
      });
    }

    res.status(200).json({
      message: 'Book updated successfully',
      bookId: Number(bookId)
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to update book'
    });
  }
});


app.delete('/books/:bookId/', async (req, res) => {
  try {
    const { bookId } = req.params;

    if (!/^[1-9]\d*$/.test(bookId)) {
      return res.status(400).json({
        error: 'Invalid book ID'
      });
    }

    const result = await db.run(
      'DELETE FROM book WHERE id = ?;',
      [Number(bookId)]
    );

    if (result.changes === 0) {
      return res.status(404).json({
        error: 'Book not found'
      });
    }

    res.status(200).json({
      message: 'Book deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to delete book'
    });
  }
});

initializeDBAndServer();
