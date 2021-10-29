const useLightTheme = () => {
  const stored = window.localStorage.getItem('useLightTheme');
  if (stored == null) {
    return false;
  } else {
    return JSON.parse(stored);
  }
}

// First load
if (useLightTheme()) {
  document.querySelector('html').classList.toggle('stripe-light');
}

document.querySelector('.reveal .title').addEventListener('click', (ev) => {
  ev.preventDefault();
  const current = useLightTheme();
  window.localStorage.setItem('useLightTheme', !current);
  document.querySelector('html').classList.toggle('stripe-light');
});
