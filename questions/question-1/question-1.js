(() => {
  "use strict";

  document.addEventListener("DOMContentLoaded", async () => {

    const nextQuestionContainer =
  document.getElementById("nextQuestionContainer");

const nextQuestionButton =
  document.getElementById("nextQuestionButton");

    const questionText =
      document.getElementById("questionText");

    const hintText =
      document.getElementById("hintText");

    const backendStatus =
      document.getElementById("backendStatus");
    const form =
      document.getElementById("answerForm");

    const input =
      document.getElementById("answerInput");

    const answerMessage =
      document.getElementById("answerMessage");
      const nextQuestionContainer =
  document.getElementById(
    "nextQuestionContainer"
  );

const nextQuestionButton =
  document.getElementById(
    "nextQuestionButton"
  );


    /* =========================================
       CONSOLE TRANSMISSION
       Q1 INTENDED SOLVE
    ========================================= */

console.log(
      "%c╔══════════════════════════════════════╗",
      "color:#777;"
    );

    console.log(
      "%c║  STARDUST // MIRROR PROTOCOL         ║",
      "color:#fff;font-weight:bold;"
    );

    console.log(
      "%c╚══════════════════════════════════════╝",
      "color:#777;"
    );

    console.log(
      "%c[MIRROR] SYSTEM INITIALIZED.",
      "color:#999;"
    );

    console.log(
      "%c[MIRROR] RECOVERED TRANSMISSION FOUND:",
      "color:#aaa;font-weight:bold;"
    );

    console.log(
      "%cSTARDUST{MIRR0R_IS_LIST3N1NG}",
      "color:#fff;font-size:18px;font-weight:bold;"
    );

    console.log(
      "%c[MIRROR] The signal was listening.",
      "color:#666;font-style:italic;"
    );


    /* =========================================
       CHECK LOGIN SESSION
    ========================================= */

    try {

      const sessionResponse = await fetch(
        "/api/session",
        {
          method: "GET",
          headers: {
            "Accept": "application/json"
          }
        }
      );

      const sessionData =
        await sessionResponse.json();

      if (
        !sessionResponse.ok ||
        !sessionData.authenticated
      ) {
        window.location.href = "/login";
        return;
      }

      console.log(
        `[STARDUST] Logged in as ${sessionData.team}`
      );

    } catch (error) {

      console.error(
        "[STARDUST] Session check failed:",
        error
      );

      if (backendStatus) {
        backendStatus.textContent =
          "BACKEND: OFFLINE";

        backendStatus.classList.add(
          "offline"
        );
      }

      return;
    }


    /* =========================================
       CHECK BACKEND HEALTH
    ========================================= */

    try {
      const response = await fetch(
        "/api/health",
        {
          method: "GET",
          headers: {
            "Accept": "application/json"
          }
        }
      );

      const data = await response.json();

      if (
        response.ok &&
        data.status === "online" &&
        backendStatus
      ) {
        backendStatus.textContent =
          "BACKEND: ONLINE";

        backendStatus.classList.remove(
          "offline"
        );

        backendStatus.classList.add(
          "online"
        );
      } else {
        throw new Error(
          `Health check failed: ${response.status}`
        );
      }
    } catch (error) {
      console.error(
        "[STARDUST] Backend connection failed:",
        error
      );

      if (backendStatus) {
        backendStatus.textContent =
          "BACKEND: OFFLINE";

        backendStatus.classList.remove(
          "online"
        );

        backendStatus.classList.add(
          "offline"
        );
      }
    }


    /* =========================================
       ANSWER SUBMISSION
    ========================================= */

    if (!form) {
      return;
    }

    form.addEventListener(
      "submit",
      async (event) => {

        event.preventDefault();

        if (!input || !answerMessage) {
          return;
        }

        const answer =
          input.value.trim();

        if (!answer) {

          answerMessage.textContent =
            "MIRROR: ENTER A TRANSMISSION.";

          answerMessage.className =
            "q-status error";

          return;
        }

        input.disabled = true;

        const submitButton =
          form.querySelector("button");

        if (submitButton) {
          submitButton.disabled = true;
        }

        answerMessage.textContent =
          "MIRROR: ANALYSING TRANSMISSION...";

        answerMessage.className =
          "q-status";


        /* =====================================
           SEND ANSWER TO FLASK
        ===================================== */

        try {

          const response = await fetch(
            "/api/questions/1/submit",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                "Accept":
                  "application/json"
              },

              body: JSON.stringify({
                answer: answer
              })
            }
          );


          const data =
            await response.json();


          /* =====================================
             NOT LOGGED IN
          ===================================== */

          if (response.status === 401) {

            window.location.href =
              "/login";

            return;
          }


          /* =====================================
             ACCESS DENIED
          ===================================== */

          if (response.status === 403) {

            answerMessage.textContent =
              data.message ||
              "MIRROR: ACCESS DENIED.";

            answerMessage.className =
              "q-status error";

            return;
          }


          /* =====================================
             CORRECT ANSWER
          ===================================== */

          if (data.correct) {
if (nextQuestionContainer) {
  nextQuestionContainer.style.display = "block";
}


            /*
             * DO NOT USE localStorage HERE.
             *
             * Flask has already saved:
             *
             * - submission
             * - solve
             * - score
             * - current_level
             */

            input.value = answer;


            /*
             * Tell the player that the next
             * level is available.
             */

            if (data.next) {

              answerMessage.textContent =
                `${data.message || "MIRROR: TRANSMISSION VERIFIED."} NEXT LEVEL UNLOCKED.`;

            }


          } else {

            /* ===================================
               WRONG ANSWER
            =================================== */

            answerMessage.textContent =
              data.message ||
              "MIRROR: TRANSMISSION REJECTED.";

            answerMessage.className =
              "q-status error";
          }


        } catch (error) {

          console.error(
            "[STARDUST] Submission failed:",
            error
          );

          answerMessage.textContent =
            "MIRROR: CONNECTION ERROR. TRY AGAIN.";

          answerMessage.className =
            "q-status error";


        } finally {

          input.disabled = false;

          if (submitButton) {
            submitButton.disabled = false;
          }

          input.focus();
        }

      }
    );


    /* =========================================
       TERMINAL CURSOR
    ========================================= */

    const blink =
      document.querySelector(".blink");

    if (blink) {

      let visible = true;

      setInterval(() => {

        visible = !visible;

        blink.style.opacity =
          visible ? "1" : "0.35";

      }, 650);
    }

  });

})();