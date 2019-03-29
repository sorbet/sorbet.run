"use strict";
document.getElementById('menu').addEventListener('click', function (ev) {
    ev.target.classList.toggle('is-showing');
});
if (window.top != window.self) {
    document.body.classList.add('iframe');
}
//# sourceMappingURL=page.js.map