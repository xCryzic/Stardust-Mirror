(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ----------------------------------------------------------------
     Dust particles
  ---------------------------------------------------------------- */
  function buildDust(){
    const field = document.getElementById("dust");
    if (!field) return;
    const count = window.innerWidth < 700 ? 10 : 22;
    for (let i = 0; i < count; i++){
      const p = document.createElement("i");
      const size = (Math.random() * 2 + 0.6).toFixed(1);
      const left = (Math.random() * 100).toFixed(2);
      const top = (Math.random() * 100).toFixed(2);
      const dur = (Math.random() * 14 + 14).toFixed(1);
      const delay = (Math.random() * -20).toFixed(1);
      const dx = (Math.random() * 60 - 30).toFixed(0) + "px";
      const dy = (Math.random() * -80 - 20).toFixed(0) + "px";
      const op = (Math.random() * 0.3 + 0.12).toFixed(2);
      p.style.width = size + "px";
      p.style.height = size + "px";
      p.style.left = left + "%";
      p.style.top = top + "%";
      p.style.setProperty("--dx", dx);
      p.style.setProperty("--dy", dy);
      p.style.setProperty("--dop", op);
      p.style.animationDuration = dur + "s";
      p.style.animationDelay = delay + "s";
      field.appendChild(p);
    }
  }

  /* ----------------------------------------------------------------
     Reveal choreography — slow, sequential, cinematic
  ---------------------------------------------------------------- */
  function runRevealSequence(){
    const steps = [
      { sel: '[data-reveal="1"]', delay: 650 },   // telemetry strip
      { sel: '[data-reveal="2"]', delay: 950 },   // title + subtitle (left) + mirror scene together
      { sel: '#mirrorScene', delay: 1150, mirror: true },
      { sel: '#reflection', delay: 1750, reflection: true }, // reflected title, slightly later
      { sel: '[data-reveal="3"]', delay: 2050 },  // mission tag + eyebrow
      { sel: '[data-reveal="4"]', delay: 2350 },  // story teaser + signal chip
      { sel: '[data-reveal="5"]', delay: 2750 },  // CTA
      { sel: '[data-reveal="6"]', delay: 3050 },  // meta + transmission tag + archive chip + mirror status
    ];

    steps.forEach(step => {
      window.setTimeout(() => {
        document.querySelectorAll(step.sel).forEach(el => el.classList.add("in"));
      }, reduceMotion ? 0 : step.delay);
    });
  }

  /* ----------------------------------------------------------------
     Mirror interactivity: glare + delayed parallax reflection
  ---------------------------------------------------------------- */
  function initMirror(){
    const mirror = document.getElementById("mirror");
    const glass = document.getElementById("mirrorGlass");
    const reflection = document.getElementById("reflection");
    if (!mirror || !glass || !reflection) return;

    let glareX = 0.5, glareY = 0.5;
    let reflX = 0, reflY = 0;           // current (lagging) reflection offset
    let targetReflX = 0, targetReflY = 0;
    let tiltX = -1.6, tiltY = -7;
    let targetTiltX = -1.6, targetTiltY = -7;

    function onMove(e){
      const rect = glass.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width;
      const ny = (e.clientY - rect.top) / rect.height;
      glareX = Math.min(1.15, Math.max(-0.15, nx));
      glareY = Math.min(1.15, Math.max(-0.15, ny));

      // reflection drifts opposite-ish to cursor, subtle
      targetReflX = (nx - 0.5) * -14; // px
      targetReflY = (ny - 0.5) * -8;

      // whole mirror tilts very slightly toward the cursor
      const vw = window.innerWidth, vh = window.innerHeight;
      const px = e.clientX / vw, py = e.clientY / vh;
      targetTiltY = -7 + (px - 0.5) * 6;
      targetTiltX = -1.6 + (py - 0.5) * -4;
    }

    window.addEventListener("mousemove", onMove, { passive: true });

    function tick(){
      glass.style.setProperty("--mx", glareX.toFixed(3));
      glass.style.setProperty("--my", glareY.toFixed(3));

      // lerp for a soft delay — reflection lags the real motion
      reflX += (targetReflX - reflX) * 0.045;
      reflY += (targetReflY - reflY) * 0.045;
      tiltX += (targetTiltX - tiltX) * 0.03;
      tiltY += (targetTiltY - tiltY) * 0.03;

      reflection.style.transform =
        `scaleX(-1) translate3d(${reflX.toFixed(2)}px, ${reflY.toFixed(2)}px, 0)`;
      mirror.style.transform =
        `rotateY(${tiltY.toFixed(2)}deg) rotate(${tiltX.toFixed(2)}deg)`;

      requestAnimationFrame(tick);
    }

    if (!reduceMotion){
      requestAnimationFrame(tick);
    } else {
      reflection.style.transform = "scaleX(-1)";
    }
  }

  /* ----------------------------------------------------------------
     MIRROR status — dormant, with an occasional, barely-there glitch.
     The player should not be sure whether they actually saw it change.
  ---------------------------------------------------------------- */
  function initMirrorStatus(){
    const panel = document.getElementById("mirrorStatus");
    const value = document.getElementById("statusValue");
    const light = document.getElementById("statusLight");
    if (!panel || !value || !light) return;
    if (reduceMotion) return;

    const dormantText = "STATUS: DORMANT";
    const glitchText = "STATUS: ACTIVE";

    function glitch(){
      panel.classList.add("is-glitching");
      value.textContent = glitchText;
      window.setTimeout(() => {
        value.textContent = dormantText;
        panel.classList.remove("is-glitching");
      }, 140 + Math.random() * 120);
    }

    function scheduleNext(){
      // rare: roughly once every 25–55 seconds
      const wait = 25000 + Math.random() * 30000;
      window.setTimeout(() => {
        glitch();
        scheduleNext();
      }, wait);
    }

    scheduleNext();
  }

  /* ----------------------------------------------------------------
     CTA — quiet terminal-style acknowledgement
  ---------------------------------------------------------------- */
  function initCTA(){
    const btn = document.getElementById("ctaBtn");
    const mirror = document.getElementById("mirror");
    if (!btn) return;
    btn.addEventListener("click", () => {
      btn.classList.add("pressed");
      if (mirror){
        mirror.animate(
          [
            { filter: "brightness(1)" },
            { filter: "brightness(1.35)" },
            { filter: "brightness(1)" }
          ],
          { duration: 700, easing: "ease-out" }
        );
      }
      window.setTimeout(() => {
        btn.classList.remove("pressed");
        window.location.href = "questions/question-page.html";
      }, 700);
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    buildDust();
    initMirror();
    initMirrorStatus();
    initCTA();

    const startup = document.getElementById("startupOverlay");

    if (startup) {
      window.addEventListener("stardust-startup-complete", runRevealSequence, { once: true });
    } else {
      runRevealSequence();
    }
  });
})();
