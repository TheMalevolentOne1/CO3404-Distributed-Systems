const LOWEST_JOKE_AMOUNT = 1;
const HIGHEST_JOKE_AMOUNT = 100;

document.addEventListener('DOMContentLoaded', () =>
{
    var button = document.getElementById('get-joke');
    const answerField = document.getElementById('answer-field');
    const numberInput = document.getElementById('joke-num');

    button.addEventListener('click', async () =>
    {
        console.log("clicked!");
        if (numberInput.value >= LOWEST_JOKE_AMOUNT && numberInput.value < HIGHEST_JOKE_AMOUNT)
        {
            const response = await fetch('jokes.json');
            const jokes = await response.json();
            jokes = Math.floor(Math.random() * jokes.length); // Random joke index

            console.log("value is correct!")
            answerField.innerHTML = `<p>${jokes[numberInput.value - 1].question}</p><p>${jokes[numberInput.value - 1].punchline}</p>`;
        }
    });
});