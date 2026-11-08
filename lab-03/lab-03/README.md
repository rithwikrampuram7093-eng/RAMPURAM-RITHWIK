
# Backend Development Fundamentals - Lab 03

## Student Information

- Name: Rampuram Rithwik
- Registration Number: 252U1R1213
- Section: CSE-2D 214
- College: Aurora Higher Education and Research Academy

## Experiment

REST API, Query Parameters, Validation and Debugging

## Objective

To enhance the Lab 2 Books Management REST API
by adding search, sorting, pagination, price
filtering, request validation, correct HTTP
status codes, and debugging.

## Technologies Used

- Node.js
- Express.js
- SQLite
- JavaScript
- Postman
- Visual Studio Code
- GitHub
- Render

## Database

Database Name: books.db

Table Name: book

Columns:
- id
- title
- author
- price
- pages

The database contains 10 original book records.

## Installation

Run the following command:

npm install

## Start Server

node app.js

Local Server:
http://localhost:3000

## API Endpoints

GET /books/
GET /books/:bookId/
POST /books/
PUT /books/:bookId/
DELETE /books/:bookId/

## Lab 3 Query Parameters

- search_q: Search books by title
- order_by: Sort using id, title, author, price or pages
- order: ASC or DESC
- limit: Maximum number of books returned
- offset: Number of records to skip
- min_price: Minimum price filter
- max_price: Maximum price filter

## Example Requests

GET /books/?search_q=Atomic

GET /books/?order_by=price&order=DESC

GET /books/?limit=3&offset=0

GET /books/?min_price=300&max_price=500

## Validation

The POST endpoint rejects:
- Missing or empty title
- Missing or empty author
- Non-numeric or negative price
- Invalid pages

## HTTP Status Codes

- 200 OK: Successful GET, PUT and DELETE
- 201 Created: Successful POST
- 400 Bad Request: Invalid input
- 404 Not Found: Book does not exist
- 500 Internal Server Error: Unexpected server error

## Debugging

Common backend errors studied:
- EADDRINUSE: Port already in use
- Wrong module import path
- SQLite table-name errors
- Missing await in asynchronous code

## Testing

All five CRUD routes were tested using Postman.

Query parameter testing included:
- Search
- Sorting
- Pagination
- Price filtering

Validation testing included:
- Missing title
- Missing author
- Invalid price
- Invalid sorting column
- Invalid price range
- Invalid pagination limit
- Nonexistent book ID

Successful and failure responses were verified.

## Screenshots

Postman screenshots are available in
the screenshots folder.

## GitHub Repository

https://github.com/rithwikrampuram7093-eng/RAMPURAM-RITHWIK/tree/main/lab-03

## Render Deployment

To be added after successful deployment.

## Result

The Books Management REST API was enhanced
with search, sorting, pagination, price filtering,
request validation, and appropriate HTTP status
codes. The implemented functionality was tested
successfully using Postman.
