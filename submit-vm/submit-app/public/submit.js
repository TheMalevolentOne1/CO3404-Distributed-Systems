// submit.js - Handles form and API for submit.html
document.addEventListener('DOMContentLoaded', () => {
  const typeSelect = document.getElementById('type');
  const form = document.getElementById('jokeForm');
  const resultDiv = document.getElementById('result');

  // Fetch joke types from backend
  function loadTypes() {
    fetch('/types')
      .then(res => res.json())
      .then(types => {
        typeSelect.innerHTML = '<option value="">-- Select a type --</option>';
        types.forEach(type => {
          const opt = document.createElement('option');
          opt.value = type;
          opt.textContent = type;
          typeSelect.appendChild(opt);
        });
      })
      .catch(err => {
        console.error('Failed to load types:', err);
        resultDiv.textContent = 'Warning: Could not load joke types (using fallback cache)';
      });
  }

  // Load types on startup and refresh periodically
  loadTypes();
  setInterval(loadTypes, 60000); // Refresh every 60 seconds

  form.addEventListener('submit', e => {
    e.preventDefault();
    const setup = document.getElementById('setup').value.trim();
    const punchline = document.getElementById('punchline').value.trim();
    const type = typeSelect.value;
    const newType = document.getElementById('newType').value.trim();

    if (!setup || !punchline || (!type && !newType)) {
      resultDiv.textContent = 'Please fill in all required fields.';
      resultDiv.style.color = 'red';
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
          resultDiv.textContent = `Error: ${data.error}`;
          resultDiv.style.color = 'red';
        } else {
          resultDiv.textContent = 'Joke submitted successfully! ✓ (Will appear in joke app after ETL processing)';
          resultDiv.style.color = 'green';
          form.reset();
          typeSelect.value = '';
        }
      })
      .catch(err => {
        resultDiv.textContent = `Submission failed: ${err.message}`;
        resultDiv.style.color = 'red';
      });
  });
});
