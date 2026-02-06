const LOWEST_JOKE_AMOUNT = 1;
const HIGHEST_JOKE_AMOUNT = 100;

const BASE_URL = `http://localhost:3000`; // Base URL for API calls
const JOKES_API = `${BASE_URL}/jokes`; // Endpoint for jokes API
const TYPES_API = `${BASE_URL}/types`; // Endpoint for joke types API

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
    }
}

const parse_jokes = (jokes, showCountdownForEach, answerField) =>
{
    if (jokes.length == 0) return;

    answerField.innerHTML = "<h2>Jokes:</h2>";

    jokes.forEach((joke) => 
    {
        const jokeDiv = document.createElement("div");
        jokeDiv.style.display = 'none'; // Hide joke while countdown is inactive
        answerField.appendChild(jokeDiv);
        const jokeP = document.createElement("p");
        jokeDiv.appendChild(jokeP);
        jokeP.innerHTML = `ID: ${joke['id']}<br>${joke['setup']}`;

        const punchlineP = document.createElement("p");
        jokeDiv.appendChild(punchlineP);

        for (let i = 0; i <= joke.size; i++) 
        {
            if (showCountdown) // Only do countdown for single/small joke requests
            {
                jokeDiv.style.display = 'block'; // Show joke for countdown
                // Countdown
                let timeLeft = 5;

                const timer = setInterval(async () => 
                {
                    if (timeLeft > 0) 
                    {
                        punchlineP.innerHTML = `Get it yet<br>${timeLeft}!`;
                    } 
                    else 
                    {
                        clearInterval(timer);
                        punchlineP.innerHTML = `Punch Line: ${joke.punchline}`;
                    }

                    timeLeft--;
                }, 3000); // Update every 3 seconds
            }
            else
            {
                punchlineP.innerHTML = `${joke.punchline || "No Punch Line Available."}`;
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', async () =>
{
    const answerField = document.getElementById('answer-field');
    var getJokeBtn = document.getElementById('get-joke');
    var getAllJokesBtn = document.getElementById('get-all-jokes');
    const numberInput = document.getElementById('joke-num');
    const typeSelect = document.getElementById('joke-type');

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


    getJokeBtn.addEventListener('click', async () =>
    {
        const count = numberInput.value;
        const type = typeSelect.value;

        if (count >= LOWEST_JOKE_AMOUNT && count <= HIGHEST_JOKE_AMOUNT)
        {
            const endpoint = `/joke/${type}?count=${count}`;
            const jokes = await makeRequest(`${BASE_URL}${endpoint}`);
            if (jokes && jokes.length > 0) parse_jokes(jokes, true, answerField);
            else if (jokes && jokes.length === 0) answerField.innerHTML = "<p style='color:red;'>No jokes found for this selection.</p>";
            else answerField.innerHTML = "<p style='color:red'>ERROR: Server error or invalid response</p>";
        }
        else
        {
            answerField.innerHTML = `<p style='color:red'>ERROR: Number must be between ${LOWEST_JOKE_AMOUNT} and ${HIGHEST_JOKE_AMOUNT}</p>`;
        }
    });

    getAllJokesBtn.addEventListener('click', async () =>
    {
        const endpoint = "/joke/any?count=1000"; // Get up to 1000 jokes (all jokes)
        const jokes = await makeRequest(`${BASE_URL}${endpoint}`);
        if (jokes && jokes.length > 0) parse_jokes(jokes, false, answerField); // No countdown for bulk retrieval
        else answerField.innerHTML = "<p style='color:red'>ERROR: No jokes returned from server</p>";
    });
});