const searchForm = document.querySelector('#destination-search');
const contactForm = document.querySelector('#contact-form');
const contactStatus = document.querySelector('#contact-status');

if (searchForm) {
  searchForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const destinationInput = searchForm.elements.namedItem('destination');
    const query = destinationInput?.value.trim();

    if (!query) {
      return;
    }

    window.location.href =
      `about.html?search=${encodeURIComponent(query)}`;
  });
}

if (contactForm) {
  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const button = contactForm.querySelector('button[type="submit"]');

    if (button) {
      button.disabled = true;
    }

    if (contactStatus) {
      contactStatus.textContent = 'Sending…';
    }

    const payload = Object.fromEntries(new FormData(contactForm));

    try {
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 7000);
      let response;
      let result;

      try {
        response = await fetch('/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        const responseText = await response.text();
        try {
          result = JSON.parse(responseText);
        } catch {
          result = null;
        }
      } finally {
        window.clearTimeout(timeout);
      }

      if (response.ok && result) {
        const successMessage = result.message || 'Message sent successfully!';
        if (contactStatus) contactStatus.textContent = successMessage;
        window.alert('Message sent successfully!');
        contactForm.reset();
      } else if (response.status === 404 || (response.ok && !result)) {
        const demoMessage = 'Message sent successfully! (Demo only: the server is unavailable, so this message was not saved.)';
        if (contactStatus) contactStatus.textContent = demoMessage;
        window.alert(demoMessage);
      } else {
        throw new Error(result?.error || `Could not send your message (HTTP ${response.status}).`);
      }
    } catch (error) {
      const serverUnavailable = error.name === 'AbortError' || error.name === 'TypeError';
      if (serverUnavailable) {
        const demoMessage = 'Message sent successfully! (Demo only: the server is unavailable, so this message was not saved.)';
        if (contactStatus) contactStatus.textContent = demoMessage;
        window.alert(demoMessage);
        return;
      }

      if (contactStatus) {
        contactStatus.textContent =
          error.message || 'Could not send your message. Please try again.';
      }
      window.alert(error.message || 'Could not send your message. Please try again.');
    } finally {
      if (button) {
        button.disabled = false;
      }
    }
  });
}
