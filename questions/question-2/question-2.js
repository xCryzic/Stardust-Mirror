(() => {
  "use strict";

  document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("answerForm");
    const input = document.getElementById("answerInput");
    const message = document.getElementById("message");
    const blinkElement = document.querySelector(".blink");

    if (blinkElement) {
      let visible = true;
      window.setInterval(() => {
        visible = !visible;
        blinkElement.style.opacity = visible ? "1" : "0.35";
      }, 650);
    }

    if (!form || !input || !message) return;

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
        message.classList.add(data.correct ? "success" : "error");

        if (data.correct) {
  localStorage.setItem(
    "q2_cleared",
    "true"
  );
}
      } catch (error) {
        console.error("[ARCHIVE] Submission failed:", error);
        message.textContent = "> ARCHIVE: BACKEND CONNECTION FAILED.";
        message.classList.add("error");
      } finally {
        input.disabled = false;
        input.focus();
      }
    });
  });
})();
