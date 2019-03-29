document.getElementById('menu')!.addEventListener('click', (ev: any) => {
  ev.target.classList.toggle('is-showing');
});

if (window.top != window.self) {
  document.body.classList.add('iframe');
}
