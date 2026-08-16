(() => {
  "use strict";

  const reduceMotion =
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;


  /* ============================================================
     DUST PARTICLES
  ============================================================ */

  function buildDust() {
    const field = document.getElementById("dust");
    if (!field) return;

    const count = window.innerWidth < 700 ? 10 : 22;

    for (let i = 0; i < count; i++) {
      const p = document.createElement("i");

      const size = (Math.random() * 2 + 0.6).toFixed(1);
      const left = (Math.random() * 100).toFixed(2);
      const top = (Math.random() * 100).toFixed(2);
      const dur = (Math.random() * 14 + 14).toFixed(1);
      const delay = (Math.random() * -20).toFixed(1);

      const dx =
        (Math.random() * 60 - 30).toFixed(0) + "px";

      const dy =
        (Math.random() * -80 - 20).toFixed(0) + "px";

      const op =
        (Math.random() * 0.3 + 0.12).toFixed(2);

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


  /* ============================================================
     REVEAL CHOREOGRAPHY
  ============================================================ */

  function runRevealSequence() {

    const steps = [
      {
        sel: '[data-reveal="1"]',
        delay: 650
      },
      {
        sel: '[data-reveal="2"]',
        delay: 950
      },
      {
        sel: '#mirrorScene',
        delay: 1150
      },
      {
        sel: '#reflection',
        delay: 1750
      },
      {
        sel: '[data-reveal="3"]',
        delay: 2050
      },
      {
        sel: '[data-reveal="4"]',
        delay: 2350
      },
      {
        sel: '[data-reveal="5"]',
        delay: 2750
      },
      {
        sel: '[data-reveal="6"]',
        delay: 3050
      }
    ];

    steps.forEach(step => {

      window.setTimeout(() => {

        document
          .querySelectorAll(step.sel)
          .forEach(el => {
            el.classList.add("in");
          });

      }, reduceMotion ? 0 : step.delay);

    });
  }


  /* ============================================================
     MIRROR INTERACTIVITY
  ============================================================ */

  function initMirror() {

    const mirror =
      document.getElementById("mirror");

    const glass =
      document.getElementById("mirrorGlass");

    const reflection =
      document.getElementById("reflection");

    if (!mirror || !glass || !reflection) {
      return;
    }

    let glareX = 0.5;
    let glareY = 0.5;

    let reflX = 0;
    let reflY = 0;

    let targetReflX = 0;
    let targetReflY = 0;

    let tiltX = -1.6;
    let tiltY = -7;

    let targetTiltX = -1.6;
    let targetTiltY = -7;


    function onMove(e) {

      const rect =
        glass.getBoundingClientRect();

      const nx =
        (e.clientX - rect.left) / rect.width;

      const ny =
        (e.clientY - rect.top) / rect.height;


      glareX =
        Math.min(
          1.15,
          Math.max(-0.15, nx)
        );

      glareY =
        Math.min(
          1.15,
          Math.max(-0.15, ny)
        );


      targetReflX =
        (nx - 0.5) * -14;

      targetReflY =
        (ny - 0.5) * -8;


      const vw = window.innerWidth;
      const vh = window.innerHeight;

      const px = e.clientX / vw;
      const py = e.clientY / vh;


      targetTiltY =
        -7 + (px - 0.5) * 6;

      targetTiltX =
        -1.6 + (py - 0.5) * -4;
    }


    window.addEventListener(
      "mousemove",
      onMove,
      { passive: true }
    );


    function tick() {

      glass.style.setProperty(
        "--mx",
        glareX.toFixed(3)
      );

      glass.style.setProperty(
        "--my",
        glareY.toFixed(3)
      );


      reflX +=
        (targetReflX - reflX) * 0.045;

      reflY +=
        (targetReflY - reflY) * 0.045;


      tiltX +=
        (targetTiltX - tiltX) * 0.03;

      tiltY +=
        (targetTiltY - tiltY) * 0.03;


      reflection.style.transform =
        `scaleX(-1) translate3d(
          ${reflX.toFixed(2)}px,
          ${reflY.toFixed(2)}px,
          0
        )`;


      mirror.style.transform =
        `rotateY(${tiltY.toFixed(2)}deg)
         rotate(${tiltX.toFixed(2)}deg)`;


      requestAnimationFrame(tick);
    }


    if (!reduceMotion) {
      requestAnimationFrame(tick);
    } else {
      reflection.style.transform = "scaleX(-1)";
    }
  }


  /* ============================================================
     MIRROR STATUS GLITCH
  ============================================================ */

  function initMirrorStatus() {

    const panel =
      document.getElementById("mirrorStatus");

    const value =
      document.getElementById("statusValue");

    const light =
      document.getElementById("statusLight");


    if (!panel || !value || !light) {
      return;
    }

    if (reduceMotion) {
      return;
    }


    const dormantText =
      "STATUS: DORMANT";

    const glitchText =
      "STATUS: ACTIVE";


    function glitch() {

      panel.classList.add("is-glitching");

      value.textContent = glitchText;


      window.setTimeout(() => {

        value.textContent = dormantText;

        panel.classList.remove("is-glitching");

      }, 140 + Math.random() * 120);
    }


    function scheduleNext() {

      const wait =
        25000 + Math.random() * 30000;


      window.setTimeout(() => {

        glitch();
        scheduleNext();

      }, wait);
    }


    scheduleNext();
  }


  /* ============================================================
     INVESTIGATION VIDEO
  ============================================================ */

  function startInvestigationVideo() {

    const overlay =
      document.getElementById(
        "investigationVideoOverlay"
      );

    const video =
      document.getElementById(
        "investigationVideo"
      );


    if (!overlay || !video) {

      console.error(
        "[STARDUST] Investigation video elements missing."
      );

      // If the video isn't available, don't trap the player.
      window.location.href = "/questions/question-page.html";

      return;
    }


    console.log(
      "[STARDUST] Investigation video starting."
    );


    // Make absolutely sure the overlay is visible.
    overlay.classList.add("active");

    // Prevent scrolling behind the video.
    document.body.classList.add(
      "investigation-video-playing"
    );


    // Always start from the beginning.
    try {
      video.currentTime = 0;
    } catch (error) {
      console.warn(
        "[STARDUST] Could not reset video:",
        error
      );
    }


    const playPromise =
      video.play();


    if (playPromise !== undefined) {

      playPromise
        .then(() => {

          console.log(
            "[STARDUST] Investigation video playing."
          );

        })
        .catch(error => {

          console.error(
            "[STARDUST] Video playback failed:",
            error
          );

          // Don't leave the user stuck on a black screen.
          setTimeout(() => {
            window.location.href = "/questions/question-page.html";
          }, 300);

        });
    }
  }


  /* ============================================================
     SCI-FI GATE TRANSITION
  ============================================================ */

  function startMissionGate() {

    const gate =
      document.getElementById(
        "missionTransition"
      );


    // If the gate doesn't exist, skip it.
    if (!gate) {

      console.warn(
        "[STARDUST] Mission gate not found."
      );

      startInvestigationVideo();

      return;
    }


    console.log(
      "[STARDUST] Mission gate activated."
    );


    /*
      STEP 1
      Bring gate onto screen.
    */

    gate.classList.add("active");


    /*
      STEP 2
      Let the gate sit for a moment,
      then open it.
    */

    window.setTimeout(() => {

      gate.classList.add("opening");

    }, 1100);


    /*
      STEP 3
      Once the gate animation is finished,
      hide it and start the investigation video.
    */

    window.setTimeout(() => {

      gate.classList.remove("active");
      gate.classList.remove("opening");

      startInvestigationVideo();

    }, 2600);
  }


  /* ============================================================
     CTA
  ============================================================ */

  function initCTA() {

    const btn =
      document.getElementById("ctaBtn");

    const mirror =
      document.getElementById("mirror");


    if (!btn) {
      return;
    }


    btn.addEventListener("click", () => {

      console.log(
        "[STARDUST] BEGIN INVESTIGATION clicked."
      );


      /*
        Prevent double clicking.
      */

      if (
        btn.classList.contains("pressed") ||
        btn.disabled
      ) {
        return;
      }


      btn.classList.add("pressed");
      btn.disabled = true;


      /*
        Mirror flash.
      */

      if (
        mirror &&
        typeof mirror.animate === "function"
      ) {

        mirror.animate(

          [
            {
              filter: "brightness(1)"
            },

            {
              filter: "brightness(1.35)"
            },

            {
              filter: "brightness(1)"
            }

          ],

          {
            duration: 700,
            easing: "ease-out"
          }
        );
      }


      /*
        Start the gate.
        If reduced motion is enabled,
        skip the gate and go directly to video.
      */

      if (reduceMotion) {

        startInvestigationVideo();

      } else {

        startMissionGate();

      }

    });
  }


  /* ============================================================
     VIDEO END / SKIP / ERROR
  ============================================================ */

  function initInvestigationVideo() {

    const video =
      document.getElementById(
        "investigationVideo"
      );

    const skip =
      document.getElementById(
        "skipInvestigation"
      );


    if (!video) {
      return;
    }


    /*
      VIDEO FINISHED
    */

    video.addEventListener(
      "ended",
      () => {

        console.log(
          "[STARDUST] Investigation video finished."
        );


        document.body.classList.remove(
          "investigation-video-playing"
        );


        window.location.href =
          "/questions/question-page.html";

      }
    );


    /*
      OPTIONAL SKIP BUTTON
    */

    if (skip) {

      skip.addEventListener(
        "click",
        () => {

          console.log(
            "[STARDUST] Investigation video skipped."
          );


          video.pause();
          video.currentTime = 0;


          window.location.href =
            "/questions/question-page.html";

        }
      );
    }


    /*
      VIDEO ERROR
    */

    video.addEventListener(
      "error",
      () => {

        console.error(
          "[STARDUST] Investigation video could not be loaded."
        );

        console.error(video.error);


        // Don't leave the player stuck.
        window.location.href =
          "/questions/question-page.html";

      }
    );
  }


  /* ============================================================
     INITIALIZE
  ============================================================ */

  document.addEventListener(
    "DOMContentLoaded",
    () => {

      buildDust();

      initMirror();

      initMirrorStatus();

      initCTA();

      initInvestigationVideo();


      /*
        STARTUP ANIMATION
        This remains completely independent.
      */

      const startup =
        document.getElementById(
          "startupOverlay"
        );


      if (startup) {

        window.addEventListener(
          "stardust-startup-complete",
          runRevealSequence,
          { once: true }
        );

      } else {

        runRevealSequence();

      }

    }
  );

})();