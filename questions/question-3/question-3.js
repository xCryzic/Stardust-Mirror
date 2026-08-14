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
      document.getElementById("message") ||
      document.getElementById("answerMessage");

    const nextContainer =
      document.getElementById("nextQuestionContainer");

    const nextButton =
      document.getElementById("nextQuestionButton");

    const questionId = 3;


    /* =========================================
       ALREADY SOLVED STATE
    ========================================= */

    const showAlreadyDoneState = (nextId) => {

      if (!input || !answerMessage || !form) {
        return;
      }

      input.value = "ALREADY CLEARED";
      input.disabled = true;
      input.setAttribute("readonly", "readonly");


      const submitButton =
        form.querySelector("button");


      if (submitButton) {
        submitButton.disabled = true;
      }


      answerMessage.textContent =
        "MISSION STATUS: LEVEL ALREADY CLEARED.";

      answerMessage.className =
        "q-status success";


      const nextHref =
        nextId
          ? `/questions/question-${nextId}/`
          : "/leaderboard";


      if (nextContainer) {
        nextContainer.hidden = false;
        nextContainer.style.display = "block";
      }


      if (nextButton) {
        nextButton.href = nextHref;

        nextButton.textContent =
          nextId
            ? `PROCEED TO QUESTION ${nextId} →`
            : "VIEW LEADERBOARD →";
      }

    };


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
          `/api/questions/${questionId}`,
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


      if (data.already_solved) {

        showAlreadyDoneState(
          data.next
        );

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


        /* Disable while checking */

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

          const response =
            await fetch(
              `/api/questions/${questionId}/submit`,
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
             LOGIN EXPIRED
          ===================================== */

          if (
            response.status === 401
          ) {

            window.location.href =
              "/login";

            return;

          }


          /* =====================================
             PREVIOUS QUESTION NOT SOLVED
          ===================================== */

          if (
            response.status === 403
          ) {

            answerMessage.textContent =
              data.message ||
              "MIRROR: PREVIOUS LEVEL NOT CLEARED.";

            answerMessage.className =
              "q-status error";

            return;

          }


          /* =====================================
             CORRECT ANSWER
          ===================================== */

          if (
            response.ok &&
            data.correct
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


            /* Keep answer visible */

            input.value =
              answer;


            input.disabled = true;


            if (submitButton) {
              submitButton.disabled = true;
            }


            /* =====================================
               NEXT QUESTION
            ===================================== */

            if (nextContainer) {

              nextContainer.hidden = false;
              nextContainer.style.display = "block";

            }


            const nextHref =
              data.next
                ? `/questions/question-${data.next}/`
                : "/leaderboard";


            if (nextButton) {

              nextButton.href =
                nextHref;


              nextButton.textContent =
                data.next
                  ? `PROCEED TO QUESTION ${data.next} →`
                  : "VIEW LEADERBOARD →";

            }


            return;

          }


          /* =====================================
             WRONG ANSWER
          ===================================== */

          answerMessage.textContent =
            data.message ||
            "MIRROR: TRANSMISSION REJECTED.";

          answerMessage.className =
            "q-status error";


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

          if (
            !answerMessage.classList.contains(
              "success"
            )
          ) {

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


      setInterval(
        () => {

          visible = !visible;


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