const LOWEST_JOKE_AMOUNT = 1;
const HIGHEST_JOKE_AMOUNT = 100;

const BASE_URL = `http://localhost:3000`; // Base URL for API calls
const JOKES_API = `${BASE_URL}/joke`; // Endpoint for jokes API
const TYPES_API = `${BASE_URL}/types`; // Endpoint for joke types API

let answerField; // Global variable to store answer field element
let numberInput; // Global variable to store number input element
let typeSelect;  // Global variable to store type select element
let getJokeBtn; // Global variable to store get joke button element
let allJokesBtn; // Global variable to store get all jokes button element
let clearBtn; // Global variable to store clear button element

/* 
Brief: Makes an HTTP GET request to the specified endpoint and returns the parsed JSON data.

@Params: endpoint - The URL to which the GET request will be sent.

@Returns: Parsed JSON data from the response, or null if an error occurs.
@ReturnT: Parsed JSON data from the API response
@ReturnF: null if there is an error during the fetch operation
*/
const makeRequest = async (endpoint) =>
{
    console.log(`Making request to: ${endpoint}`);
    try 
    {
        const response = await fetch(endpoint);
        if (response.status !== 200) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        return data;
    } catch (error) 
    {
        console.error("Error fetching joke:", error);
        return null; // Return null instead of undefined
    }
}

/*
Brief: A simple endpoint to provide information about the Joke API and its available endpoints.

@Returns: API Information
@ReturnT: 200 OK with API details
@ReturnF: N/A 
*/
const parse_jokes = async (jokes, shouldCountdown, answerField) =>
{
    let countdown;

    if (jokes.length == 0) return;

    answerField.innerHTML = "<h2>Jokes:</h2>";

    if (shouldCountdown && jokes.length > 0)
    {
        countdown = 3000; // 3 seconds countdown for punchline reveal

        for (let i = 0; i < jokes.length; i++)
        {
            const joke = jokes[i];
            const jokeDiv = document.createElement("div");
            answerField.appendChild(jokeDiv);
            
            const jokeP = document.createElement("p");
            jokeDiv.appendChild(jokeP);
            jokeP.innerHTML = `ID: ${joke['id']}<br>${joke['setup']}`;

            const punchlineP = document.createElement("p");
            jokeDiv.appendChild(punchlineP);
            
            let timeLeft = 3;
            punchlineP.innerHTML = `Get it yet<br>${timeLeft}!`;
            
            await new Promise(resolve => {
                const timer = setInterval(() => {
                    timeLeft--;
                    if (timeLeft > 0) {
                        punchlineP.innerHTML = `Get it yet<br>${timeLeft}!`;
                    } else {
                        clearInterval(timer);
                        punchlineP.innerHTML = `Punchline: ${joke.punchline}`;
                        resolve();
                    }
                }, countdown); // 3 second interval
            });
        }
    }
    else
    {
        countdown = 0; // No countdown, show punchline immediately

        jokes.forEach(joke => {
            const jokeDiv = document.createElement("div");
            answerField.appendChild(jokeDiv);
            
            const jokeP = document.createElement("p");
            jokeDiv.appendChild(jokeP);
            jokeP.innerHTML = `ID: ${joke['id']}<br>${joke['setup']}`;

            const punchlineP = document.createElement("p");
            jokeDiv.appendChild(punchlineP);
            punchlineP.innerHTML = `Punchline: ${joke.punchline}`;
        });

        return;
    }    
}

/*
Brief: 
Asynchronously Handles all interactions with the jokes API and types API, 
as well as parsing and displaying jokes on the frontend on Page Content load.
*/
document.addEventListener('DOMContentLoaded', async () =>
{
    answerField = document.getElementById('answer-field');
    numberInput = document.getElementById('joke-num');
    typeSelect = document.getElementById('joke-type');
    getJokeBtn = document.getElementById('get-joke');
    allJokesBtn = document.getElementById('get-all-jokes');
    clearBtn = document.getElementById('clear');

    getJokeBtn = document.getElementById('get-joke');
    allJokesBtn = document.getElementById('get-all-jokes');
    clearBtn = document.getElementById('clear');

    // Load types on startup
    await fetch(`${TYPES_API}`)
        .then(res => res.json())
        .then(types => {
            console.log("Available types:", types);
            types.forEach(type => {
                console.log(`Loaded type: ${type}`);
                const option = document.createElement("option");
                option.value = type;
                option.textContent = type.charAt(0).toUpperCase() + type.slice(1); // Capitalise first letter
                typeSelect.appendChild(option);
            });
        })
        .catch(err => console.error("Error fetching types:", err));


    /*
    Brief: Event listener for the "Clear" button, which clears the content of the answer field.

    @Returns: Clears the answer field content.
    @ReturnT: The answer field is cleared of all content.
    @ReturnF: N/A
    */
    clearBtn.addEventListener('click', () => 
    {
        answerField.innerHTML = "";
    });

    /*
    Brief: Event listener for the "Get Joke" button, which retrieves jokes based on user-selected type and count, and displays them with optional countdown.

    @Returns: Displays retrieved jokes in the answer field, with optional countdown for punchline reveal.
    @ReturnT: Jokes displayed in the answer field with correct formatting and countdown if enabled.
    @ReturnF: Error message displayed if there is a connection issue, if no jokes match the criteria, or if the count is out of bounds.
    */
    getJokeBtn.addEventListener('click', async () => 
    {
        const count = numberInput.value;
        const type = typeSelect.value;

        if (count >= LOWEST_JOKE_AMOUNT && count <= HIGHEST_JOKE_AMOUNT)
        {
            const shouldCountdown = document.getElementById('countdown').checked;
            const jokes = await makeRequest(`${JOKES_API}/${type}?count=${HIGHEST_JOKE_AMOUNT}`);
            
            if (jokes === null) {
                answerField.innerHTML = "<p style='color:red'>ERROR: Failed to connect to server</p>";
            }
            else if (jokes && jokes.length > 0 && jokes.length <= 15) // Limit to 15 jokes for readability and performance
            {
                await parse_jokes(jokes, shouldCountdown, answerField);
            }
            else if (jokes && jokes.length === 0) {
                answerField.innerHTML = "<p style='color:red;'>No jokes found for this selection.</p>";
            }
            else {
                answerField.innerHTML = "<p style='color:red'>ERROR: Server error or invalid response</p>";
            }
        }
        else
        {
            answerField.innerHTML = `<p style='color:red'>ERROR: Number must be between ${LOWEST_JOKE_AMOUNT} and ${HIGHEST_JOKE_AMOUNT}</p>`;
        }
    });

    /*
    Brief: Event listener for the "Get All Jokes" button, which retrieves all jokes from the server and displays them with optional countdown.

    @Returns: Displays all jokes in the answer field, with optional countdown for punchline reveal.
    @ReturnT: All jokes displayed in the answer field with correct formatting and countdown if enabled.
    @ReturnF: Error message displayed if there is a connection issue or if no jokes are returned.
    */
    allJokesBtn.addEventListener('click', async () => 
    {
        const shouldCountdown = document.getElementById('countdown').checked;
        const endpoint = `${JOKES_API}/any?count=100000}`; // Use highest joke amount to attempt to retrieve all jokes
        const jokes = await makeRequest(`${endpoint}`);
        
        if (jokes === null) {
            answerField.innerHTML = "<p style='color:red'>ERROR: Failed to connect to server</p>";
        }
        else if (jokes && jokes.length > 0) {
            await parse_jokes(jokes, shouldCountdown, answerField);
        }
        else {
            answerField.innerHTML = "<p style='color:red'>ERROR: No jokes returned from server</p>";
        }
    });
});