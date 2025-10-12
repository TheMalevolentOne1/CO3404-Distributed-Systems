const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();
const PORT = 3000;

app.use(express.json()) // For parsing application/json
app.use(cors()); // Enable CORS for all routes (HTTP Header: Access-Control-Allow-Origin: *) cross port communication.

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
}); 

const JOKES = JSON.parse(fs.readFileSync("./jokes.json"));
const ADJUST_INDEX = 1; // Adjust for 0 index array

const getJoke = (number) =>
{
    let jokes = [];

    number -= ADJUST_INDEX;

    for (let i = 0; i <= number; i++) 
    { 
        jokes.push(JOKES[Math.floor(Math.random() * JOKES.length)]); // Randomise returned jokes
    }

    return jokes;
}2

app.get("/getjoke", (req,res) => 
{
    res.send(`<h1>Future Documentation Page To Be Added.</h1><h2>GetJoke API Call</h2><p>localhost:3000/getjoke/number max jokes available: ${JOKES.length}</p>`);
});

app.get("/getjoke/all", ( req, res ) => 
{
    res.json(JOKES);
});

app.get("/getjoke/:num", ( req, res ) => 
{
    let num = parseInt(req.params.num);

    if (JOKES.length == 0)
    {
        res.status(500).send("<p style='color:red'>ERROR: No jokes available</p>");
        return;
    }

    if (isNaN(num))
    {
        res.status(400).send(`<link rel="stylesheet" href="stylesheet.css"><p style='color:red'>ERROR: Not a <b>number</b></p>`);
        return;
    }
    else if (num > JOKES.length)
    {
        res.status(400).send(`<link rel="stylesheet" href="stylesheet.css"><p style='color:red'>ERROR: Number cannot be <b>greater than ${JOKES.length}</b></p>`);
        return;
    }
    else if (num < 1)
    {
        res.status(400).send("<p style='color:red'>ERROR: Number cannot be <b>less than 1</b></p>");
        return;
    }
    else
    {
        res.json(getJoke(num));
        return;
    }
});