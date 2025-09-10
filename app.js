// Lesson 3: reveal-on-scroll for #prompt with safety guards + motion preference
(function () {
  // 1) find the element
  const prompt = document.getElementById('prompt');
  if (!prompt) {
    // Graceful exit if the element is missing
    console.warn('[app] #prompt not found — skipping reveal observer');
    return;
  }

  // 2) respect reduced motion users: reveal immediately, no animation
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    prompt.classList.add('show');
    // Optional: remove transition so it’s instant
    prompt.style.transition = 'none';
    console.info('[app] prefers-reduced-motion: revealing #prompt without animation');
    return;
  }

  // 3) set up IntersectionObserver (reveal when 30% in view)
  const io = new IntersectionObserver((entries, observer) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('show');
        observer.unobserve(entry.target); // one-time reveal
      }
    }
  }, { threshold: 0.3 });

  io.observe(prompt);
  console.log('[app] observer attached to #prompt');
})();

// Lesson 4: Prompt minimize/restore
// Persisted minimize/restore + keyboard polish
(function () {
  const prompt = document.getElementById('prompt');
  const launch = document.querySelector('.prompt-launch');
  const closeBtn = document.querySelector('.prompt-close');
  if (!prompt || !launch || !closeBtn) {
    console.warn('[app] prompt/launch/close not found — skipping toggle');
    return;
  }

  const STORAGE_KEY = `prompt:minimized:${location.pathname}`;

  function showPrompt() {
    prompt.removeAttribute('hidden');
    launch.hidden = true;
    launch.setAttribute('aria-expanded', 'true');
    prompt.classList.add('show');
    // Move focus into the card (optional: pick the first focusable element)
    closeBtn.focus();
  }

  function hidePrompt() {
    prompt.setAttribute('hidden', 'hidden');
    launch.hidden = false;
    launch.setAttribute('aria-expanded', 'false');
    // Return focus to the opener so keyboard users don't get lost
    launch.focus();
  }

  // Initial state from storage
  const wasMinimized = localStorage.getItem(STORAGE_KEY) === '1';
  if (wasMinimized) {
    hidePrompt();
  } else {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      prompt.classList.add('show');
      prompt.style.transition = 'none';
    }
  }

  // Buttons
  launch.addEventListener('click', () => {
    showPrompt();
    localStorage.setItem(STORAGE_KEY, '0');
  });
  closeBtn.addEventListener('click', () => {
    hidePrompt();
    localStorage.setItem(STORAGE_KEY, '1');
  });

  // ESC to minimize when the card is open
  prompt.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' || e.key === 'Esc') {
      e.stopPropagation();
      hidePrompt();
      localStorage.setItem(STORAGE_KEY, '1');
    }
  });

  // Observer: only auto-reveal if not minimized
  const io = new IntersectionObserver((entries, observer) => {
    const minimizedNow = localStorage.getItem(STORAGE_KEY) === '1';
    if (minimizedNow) return;
    for (const entry of entries) {
      if (entry.isIntersecting) {
        prompt.classList.add('show');
        observer.unobserve(entry.target);
      }
    }
  }, { threshold: 0.3 });
  io.observe(prompt);

  console.log('[app] prompt persistence + keyboard polish wired');
})();


