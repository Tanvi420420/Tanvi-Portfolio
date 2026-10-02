const siteHeader = document.querySelector('.site-header');
const menuToggle = document.querySelector('.menu-toggle');
const navMenu = document.querySelector('.nav-menu');
const themeToggle = document.querySelector('.theme-toggle');
const resumeDownload = document.querySelector('#resume-download');
const contactForm = document.querySelector('#contact-form');
const formNote = document.querySelector('#form-note');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

async function triggerResumeDownload(event) {
  if (!resumeDownload) return;

  const resumeUrl = resumeDownload.getAttribute('href');
  const downloadName = resumeDownload.getAttribute('download') || 'Tanvi-Kushwaha-Resume.pdf';

  if (!resumeUrl) return;

  event.preventDefault();

  try {
    const response = await fetch(resumeUrl, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Resume download failed: ${response.status}`);

    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const tempLink = document.createElement('a');
    tempLink.href = objectUrl;
    tempLink.download = downloadName;
    tempLink.rel = 'noopener';
    tempLink.style.display = 'none';
    document.body.appendChild(tempLink);
    tempLink.click();
    tempLink.remove();
    setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
  } catch (error) {
    const fallbackLink = document.createElement('a');
    fallbackLink.href = resumeUrl;
    fallbackLink.download = downloadName;
    fallbackLink.target = '_blank';
    fallbackLink.rel = 'noopener';
    fallbackLink.style.display = 'none';
    document.body.appendChild(fallbackLink);
    fallbackLink.click();
    fallbackLink.remove();
  }
}

if (resumeDownload) {
  resumeDownload.addEventListener('click', triggerResumeDownload);
}

function applyTheme(theme) {
  const isDark = theme === 'dark';
  document.documentElement.dataset.theme = isDark ? 'dark' : 'light';
  themeToggle.setAttribute('aria-pressed', String(isDark));
  themeToggle.setAttribute('aria-label', isDark ? 'Use light theme' : 'Use dark theme');
  themeToggle.title = isDark ? 'Use light theme' : 'Use dark theme';
}

try {
  applyTheme(localStorage.getItem('tanvi-theme') === 'dark' ? 'dark' : 'light');
} catch {
  applyTheme('light');
}

themeToggle.addEventListener('click', () => {
  const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  applyTheme(nextTheme);

  try {
    localStorage.setItem('tanvi-theme', nextTheme);
  } catch {
    // Theme switching still works for this page when storage is unavailable.
  }
});

function updateHeader() {
  siteHeader.classList.toggle('is-scrolled', window.scrollY > 16);
}

function closeMenu() {
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Open navigation menu');
  navMenu.classList.remove('is-open');
}

menuToggle.addEventListener('click', () => {
  const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!isExpanded));
  menuToggle.setAttribute('aria-label', isExpanded ? 'Open navigation menu' : 'Close navigation menu');
  navMenu.classList.toggle('is-open', !isExpanded);
});

navMenu.addEventListener('click', (event) => {
  if (event.target.closest('a')) closeMenu();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') {
    closeMenu();
    menuToggle.focus();
  }
});

window.addEventListener('scroll', updateHeader, { passive: true });
updateHeader();

if ('IntersectionObserver' in window && !reduceMotion) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -24px 0px' });

  document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));
} else {
  document.querySelectorAll('.reveal').forEach((element) => element.classList.add('is-visible'));
}

document.querySelector('#current-year').textContent = new Date().getFullYear();

contactForm.addEventListener('submit', (event) => {
  event.preventDefault();
  formNote.classList.remove('is-error');

  const fields = [...contactForm.querySelectorAll('input, textarea')];
  let firstInvalidField;
  fields.forEach((field) => {
    field.value = field.value.trim();
    const minimumLength = Number(field.getAttribute('minlength')) || 0;
    const isValid = field.value.length >= minimumLength && field.checkValidity();
    field.setAttribute('aria-invalid', String(!isValid));
    if (!isValid && !firstInvalidField) firstInvalidField = field;
  });

  if (firstInvalidField) {
    formNote.textContent = 'Please enter a valid name, email address, and message (at least 10 characters).';
    formNote.classList.add('is-error');
    firstInvalidField.focus();
    return;
  }

  formNote.textContent = 'Your details are valid, but this form does not send messages. Please use the email link to contact Tanvi.';
  contactForm.reset();
  fields.forEach((field) => field.removeAttribute('aria-invalid'));
});

contactForm.querySelectorAll('input, textarea').forEach((field) => {
  field.addEventListener('input', () => {
    if (field.getAttribute('aria-invalid') === 'true') field.removeAttribute('aria-invalid');
  });
});