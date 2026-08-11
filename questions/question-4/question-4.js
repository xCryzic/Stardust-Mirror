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

const nextButton =
  document.getElementById("nextButton");


/* =========================================
   CHECK LOGIN
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
    window.location.href = "/login";
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
   LOAD QUESTION
========================================= */

try {

  const response = await fetch(
    "/api/questions/4",
    {
      method: "GET",
      headers: {
        "Accept": "application/json"
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
    "[STARDUST] Question loading failed:",
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
   SUBMIT FLAG
========================================= */

if (!form) {
  return;
}

form.addEventListener(
  "submit",
  async (event) => {

    event.preventDefault();

    if (
      !input ||
      !answerMessage
    ) {
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


    try {

      const response =
        await fetch(
          "/api/questions/4/submit",
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
         LOGIN EXPIRED
      ===================================== */

      if (response.status === 401) {

        window.location.href =
          "/login";

        return;
      }


      /* =====================================
         PREVIOUS QUESTION NOT SOLVED
      ===================================== */

      if (response.status === 403) {

        answerMessage.textContent =
          data.message ||
          "MIRROR: PREVIOUS LEVEL NOT CLEARED.";

        answerMessage.className =
          "q-status error";

        return;
      }


      /* =====================================
         CORRECT FLAG
      ===================================== */

      if (response.ok && data.correct) {

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


        /*
         * Keep the submitted flag visible.
         */

        input.value =
          answer;


        /*
         * Prevent accidental resubmission.
         */

        input.disabled = true;

        if (submitButton) {
          submitButton.disabled = true;
        }


        /* =====================================
           NEXT QUESTION BUTTON
        ===================================== */

        if (
          nextButton &&
          data.next
        ) {

          nextButton.style.display =
            "inline-block";

          nextButton.textContent =
            `NEXT QUESTION →`;

          nextButton.onclick =
            () => {

              window.location.href =
                `/questions/question-${data.next}`;

            };
        }


        /*
         * If this is the final question,
         * show a completion message instead.
         */

        else if (nextButton) {

          nextButton.style.display =
            "inline-block";

          nextButton.textContent =
            "MISSION COMPLETE";

          nextButton.onclick =
            () => {

              window.location.href =
                "/leaderboard";

            };
        }


        return;
      }


      /* =====================================
         WRONG FLAG
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

      /*
       * Only re-enable the form if the
       * answer was NOT correct.
       */

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
