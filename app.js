const database = require('./mysql.js');

const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();
const PORT = 3000;

app.use(express.json()) // For parsing application/json
app.use(cors()); // Enable CORS for all routes (HTTP Header: Access-Control-Allow-Origin: *) cross port communication.
app.use(express.static('public')); // Serve static files from 'public' directory

app.listen(PORT, () => 
{
  console.log(`Server is running on http://localhost:${PORT}`);
}); 

const ADJUST_INDEX = 1; // Adjust for 0 index array

const getJoke = (number) =>
{
    let jokes = [];

    number -= ADJUST_INDEX;

    for (let i = 0; i <= number; i++) 
    { 
        Promise.resolve().then(() => {
            jokes.push(JOKES[Math.floor(Math.random() * JOKES.length)]); // Randomise returned jokes
        });
    }

    return jokes;
}

app.get("/getjoke", (req,res) => 
{
    Promise.resolve().then(() => {
        res.send(`<h1>Future Documentation Page To Be Added.</h1><h2>GetJoke API Call</h2><p>localhost:3000/getjoke/number max jokes available: ${JOKES.length}</p>`);
    });
});

app.get("/getjoke/all", (req, res) =>
{
    Promise.resolve().then(() => res.json(JOKES));
});

app.get("/getjoke/:num", (req, res) => 
{
    let num = parseInt(req.params.num);

    if (JOKES.length == 0) // Server has no jokes
    {
        Promise.resolve().then(() => res.status(500).send("<p style='color:red'>ERROR: No jokes available</p>"));
    }

    if (isNaN(num)) // Not a number
    {
        Promise.resolve().then(() => res.status(400).send(`<link rel="stylesheet" href="stylesheet.css"><p style='color:red'>ERROR: Not a <b>number</b></p>`));
    }
    else if (num > JOKES.length) // Greater than available jokes
    {
        Promise.resolve().then(() => res.status(400).send(`<link rel="stylesheet" href="stylesheet.css"><p style='color:red'>ERROR: Number cannot be <b>greater than ${JOKES.length}</b></p>`));
    }
    else if (num < 1) // Less than 1
    {
        Promise.resolve().then(() => res.status(400).send("<p style='color:red'>ERROR: Number cannot be <b>less than 1</b></p>"));
    }
    else // Valid number
    {
        Promise.resolve().then(() => res.json(getJoke(num)));
    }
});