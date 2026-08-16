(() => {
  "use strict";

  document.addEventListener("DOMContentLoaded", async () => {
    const form = document.getElementById("answerForm");
    const input = document.getElementById("answerInput");
    const message = document.getElementById("message");
    const nextQuestionContainer = document.getElementById("nextQuestionContainer");
    const nextQuestionButton = document.getElementById("nextQuestionButton");
    const blinkElement = document.querySelector(".blink");
    const questionId = 2;

    const showAlreadyDoneState = (nextId) => {
      if (!input || !message || !form) return;

      input.value = "ALREADY CLEARED";
      input.disabled = true;
      input.setAttribute("readonly", "readonly");

      const submitButton = form.querySelector("button");
      if (submitButton) {
        submitButton.disabled = true;
      }

      message.textContent = "> MISSION STATUS: LEVEL ALREADY CLEARED.";
      message.className = "message success";

      const nextHref = nextId ? `/questions/question-${nextId}/` : "/questions/question-3/";

      if (nextQuestionContainer) {
        nextQuestionContainer.style.display = "block";
      }

      if (nextQuestionButton) {
        nextQuestionButton.href = nextHref;
        nextQuestionButton.textContent = "NEXT QUESTION →";
      }
    };

    if (blinkElement) {
      let visible = true;
      window.setInterval(() => {
        visible = !visible;
        blinkElement.style.opacity = visible ? "1" : "0.35";
      }, 650);
    }

    /* Check login session */
    try {
      const sessionResponse = await fetch("/api/session", {
        method: "GET",
        headers: { Accept: "application/json" }
      });
      const sessionData = await sessionResponse.json();
      if (!sessionResponse.ok || !sessionData.authenticated) {
        window.location.href = "/login";
        return;
      }
    } catch (error) {
      console.error("[STARDUST] Session check failed:", error);
    }

    if (!form || !input || !message) return;

    /* Check question status */
    try {
      const response = await fetch(`/api/questions/${questionId}`, {
        method: "GET",
        headers: { Accept: "application/json" },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.already_solved) {
          showAlreadyDoneState(data.next);
        } else if (data.locked) {
          message.textContent = "> ARCHIVE: PREVIOUS LEVEL NOT CLEARED.";
          message.className = "message error";
          input.disabled = true;
          const submitButton = form.querySelector("button");
          if (submitButton) submitButton.disabled = true;
        }
      }
    } catch (error) {
      console.error("[ARCHIVE] Question status check failed:", error);
    }

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const answer = input.value.trim();
      if (!answer) return;

      input.disabled = true;
      message.className = "message";
      message.textContent = "> ARCHIVE: VERIFYING RECOVERED TRANSMISSION...";

      try {
        const response = await fetch("/api/questions/2/submit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ answer }),
        });

        const data = await response.json();

        message.textContent = `> ${data.message}`;
        message.className = data.correct ? "message success" : "message error";

        if (data.correct) {
          input.disabled = true;
          const submitButton = form.querySelector("button");
          if (submitButton) {
            submitButton.disabled = true;
          }

          if (nextQuestionContainer) {
            nextQuestionContainer.style.display = "block";
          }

          const nextHref = data.next
            ? `/questions/question-${data.next}/`
            : "/leaderboard";

          if (nextQuestionButton) {
            nextQuestionButton.href = nextHref;
            nextQuestionButton.textContent = data.next ? "NEXT QUESTION →" : "VIEW LEADERBOARD →";
          }
        }
      } catch (error) {
        console.error("[ARCHIVE] Submission failed:", error);
        message.textContent = "> ARCHIVE: BACKEND CONNECTION FAILED.";
        message.className = "message error";
      } finally {
        if (!message.classList.contains("success")) {
          input.disabled = false;
          input.focus();
        }
      }
    });
  });
})();
