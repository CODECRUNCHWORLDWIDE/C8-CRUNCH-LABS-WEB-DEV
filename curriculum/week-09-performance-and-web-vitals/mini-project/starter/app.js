// app.js — the slow JavaScript.
//
// Three deliberate offenders here:
// 1. The ad slot is filled 1500 ms after load with no reserved space (CLS).
// 2. The video iframe loads its src 2500 ms after load with no reserved
//    aspect ratio (CLS).
// 3. The "Load 1000 more" button appends 1000 nodes in a tight synchronous
//    loop, producing INP around 600–900 ms.
//
// Fix all three by reading the lectures and applying the named techniques.

(function () {
  "use strict";

  // ----------------------------------------------------------------
  // SLOW #11: Fill the ad slot after a short delay.
  // The slot has no reserved height in HTML/CSS; this push shifts content.
  // Fix in HTML or CSS: aspect-ratio or min-height on the slot.
  // ----------------------------------------------------------------
  setTimeout(function () {
    var slot = document.getElementById("ad-slot");
    if (!slot) return;
    slot.innerHTML =
      '<img src="https://picsum.photos/728/250?random=80" alt="A sponsored banner" style="max-width:100%;display:block;margin:0 auto;">';
  }, 1500);

  // ----------------------------------------------------------------
  // SLOW #12: Load the video iframe after a delay, with explicit dimensions
  // set in JavaScript. The dimensions arrive too late to prevent the shift.
  // Fix in HTML: set width/height attributes and/or CSS aspect-ratio so the
  // browser reserves space at first paint.
  // ----------------------------------------------------------------
  setTimeout(function () {
    var iframe = document.getElementById("video");
    if (!iframe) return;
    // We "load" a placeholder; the original starter never actually navigates
    // away from about:blank, but we do set dimensions so the layout reflows.
    iframe.width = 560;
    iframe.height = 315;
    iframe.src = "about:blank?after=2500ms";
  }, 2500);

  // ----------------------------------------------------------------
  // SLOW #13: The "Load 1000 more" button's handler. It synchronously
  // creates 1000 DOM nodes in a tight loop and appends them inside one
  // batch. On a 4x-throttled CPU, this runs around 600–900 ms.
  //
  // Fix options:
  //  - Chunk the work: append 50 at a time using requestIdleCallback or
  //    setTimeout, yielding to the main thread between chunks.
  //  - Use scheduler.yield() (modern Chrome) inside an async loop.
  //  - Render a virtualized list (only what's visible).
  //  - Use a DocumentFragment to batch the DOM writes (helps a little but
  //    does not fully solve INP — the layout still takes time).
  // ----------------------------------------------------------------
  var button = document.getElementById("load-more");
  if (button) {
    button.addEventListener("click", function () {
      var grid = document.getElementById("grid");
      if (!grid) return;
      // Deliberately synchronous, no fragment, no chunking.
      for (var i = 0; i < 1000; i++) {
        var img = document.createElement("img");
        img.src =
          "https://picsum.photos/1600/1200?random=" + (100 + i);
        img.alt = "";
        grid.appendChild(img);
      }
    });
  }

  // ----------------------------------------------------------------
  // A small no-op that touches the DOM on every animation frame.
  // Included to add a constant low-level main-thread cost. Not the worst
  // offender on the page, but Performance Insights will flag it as a long
  // task source if it happens to coincide with a busy moment.
  // Fix: remove it. It does nothing.
  // ----------------------------------------------------------------
  function tick() {
    // touch the document title length so it cannot be optimized away
    var n = document.title.length;
    if (n < 0) console.log(n);
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();
