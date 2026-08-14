(() => {
  "use strict";

  const overlay = document.getElementById("startupOverlay");
  const stage = document.getElementById("startupStage");
  const star = document.getElementById("startupStar");
  const dust = document.getElementById("startupDust");
  const logo = document.getElementById("startupLogo");
  const video = document.getElementById("startupVideo");
  const skipButton = document.getElementById("skipStartup");

  if (!overlay || !stage || !star || !dust || !logo || !video) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let raf = null;

  const clamp = t => Math.max(0, Math.min(1, t));
  const easeInOut = t =>
    t < 0.5 ? 8 * t * t * t * t : 1 - 8 * Math.pow(1 - t, 4);

  function finish() {
    if (overlay.classList.contains("is-complete")) return;

    star.style.opacity = "0";
    dust.style.opacity = "0";

    // Give the final emblem a moment to sit before revealing the site.
    window.setTimeout(() => {
      overlay.classList.add("is-complete");
      window.dispatchEvent(new CustomEvent("stardust-startup-complete"));
    }, reduceMotion ? 250 : 700);
  }

  function runTextAnimation() {
    cancelAnimationFrame(raf);

    // Fade out and remove the video to reveal the text animation underneath
    video.style.transition = "opacity 0.5s ease";
    video.style.opacity = "0";
    setTimeout(() => video.remove(), 500);

    star.style.opacity = "0";
    dust.style.opacity = "0";
    star.style.transform = "translate(-50%, -50%) scale(1)";
    dust.style.transform = "translate(-50%, -50%) scale(1)";
    star.style.backgroundPosition = "0% 0%";
    dust.style.backgroundPosition = "0% 0%";
    logo.style.opacity = "0";

    const startTime = performance.now();
    const durationMultiplier = reduceMotion ? 0.15 : 1;
    let animationDone = false;

    const loop = now => {
      const elapsed = (now - startTime) / 1000 / durationMultiplier;

      if (elapsed < 1.5) {
        star.style.opacity = clamp(elapsed / 0.1);
        const pFill = easeInOut(clamp((elapsed - 0.3) / 1.0));
        star.style.backgroundPosition = `0% ${pFill * 100}%`;
      } else if (elapsed < 3.5) {
        star.style.opacity = "1";
        star.style.backgroundPosition = "0% 100%";
        dust.style.opacity = "1";

        const pushTime = clamp((elapsed - 1.5) / 0.6);
        const pPush = 1 - Math.pow(1 - pushTime, 5);

        star.style.transform =
          `translate(calc(-50% - ${pPush * 150}vw), -50%) scale(1)`;
        dust.style.transform =
          `translate(calc(-50% + ${(1 - pPush) * 150}vw), -50%) scale(1)`;

        const pFillDust = easeInOut(clamp((elapsed - 2.5) / 0.8));
        dust.style.backgroundPosition = `0% ${pFillDust * 100}%`;
      } else if (elapsed < 4.8) {
        star.style.backgroundPosition = "0% 100%";
        dust.style.backgroundPosition = "0% 100%";

        const p = easeInOut(clamp((elapsed - 3.5) / 1.3));

        star.style.transform =
          `translate(calc(-50% - ${12.75 * p}% - ${150 * (1 - p)}vw), -50%) scale(${1 - 0.75 * p})`;
        dust.style.transform =
          `translate(calc(-50% + ${12.75 * p}%), -50%) scale(${1 - 0.75 * p})`;
      } else if (!animationDone) {
        animationDone = true;
        
        // Simple, clean crossfade to logo (no particles)
        star.style.transition = "opacity 0.9s ease";
        dust.style.transition = "opacity 0.9s ease";
        logo.style.transition = "opacity 0.9s ease";
        
        star.style.opacity = "0";
        dust.style.opacity = "0";
        logo.style.opacity = "1";

        // Wait a moment before completely clearing the overlay
        window.setTimeout(finish, 1000);
      }

      if (!animationDone) {
        raf = requestAnimationFrame(loop);
      }
    };

    raf = requestAnimationFrame(loop);
  }
// SKIP INTRO
skipButton.addEventListener("click", () => {
    cancelAnimationFrame(raf);

    if (video) {
        video.pause();
    }

    overlay.classList.add("is-complete");

    window.dispatchEvent(
        new CustomEvent("stardust-startup-complete")
    );
});
  // Initialize once fonts are loaded
  document.fonts.ready.then(() => {
    // 1. Fire text animation when the video ends natively
    video.addEventListener("ended", runTextAnimation);
    
    // 2. Failsafe: if video fails to load/play, fallback to text animation immediately
    video.addEventListener("error", runTextAnimation);
    
    // 3. Initiate playback. Browsers require 'muted' for autoplay to work without interaction
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // If autoplay is strictly blocked by the browser, skip the video and just run the text
        runTextAnimation();
      });
    }
  });

})();