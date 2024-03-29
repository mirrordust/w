// We need to import the CSS so that webpack will load it.
// The MiniCssExtractPlugin is used to separate it out into
// its own CSS file.
import "../css/app.css";

import "@fortawesome/fontawesome-free/js/all.js";

// webpack automatically bundles all modules in your
// entry points. Those entry points can be configured
// in "webpack.config.js".
//
// Import deps with the dep name or local files with a relative path, for example:
//
//     import {Socket} from "phoenix"
//     import socket from "./socket"
//
import "phoenix_html";
import { Socket } from "phoenix";
import topbar from "topbar";
import { LiveSocket } from "phoenix_live_view";
import { addHours, parseISO } from 'date-fns';
import moment from 'moment';
import MarkdownIt from 'markdown-it';


let csrfToken = document.querySelector("meta[name='csrf-token']").getAttribute("content");
let liveSocket = new LiveSocket("/live", Socket, { params: { _csrf_token: csrfToken } });
const mdParser = new MarkdownIt(/* Markdown-it options */);

// Show progress bar on live navigation and form submits
topbar.config({ barColors: { 0: "#29d" }, shadowColor: "rgba(0, 0, 0, .3)" });
window.addEventListener("phx:page-loading-start", info => topbar.show());
window.addEventListener("phx:page-loading-stop", info => topbar.hide());

function correctDate(wDate) {
  if (wDate) {
    const date = parseISO(wDate);
    const correctedDate = addHours(date, -date.getTimezoneOffset() / 60);
    return moment(correctedDate).format('YYYY-MM-DD HH:mm:ss');
  }
  return null;
}

// window.correctDate = correctDate;

document.addEventListener('DOMContentLoaded', () => {
  /* navbar */
  // Get all "navbar-burger" elements
  const $navbarBurgers = Array.prototype.slice.call(document.querySelectorAll('.navbar-burger'), 0);
  // Check if there are any navbar burgers
  if ($navbarBurgers.length > 0) {
    // Add a click event on each of them
    $navbarBurgers.forEach(el => {
      el.addEventListener('click', () => {
        // Get the target from the "data-target" attribute
        const target = el.dataset.target;
        const $target = document.getElementById(target);
        // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
        el.classList.toggle('is-active');
        $target.classList.toggle('is-active');
      });
    });
  }
  /* post datetime correct */
  const $wdates = Array.prototype.slice.call(document.querySelectorAll('.w-date'), 0);
  if ($wdates.length > 0) {
    $wdates.forEach(el => {
      const wrongDate = el.getAttribute('datetime');
      const realDate = correctDate(wrongDate);
      el.textContent = realDate;
    });
  }
  /* post list page markdown content */
  const $wglance = Array.prototype.slice.call(document.querySelectorAll('.w-rendered-body-glance'), 0);
  if ($wglance.length > 0) {
    $wglance.forEach(el => {
      const renderedHtml = el.getAttribute('w-rendered');
      el.innerHTML = renderedHtml;
      const tmp = el.textContent;
      el.innerHTML = tmp.slice(0, 100);
    });
  }
  /* post show page markdown content */
  const $wcontent = Array.prototype.slice.call(document.querySelectorAll('.w-content'), 0);
  if ($wcontent.length > 0) {
    $wcontent.forEach(el => {
      const raw1 = el.textContent;
      const raw2 = el.innerHTML;
      el.innerHTML = mdParser.render(raw1);
    });
  }
});

// connect if there are any LiveViews on the page
liveSocket.connect();

// expose liveSocket on window for web console debug logs and latency simulation:
// >> liveSocket.enableDebug()
// >> liveSocket.enableLatencySim(1000)  // enabled for duration of browser session
// >> liveSocket.disableLatencySim()
window.liveSocket = liveSocket;

