// submit.js - Handles form and API for submit.html

document.addEventListener('DOMContentLoaded', () => {
  const typeSelect = document.getElementById('type');
  const form = document.getElementById('jokeForm');
  const resultDiv = document.getElementById('result');

  // Fetch joke types from backend
  fetch('/types')
    .then(res => res.json())
    .then(types => {
      typeSelect.innerHTML = '';
      types.forEach(type => {
        const opt = document.createElement('option');
        opt.value = type;
        opt.textContent = type;
        typeSelect.appendChild(opt);
      });
    });

  form.addEventListener('submit', e => {
    e.preventDefault();
    const setup = document.getElementById('setup').value.trim();
    const punchline = document.getElementById('punchline').value.trim();
    const type = typeSelect.value;
    const newType = document.getElementById('newType').value.trim();
    if (!setup || !punchline || (!type && !newType)) {
      resultDiv.textContent = 'Please fill in all required fields.';
      return;
    }
    fetch('/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ setup, punchline, type, newType })
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          resultDiv.textContent = data.error;
        } else {
          resultDiv.textContent = 'Joke submitted!';
          form.reset();
        }
      })
      .catch(() => {
        resultDiv.textContent = 'Submission failed.';
      });
  });
});
