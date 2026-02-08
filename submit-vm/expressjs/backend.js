// CO3404 Submit Microservice Express Server
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3002;

app.use(express.json());
app.use(express.static(path.join(__dirname)));

let jokeTypes = function() { fetch('http://localhost:3001/types').then(res => res.json()) }(); // Fetch types from jokes app on startup

// GET /types - return all joke types
app.get('/types', (req, res) => 
{
  res.json(jokeTypes);
});

// POST /submit - receive new joke
app.post('/submit', (req, res) => 
{
  const { setup, punchline, type, newType } = req.body;
  
  if (!setup || !punchline || (!type && !newType)) {
    return res.status(400).json({ error: 'All fields required' });
  }
  
  // Add new type if provided
  let usedType = type;
  
  if (newType && !jokeTypes.includes(newType)) {
    jokeTypes.push(newType);
    usedType = newType;
  }
  
  // Here you would insert into DB
  res.json({ message: 'Joke submitted', joke: { setup, punchline, type: usedType } });
});

app.listen(PORT, () => {
  console.log(`Submit app running on http://localhost:${PORT}`);
});
