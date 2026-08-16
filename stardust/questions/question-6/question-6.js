(() => {
  "use strict";

  document.addEventListener("DOMContentLoaded", async () => {

    /* =========================================================
       ELEMENTS
    ========================================================= */

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
      document.getElementById("nextQuestionContainer");

    const nextButton =
      document.getElementById("nextQuestionButton");

    const questionId = 6;


    /* =========================================================
       Q7 PATH
       IMPORTANT:
       This starts from the website root.
    ========================================================= */

    const Q7_URL =
      "/questions/question-7/question-7.html";


    /* =========================================================
       ALREADY SOLVED
    ========================================================= */

    function showAlreadyDoneState(nextId = 7) {

      if (input) {
        input.value = "ALREADY CLEARED";
        input.disabled = true;
        input.readOnly = true;
      }

      if (form) {
        const submitButton =
          form.querySelector("button");

        if (submitButton) {
          submitButton.disabled = true;
        }
      }

      if (answerMessage) {
        answerMessage.textContent =
          "MISSION STATUS: LEVEL ALREADY CLEARED.";

        answerMessage.className =
          "q-status success";
      }

      if (nextContainer) {
        nextContainer.hidden = false;
      }

      if (nextButton) {
        nextButton.href =
          Q7_URL;

        nextButton.textContent =
          "NEXT QUESTION →";
      }
    }


    /* =========================================================
       CHECK LOGIN SESSION
    ========================================================= */

    try {

      const sessionResponse =
        await fetch(
          "/api/session",
          {
            method: "GET",

            credentials:
              "same-origin",

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


    /* =========================================================
       LOAD QUESTION 6
    ========================================================= */

    let questionData = null;

    try {

      const response =
        await fetch(
          `/api/questions/${questionId}`,
          {
            method: "GET",

            credentials:
              "same-origin",

            cache:
              "no-store",

            headers: {
              "Accept":
                "application/json"
            }
          }
        );


      if (response.status === 401) {

        window.location.href =
          "/login";

        return;
      }


      if (!response.ok) {

        throw new Error(
          `HTTP ${response.status}`
        );
      }


      questionData =
        await response.json();


      /* =====================================================
         QUESTION TEXT
      ===================================================== */

      if (
        questionText &&
        questionData.question
      ) {

        questionText.textContent =
          questionData.question;
      }


      /* =====================================================
         HINT
      ===================================================== */

      if (
        hintText &&
        questionData.hint
      ) {

        hintText.textContent =
          questionData.hint;
      }


      /* =====================================================
         BACKEND STATUS
      ===================================================== */

      if (backendStatus) {

        backendStatus.textContent =
          "BACKEND: ONLINE";

        backendStatus.classList.add(
          "online"
        );
      }


      /* =====================================================
         ALREADY SOLVED
      ===================================================== */

      if (
        questionData.already_solved === true
      ) {

        showAlreadyDoneState(
          questionData.next || 7
        );

        return;
      }


    } catch (error) {

      console.error(
        "[STARDUST] Question 6 load failed:",
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


    /* =========================================================
       ANSWER FORM
    ========================================================= */

    if (!form) {
      return;
    }


    form.addEventListener(
      "submit",
      async (event) => {

        event.preventDefault();


        const answer =
          input.value.trim();


        /* =====================================================
           EMPTY ANSWER
        ===================================================== */

        if (!answer) {

          answerMessage.textContent =
            "MIRROR: ENTER A TRANSMISSION.";

          answerMessage.className =
            "q-status error";

          input.focus();

          return;
        }


        /* =====================================================
           DISABLE INPUT
        ===================================================== */

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


        /* =====================================================
           SUBMIT TO FLASK
        ===================================================== */

        try {

          const response =
            await fetch(
              `/api/questions/${questionId}/submit`,
              {
                method: "POST",

                credentials:
                  "same-origin",

                headers: {
                  "Content-Type":
                    "application/json",

                  "Accept":
                    "application/json"
                },

                body:
                  JSON.stringify({
                    answer:
                      answer
                  })
              }
            );


          const data =
            await response.json();


          /* ===================================================
             LOGIN REQUIRED
          =================================================== */

          if (
            response.status === 401 ||
            data.authenticated === false
          ) {

            window.location.href =
              "/login";

            return;
          }


          /* ===================================================
             PREVIOUS QUESTION NOT CLEARED
          =================================================== */

          if (
            response.status === 403
          ) {

            answerMessage.textContent =
              data.message ||
              "MIRROR: PREVIOUS LEVEL NOT CLEARED.";

            answerMessage.className =
              "q-status error";

            input.disabled = false;

            if (submitButton) {
              submitButton.disabled = false;
            }

            return;
          }


          /* ===================================================
             CORRECT ANSWER
          =================================================== */

          if (
            response.ok &&
            data.correct === true
          ) {

            answerMessage.innerHTML =
              `
                <strong>✓ TRANSMISSION VERIFIED</strong>
                <br>
                ${data.message || "CORRECT FLAG."}
                <br>
                <span>
                  +${data.points || 0} POINTS
                </span>
              `;

            answerMessage.className =
              "q-status success";


            /* Keep submitted answer visible */

            input.value =
              answer;

            input.disabled =
              true;


            if (submitButton) {
              submitButton.disabled =
                true;
            }


            /* =================================================
               SHOW NEXT QUESTION BUTTON
            ================================================= */

            if (nextContainer) {
              nextContainer.hidden =
                false;
            }


            if (nextButton) {

              /*
                 ABSOLUTE URL TO Q7
              */

              nextButton.href =
                Q7_URL;

              nextButton.textContent =
                "NEXT QUESTION →";


              /*
                 Extra protection:
                 explicitly navigate to Q7 when clicked.
              */

              nextButton.onclick =
                (event) => {

                  event.preventDefault();

                  window.location.assign(
                    Q7_URL
                  );
                };
            }


            console.log(
              "[STARDUST] Q6 cleared."
            );

            console.log(
              "[STARDUST] Redirect target:",
              Q7_URL
            );


            return;
          }


          /* ===================================================
             WRONG ANSWER
          =================================================== */

          answerMessage.textContent =
            data.message ||
            "MIRROR: TRANSMISSION REJECTED.";

          answerMessage.className =
            "q-status error";


          input.disabled =
            false;


          if (submitButton) {
            submitButton.disabled =
              false;
          }


          input.focus();


        } catch (error) {

          console.error(
            "[STARDUST] Submission failed:",
            error
          );


          answerMessage.textContent =
            "MIRROR: CONNECTION ERROR. TRY AGAIN.";

          answerMessage.className =
            "q-status error";


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


    /* =========================================================
       TERMINAL CURSOR
    ========================================================= */

    const blink =
      document.querySelector(".blink");


    if (blink) {

      let visible =
        true;


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