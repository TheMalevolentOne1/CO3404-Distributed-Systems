const LOWEST_JOKE_AMOUNT = 1;
const HIGHEST_JOKE_AMOUNT = 100;

document.addEventListener('DOMContentLoaded', () =>
{
    var button = document.getElementById('get-joke');
    const answerField = document.getElementById('answer-field');
    const numberInput = document.getElementById('joke-num');

    button.addEventListener('click', async () =>
    {
        if (numberInput.value >= LOWEST_JOKE_AMOUNT && numberInput.value <= HIGHEST_JOKE_AMOUNT)
        {
            const jokes = await fetch(`http://localhost:3000/getjoke/${numberInput.value}`).then(res => 
            { 
                if (res.status == 200) return res.json();
            }).catch(err => 
            {
                answerField.innerHTML = "<p>Data Collected!</p>";
                answerField.innerHTML = `<p style='color:red'>ERROR: ${err}</p>`;
                return;
            });

            if (jokes)
            {
                answerField.hidden = false;
                answerField.innerHTML = "<h2>Jokes:</h2>";

                jokes.forEach(joke => {
                    answerField.innerHTML += `<p>${joke}</p>`;
                });
            }
        }
        else
        {
            answerField.hidden = false;
            answerField.innerHTML = `<p style='color:red'>ERROR: Number must be between ${LOWEST_JOKE_AMOUNT} and ${HIGHEST_JOKE_AMOUNT - 1}</p>`;
        }
    });
});