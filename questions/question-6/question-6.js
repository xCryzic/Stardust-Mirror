(() => {
  "use strict";

  document.addEventListener("DOMContentLoaded", async () => {

    const backendStatus =
      document.getElementById("backendStatus");

    const form =
      document.getElementById("answerForm");

    const input =
      document.getElementById("answerInput");

    const answerMessage =
      document.getElementById("answerMessage");

    const nextContainer =
      document.getElementById("nextContainer");


    /* =========================================
       SESSION CHECK
    ========================================= */

    try {

      const response = await fetch(
        "/api/session",
        {
          method: "GET",

          headers: {
            "Accept": "application/json"
          }
        }
      );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.authenticated
      ) {

        window.location.href =
          "/login";

        return;
      }

      console.log(
        `[STARDUST] Logged in as ${data.team}`
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
       BACKEND STATUS
    ========================================= */

    if (backendStatus) {

      backendStatus.textContent =
        "BACKEND: ONLINE";

      backendStatus.classList.add(
        "online"
      );
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


        if (nextContainer) {
          nextContainer.innerHTML = "";
        }


        /* =====================================
           SEND TO FLASK
        ===================================== */

        try {

          const response =
            await fetch(
              "/api/questions/6/submit",
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


          /* ================================
             LOGIN EXPIRED
          ================================= */

          if (response.status === 401) {

            window.location.href =
              "/login";

            return;
          }


          /* ================================
             LEVEL LOCKED
          ================================= */

          if (response.status === 403) {

            answerMessage.textContent =
              data.message ||
              "MIRROR: ACCESS DENIED.";

            answerMessage.className =
              "q-status error";

            return;
          }


          /* ================================
             CORRECT
          ================================= */

          if (data.correct) {

            answerMessage.textContent =
              data.message ||
              "MIRROR: TRANSMISSION VERIFIED.";

            answerMessage.className =
              "q-status success";


            input.value = answer;


            /* ============================
               NEXT QUESTION
            ============================ */

            if (
              data.next &&
              nextContainer
            ) {

              const nextButton =
                document.createElement("a");

              nextButton.className =
                "next-question-button";

              nextButton.href =
                `/questions/question-${data.next}`;

              nextButton.textContent =
                `ACCESS QUESTION ${String(
                  data.next
                ).padStart(2, "0")}`;

              nextContainer.appendChild(
                nextButton
              );
            }


          } else {

            /* ============================
               WRONG FLAG
            ============================ */

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