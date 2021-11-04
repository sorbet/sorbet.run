const useLightTheme = () => {
  const stored = window.localStorage.getItem('useLightTheme');
  if (stored == null) {
    return null;
  } else {
    return JSON.parse(stored);
  }
}

const toggleTheme = () => {
  const current = useLightTheme();
  window.localStorage.setItem('useLightTheme', !current);
  document.querySelector('html').classList.toggle('stripe-light');
}

// First load
const initialLightTheme = useLightTheme();
if (initialLightTheme === true) {
  document.querySelector('html').classList.toggle('stripe-light');
} else if (initialLightTheme === null && window.matchMedia("(prefers-color-scheme: light)").matches) {
  toggleTheme();
} else {
  window.localStorage.setItem('useLightTheme', false);
}

document.querySelector('.reveal .title').addEventListener('click', (ev) => {
  ev.preventDefault();
  toggleTheme();
});

window.matchMedia("(prefers-color-scheme: light)").addEventListener("change", (ev) => {
  const current = useLightTheme();
  const wantsLight = event.matches;
  if (wantsLight != current) {
    toggleTheme();
  }
});
