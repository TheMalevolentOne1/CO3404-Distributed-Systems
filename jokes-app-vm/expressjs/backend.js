const database = require('./database.js');
require('dotenv').config(); // Load environment variables from .env file

const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT;;

app.use(express.json()) // For parsing application/json
app.use(cors()); // Enable CORS for all routes (HTTP Header: Access-Control-Allow-Origin: *) cross port communication.
app.use(express.static('public')); // Serve static files from 'public' directory

app.listen(PORT, () => 
{
  console.log(`Server is running on http://localhost:${PORT}`);
});

// To Cache if database goes down.
const jokes = new Set(); // Global Array of Jokes (Set prevents duplicates

const getAllJokes = () =>
{
    database.queryDatabase("SELECT jokes.id, jokes.setup, jokes.punchline, jokes.type_id, types.type_name FROM jokes JOIN types ON jokes.type_id = types.id")
    .then(result => {
        const rows = result[0];
        rows.forEach(joke => jokes.add(joke));
        console.log(`Loaded ${jokes.size} jokes from the database.`);
    }).catch(err => {
        console.error(`Error loading jokes from the database: ${err}`);
    });
}

getAllJokes(); // Load jokes from database on startup

const getJokes = (type, count) => {
    let filteredJokes = Array.from(jokes);

    if (filteredJokes.length === 0) {
        return [];
    }

    if (type && type !== "any") 
    {
        filteredJokes = filteredJokes.filter(joke => joke.type_name === type);
    }

    const result = [];

    if (count > filteredJokes.length) {
        count = filteredJokes.length; // Limit count to available jokes
    }

    for (let i = 0; i < count; i++) {
        result.push(filteredJokes[Math.floor(Math.random() * filteredJokes.length)]); /// Randomise returned jokes
    }

    return result;
}

app.get("/joke", (req,res) => 
{
    res.send(`<h1>Joke API</h1><p>Available endpoints:</p><ul><li>GET /joke/:type?count=x</li><li>GET /types</li><li>POST /submit</li></ul>`);
});

app.get("/joke/:type", (req, res) => {
    const type = req.params.type;
    const count = parseInt(req.query.count) || 1; // Default to 1 if not provided

    if (jokes.size == 0) {
        return res.status(503).json({ error: "No jokes available in database" });
    }

    const selectedJokes = getJokes(type, count);
    
    return res.json(selectedJokes);
});

app.get("/types", (req, res) => 
{
    database.queryDatabase("SELECT * FROM types;")
    .then(result => 
    {
        const rows = result[0];
        const typesList = rows.map(row => row.type_name);
        console.log("Fetched types from database:", typesList);
        return res.json(typesList);
    })
    .catch(err => 
    {
        console.error(`Error fetching types from database: ${err}`);
        return res.status(500).json({ error: "Internal Server Error" });
    });
});

app.post("/submit", async (req, res) =>
{
    const { type, setup, punchline } = req.body;

    if (!type || !setup || !punchline) 
    {
        return res.status(400).json({ error: "Missing required fields (type, setup, punchline)" });
    }

    try 
    {
        // First, get the type_id from the type_name
        const typeQuery = "SELECT id FROM types WHERE type_name = ?";
        const typeResult = await database.queryDatabase(typeQuery, [type]);
        
        if (typeResult[0].length === 0) {
            return res.status(400).json({ error: `Invalid type: ${type}` });
        }
        
        const type_id = typeResult[0][0].id;
        
        // Now insert the joke with the type_id
        const query = "INSERT INTO jokes (type_id, setup, punchline) VALUES (?, ?, ?)";
        const result = await database.queryDatabase(query, [type_id, setup, punchline]);
        
        const newId = result[0].insertId; 
        
        const newJoke = { id: newId, type_id, type_name: type, setup, punchline };
        jokes.add(newJoke);
        
        console.log(`New joke added with ID: ${newId}`);
        return res.status(201).json(newJoke);

    } 
    catch (err) 
    {
        console.error("Error adding joke to database:", err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

