const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

// Home route
app.get('/', (req, res) => {
  res.status(200).send('Welcome to my Node.js and Express Server!');
});

// About route
app.get('/about', (req, res) => {
  res.status(200).json({
    name: 'Rampuram Rithwik',
    section: 'CSE-2D 214'
  });
});

// Time route
app.get('/time', (req, res) => {
  res.status(200).json({
    currentDateTime: new Date().toISOString()
  });
});

// Handle unknown routes
app.use((req, res) => {
  res.status(404).send('404 - Page Not Found');
});

// Start server
app.listen(PORT, () => {
  console.log(`Express server running at http://localhost:${PORT}`);
});
