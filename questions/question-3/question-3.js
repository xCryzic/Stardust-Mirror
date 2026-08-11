(() => {
  "use strict";

  document.addEventListener("DOMContentLoaded", async () => {

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

    const nextContainer =
      document.getElementById(
        "nextQuestionContainer"
      );

    const nextButton =
      document.getElementById(
        "nextQuestionButton"
      );


    /* =========================================
       CHECK LOGIN SESSION
    ========================================= */

    try {

      const sessionResponse =
        await fetch(
          "/api/session",
          {
            method: "GET",

            headers: {
              "Accept":
                "application/json"
            }
          }
        );


      const sessionData =
        await sessionResponse.json();


      if (
        !sessionResponse.ok ||
        !sessionData.authenticated
      ) {

        window.location.href =
          "/login";

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
       LOAD QUESTION
    ========================================= */

    try {

      const response =
        await fetch(
          "/api/questions/3",
          {
            method: "GET",

            headers: {
              "Accept":
                "application/json"
            }
          }
        );


      if (!response.ok) {

        throw new Error(
          `HTTP ${response.status}`
        );

      }


      const data =
        await response.json();


      if (
        questionText &&
        data.question
      ) {

        questionText.textContent =
          data.question;

      }


      if (
        hintText &&
        data.hint
      ) {

        hintText.textContent =
          data.hint;

      }


      if (backendStatus) {

        backendStatus.textContent =
          "BACKEND: ONLINE";

        backendStatus.classList.add(
          "online"
        );

      }


    } catch (error) {

      console.error(
        "[STARDUST] Question load failed:",
        error
      );


      if (backendStatus) {

        backendStatus.textContent =
          "BACKEND: OFFLINE";

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

          submitButton.disabled =
            true;

        }


        answerMessage.textContent =
          "MIRROR: ANALYSING TRANSMISSION...";

        answerMessage.className =
          "q-status";


        /* =====================================
           SEND ANSWER TO FLASK
        ===================================== */

        try {

          const response =
            await fetch(
              "/api/questions/3/submit",
              {
                method: "POST",

                headers: {
                  "Content-Type":
                    "application/json",

                  "Accept":
                    "application/json"
                },

                body:
                  JSON.stringify({
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

            answerMessage.textContent =
              data.message ||
              "MIRROR: TRANSMISSION VERIFIED.";

            answerMessage.className =
              "q-status success";


            input.value =
              answer;


            /* =================================
               SHOW NEXT BUTTON
            ================================= */

            if (nextContainer) {

              nextContainer.hidden =
                false;

            }


            if (nextButton) {

              if (data.next) {

                nextButton.href =
                  `/questions/question-${data.next}`;

                nextButton.textContent =
                  `PROCEED TO QUESTION ${data.next} →`;

              } else {

                nextButton.href =
                  "/leaderboard";

                nextButton.textContent =
                  "VIEW LEADERBOARD →";

              }

            }


          } else {

            /* =================================
               WRONG ANSWER
            ================================= */

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

          input.disabled =
            false;


          if (submitButton) {

            submitButton.disabled =
              false;

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


      setInterval(
        () => {

          visible =
            !visible;

          blink.style.opacity =
            visible
              ? "1"
              : "0.35";

        },
        650
      );

    }

  });

})();