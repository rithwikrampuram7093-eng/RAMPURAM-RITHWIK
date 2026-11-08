
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
    const {
      search_q = '',
      order_by = 'id',
      order = 'ASC',
      limit = '10',
      offset = '0',
      min_price,
      max_price
    } = req.query;

    const allowedColumns = ['id', 'title', 'author', 'price', 'pages'];

    if (!allowedColumns.includes(order_by)) {
      return res.status(400).json({
        message: 'Invalid order_by value'
      });
    }

    const sortOrder = String(order).toUpperCase();

    if (!['ASC', 'DESC'].includes(sortOrder)) {
      return res.status(400).json({
        message: 'Order must be ASC or DESC'
      });
    }

    const parsedLimit = Number(limit);
    const parsedOffset = Number(offset);

    if (!Number.isInteger(parsedLimit) ||
        parsedLimit < 1 ||
        parsedLimit > 100) {
      return res.status(400).json({
        message: 'Limit must be between 1 and 100'
      });
    }

    if (!Number.isSafeInteger(parsedOffset) ||
        parsedOffset < 0) {
      return res.status(400).json({
        message: 'Invalid offset'
      });
    }

    if (typeof search_q !== 'string') {
      return res.status(400).json({
        message: 'Invalid search_q'
      });
    }

    let query = 'SELECT * FROM book WHERE title LIKE ?';
    const values = [`%${search_q}%`];

    if (min_price !== undefined) {
      const min = Number(min_price);

      if (min_price === '' ||
          !Number.isFinite(min) ||
          min < 0) {
        return res.status(400).json({
          message: 'Invalid min_price'
        });
      }

      query += ' AND price >= ?';
      values.push(min);
    }

    if (max_price !== undefined) {
      const max = Number(max_price);

      if (max_price === '' ||
          !Number.isFinite(max) ||
          max < 0) {
        return res.status(400).json({
          message: 'Invalid max_price'
        });
      }

      query += ' AND price <= ?';
      values.push(max);
    }

    if (min_price !== undefined &&
        max_price !== undefined &&
        Number(min_price) > Number(max_price)) {
      return res.status(400).json({
        message: 'Minimum price cannot exceed maximum price'
      });
    }

    query += ` ORDER BY ${order_by} ${sortOrder} LIMIT ? OFFSET ?`;
    values.push(parsedLimit, parsedOffset);

    const books = await db.all(query, values);

    return res.status(200).json(books);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Internal server error'
    });
  }
});



app.post('/books/', async (req, res) => {
  try {
    const { title, author, price, pages } = req.body || {};

    // Validate title
    if (typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({
        message: 'Title is required'
      });
    }

    // Validate author
    if (typeof author !== 'string' || author.trim() === '') {
      return res.status(400).json({
        message: 'Author is required'
      });
    }

    // Validate price
    if (
      typeof price !== 'number' ||
      !Number.isFinite(price) ||
      price < 0
    ) {
      return res.status(400).json({
        message: 'Price must be a non-negative number'
      });
    }

    // Validate pages
    if (
      typeof pages !== 'number' ||
      !Number.isInteger(pages) ||
      pages <= 0
    ) {
      return res.status(400).json({
        message: 'Pages must be a positive integer'
      });
    }

    const query = `
      INSERT INTO book (title, author, price, pages)
      VALUES (?, ?, ?, ?)
    `;

    const result = await db.run(query, [
      title.trim(),
      author.trim(),
      price,
      pages
    ]);

    return res.status(201).json({
      message: 'Book added successfully',
      bookId: result.lastID
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: 'Internal server error'
    });
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
