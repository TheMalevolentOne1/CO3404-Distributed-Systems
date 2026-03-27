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

/*
Brief: Loads all jokes from the database into the global 'jokes' Set for quick access.
*/
const getAllJokes = () =>
{
    database.queryDatabase("SELECT jokes.id, jokes.setup, jokes.punchline, jokes.type_id, types.type_name FROM jokes JOIN types ON jokes.type_id = types.id")
    .then(result => {
        const rows = result[0];
        rows.forEach(joke => jokes.add(joke));
    }).catch(err => {
        console.error(`Error loading jokes from the database: ${err}`);
    });
}

// Load jokes from database on startup
getAllJokes(); // Load jokes from database on startup

/*
Brief: Retrieves jokes based on type and count, with optional countdown for punchline reveal.

@Params1: type - The type of joke to retrieve (e.g., "any", "knock-knock", "programming").
@Params2: count - The number of jokes to retrieve.
@Params3: shouldCountdown - Boolean indicating whether to delay punchline reveal.

@Returns: Array of Jokes
@ReturnT: Array of joke objects matching the specified type and count
@ReturnF: may return an empty array if no jokes match the criteria
*/
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

/*
Brief: /joke endpoint to provide information about the API and demonstrate availability.

@Returns: API Information
@ReturnT: 200 OK with API details
@ReturnF: N/A 
*/
app.get("/joke", (req,res) => 
{
    res.send(`<h1>Joke API</h1><p>Available endpoints:</p><ul><li>GET /joke/:type?count=x</li><li>GET /types</li><li>POST /submit</li></ul>`);
});

/*
Brief: /joke/:type endpoint to retrieve jokes of a specific type and count.

@Params1: type - The type of joke to retrieve (e.g., "any", "knock-knock", "programming").
@Params2: count - The number of jokes to retrieve (optional, default is 1).

@Returns: Array of Jokes
@ReturnT: 200 OK with array of jokes
@ReturnF: 503 Service Unavailable if no jokes are available in the database
*/
app.get("/joke/:type", (req, res) => {
    const type = req.params.type;
    const count = parseInt(req.query.count) || 1; // Default to 1 if not provided

    if (jokes.size == 0) {
        return res.status(503).json({ error: "No jokes available in database" });
    }

    const selectedJokes = getJokes(type, count);
    
    return res.json(selectedJokes);
});

/*
Brief: /types endpoint to retrieve all available joke types.

@Returns: Array of Joke Types
@ReturnT: 200 OK with array of joke types
@ReturnF: 500 Internal Server Error if there is an issue fetching types from the database
*/
app.get("/types", (req, res) => 
{
    database.queryDatabase("SELECT * FROM types;")
    .then(result => 
    {
        const rows = result[0];
        const typesList = rows.map(row => row.type_name);
        return res.json(typesList);
    })
    .catch(err => 
    {
        console.error(`Error fetching types from database: ${err}`);
        return res.status(500).json({ error: "Internal Server Error" });
    });
});

/*
Brief: /submit endpoint to allow users to submit new jokes to the database.

@Params1: type - The type of the joke (e.g., "knock-knock", "programming").
@Params2: setup - The setup of the joke.
@Params3: punchline - The punchline of the joke.

@Returns: The newly created joke object
@ReturnT: 201 Created with the new joke object
@ReturnF: 400 Bad Request if required fields are missing or invalid, 500 Internal Server Error for database issues
*/
app.post("/submit", async (req, res) =>
{
    const { type, setup, punchline } = req.body;

    if (!type || !setup || !punchline) 
    {
        return res.status(400).json({ error: "Missing required fields (type, setup, punchline)" });
    }

    try 
    {
        const typeQuery = "SELECT id FROM types WHERE type_name = ?";
        const typeResult = await database.queryDatabase(typeQuery, [type]);
        
        if (typeResult[0].length === 0) {
            return res.status(400).json({ error: `Invalid type: ${type}` });
        }
        
        const type_id = typeResult[0][0].id;
        
        const query = "INSERT INTO jokes (type_id, setup, punchline) VALUES (?, ?, ?)";
        const result = await database.queryDatabase(query, [type_id, setup, punchline]);
        
        const newId = result[0].insertId; 
        
        const newJoke = { id: newId, type_id, type_name: type, setup, punchline };
        jokes.add(newJoke);
        
        return res.status(201).json(newJoke);

    } 
    catch (err) 
    {
        console.error("Error adding joke to database:", err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

