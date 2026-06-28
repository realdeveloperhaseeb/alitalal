/* ===========================================================
   Ali Talal — Portfolio · main.js (vanilla JS)
   =========================================================== */
(function () {
  "use strict";

  /* ---- Year ---- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---- Sticky nav shadow ---- */
  var nav = document.getElementById("nav");
  function onScroll() {
    if (window.scrollY > 20) nav.classList.add("scrolled");
    else nav.classList.remove("scrolled");
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---- Mobile menu ---- */
  var toggle = document.getElementById("navToggle");
  var menu = document.getElementById("mobileMenu");
  function closeMenu() {
    toggle.classList.remove("open");
    menu.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  }
  toggle.addEventListener("click", function () {
    var open = menu.classList.toggle("open");
    toggle.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", String(open));
  });
  menu.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", closeMenu);
  });

  /* ---- Reveal on scroll ---- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---- Animated counters ---- */
  var counters = document.querySelectorAll("[data-count]");
  function animateCount(el) {
    var target = parseInt(el.getAttribute("data-count"), 10);
    var suffix = el.textContent.replace(/[0-9]/g, "");
    var start = 0, dur = 1400, t0 = null;
    function step(ts) {
      if (!t0) t0 = ts;
      var p = Math.min((ts - t0) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(eased * target) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if ("IntersectionObserver" in window) {
    var co = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { animateCount(e.target); co.unobserve(e.target); }
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach(function (el) { co.observe(el); });
  }

  /* ---- Carousel ---- */
  var track = document.getElementById("carTrack");
  var viewport = document.getElementById("carViewport");
  var prev = document.querySelector(".car-prev");
  var next = document.querySelector(".car-next");
  var dotsWrap = document.getElementById("carDots");

  if (track && viewport) {
    var slides = Array.prototype.slice.call(track.children);
    var index = 0;

    function slideStep() {
      // width of one slide + gap
      var gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap || "22");
      return slides[0].getBoundingClientRect().width + gap;
    }
    function perView() {
      return Math.max(1, Math.round(viewport.getBoundingClientRect().width / slideStep()));
    }
    function maxIndex() {
      return Math.max(0, slides.length - perView());
    }

    function go(i) {
      index = Math.max(0, Math.min(i, maxIndex()));
      track.style.transform = "translateX(" + (-index * slideStep()) + "px)";
      update();
    }
    function update() {
      prev.disabled = index <= 0;
      next.disabled = index >= maxIndex();
      Array.prototype.forEach.call(dotsWrap.children, function (d, i) {
        d.classList.toggle("active", i === index);
      });
    }

    function buildDots() {
      dotsWrap.innerHTML = "";
      var count = maxIndex() + 1;
      for (var i = 0; i < count; i++) {
        var b = document.createElement("button");
        b.setAttribute("role", "tab");
        b.setAttribute("aria-label", "Go to slide " + (i + 1));
        (function (i) { b.addEventListener("click", function () { go(i); }); })(i);
        dotsWrap.appendChild(b);
      }
    }

    prev.addEventListener("click", function () { go(index - 1); });
    next.addEventListener("click", function () { go(index + 1); });

    // touch / drag support
    var startX = 0, dragging = false;
    viewport.addEventListener("touchstart", function (e) { startX = e.touches[0].clientX; dragging = true; }, { passive: true });
    viewport.addEventListener("touchend", function (e) {
      if (!dragging) return;
      var dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 45) go(index + (dx < 0 ? 1 : -1));
      dragging = false;
    }, { passive: true });

    // autoplay (pauses on hover)
    var timer = setInterval(autoplay, 4500);
    function autoplay() { go(index >= maxIndex() ? 0 : index + 1); }
    viewport.addEventListener("mouseenter", function () { clearInterval(timer); });
    viewport.addEventListener("mouseleave", function () { timer = setInterval(autoplay, 4500); });

    var rt;
    window.addEventListener("resize", function () {
      clearTimeout(rt);
      rt = setTimeout(function () { buildDots(); go(Math.min(index, maxIndex())); }, 150);
    });

    buildDots();
    go(0);
  }
})();
