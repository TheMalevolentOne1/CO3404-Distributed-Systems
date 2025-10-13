const LOWEST_JOKE_AMOUNT = 1;
const HIGHEST_JOKE_AMOUNT = 100;
const ANSWERFIELD = document.getElementById('answer-field');

const parse_jokes = (jokes) =>
{
    if (jokes.length == 0) return;

    ANSWERFIELD.innerHTML = "<h2>Jokes:</h2>";

    jokes.forEach((joke) => {
        const jokeDiv = document.createElement("div");
        ANSWERFIELD.appendChild(jokeDiv);
        const jokeP = document.createElement("p");
        jokeDiv.appendChild(jokeP);
        jokeP.innerHTML = `ID: ${joke['id']}<br>${joke['setup']}`;

        // div for countdown
        const punchlineDiv = document.createElement("div");
        jokeDiv.appendChild(punchlineDiv);
        const punchlineP = document.createElement("p");
        punchlineDiv.appendChild(punchlineP);

        /* TODO: Figure out how to make countdown Async

        // Countdown
        let timeLeft = 5;

        const timer = setInterval(async () => 
        {
            if (timeLeft > 0) 
            {
                punchlineP.innerHTML = `Get it yet? - ${timeLeft}`;
            } 
            else 
            {
                clearInterval(timer);
                punchlineP.innerHTML = `Punch Line: ${joke.punchline}`;
            }

            timeLeft--;
        }, 1000);
        */

        punchlineP.innerHTML = `${joke.punchline || "No Punch Line Available."}`;
    });
}

document.addEventListener('DOMContentLoaded', () =>
{
    var getJokeBtn = document.getElementById('get-joke');
    var getAllJokesBtn = document.getElementById('get-all-jokes');
    var getSpecificJokeBtn = document.getElementById('get-specific-joke');

    const numberInput = document.getElementById('joke-num');

    getJokeBtn.addEventListener('click', async () =>
    {
        if (numberInput.value >= LOWEST_JOKE_AMOUNT && numberInput.value <= HIGHEST_JOKE_AMOUNT)
        {
            const jokes = await fetch(`http://localhost:3000/getjoke/${numberInput.value}`).then(res => 
            { 
                if (res.status == 200) return res.json();
                ANSWERFIELD.innerHTML = "<p>Data Collected!</p>";
            }).catch(err => 
            {
                ANSWERFIELD.innerHTML = `<p style='color:red'>ERROR: ${err}</p>`;
                return;
            });
            parse_jokes(jokes);
        }
        else
        {
            ANSWERFIELD.innerHTML = `<p style='color:red'>ERROR: Number must be between ${LOWEST_JOKE_AMOUNT} and ${HIGHEST_JOKE_AMOUNT}</p>`;
        }
    });

    getAllJokesBtn.addEventListener('click', async () =>
    {
        const jokes = await fetch("http://localhost:3000/getjoke/all").then
        (
            res => res.json()
        ).catch
        (
            err =>
        {
            ANSWERFIELD.innerHTML = "<p>Data Collected!</p>";
            ANSWERFIELD.innerHTML = `<p style='color:red'>ERROR: ${err}</p>`;
            return;
        });

        parse_jokes(jokes);
    });
});
        
