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

    const questionId = 1;

    const showAlreadyDoneState = (nextId) => {
      if (!input || !answerMessage || !form) {
        return;
      }

      input.value = "ALREADY CLEARED";
      input.disabled = true;
      input.readOnly = true;

      const submitButton = form.querySelector("button");
      if (submitButton) {
        submitButton.disabled = true;
      }

      answerMessage.textContent = "MISSION STATUS: LEVEL ALREADY CLEARED.";
      answerMessage.className = "q-status success";

      const nextHref = nextId ? `/questions/question-${nextId}/` : "/questions/question-2/";

      if (nextQuestionContainer) {
        nextQuestionContainer.style.display = "block";
      }

      if (nextQuestionButton) {
        nextQuestionButton.href = nextHref;
        nextQuestionButton.textContent = "NEXT QUESTION →";
      }
    };



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


    try {
      const questionResponse = await fetch(
        `/api/questions/${questionId}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (questionResponse.ok) {
        const questionData = await questionResponse.json();
        if (questionData.already_solved) {
          showAlreadyDoneState(questionData.next);
        }
      }

    } catch (error) {
      console.error("[STARDUST] Question status check failed:", error);
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

            input.value = answer;
            input.disabled = true;

            const submitButton = form.querySelector("button");
            if (submitButton) {
              submitButton.disabled = true;
            }

            const nextHref = data.next
              ? `/questions/question-${data.next}/`
              : "/leaderboard";

            answerMessage.textContent =
              data.message
                ? `Correct Answer. ${data.message}`
                : "Correct Answer.";
            answerMessage.className = "q-status success";

            if (nextQuestionButton) {
              nextQuestionButton.href = nextHref;
              nextQuestionButton.textContent =
                data.next ? "NEXT QUESTION →" : "VIEW LEADERBOARD →";
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
          if (!answerMessage.classList.contains("success")) {
            input.disabled = false;

            if (submitButton) {
              submitButton.disabled = false;
            }

            input.focus();
          }
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