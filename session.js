(() => {
  "use strict";

  document.addEventListener(
    "DOMContentLoaded",
    async () => {

      /*
       * Find the login/account button.
       */
      const navLogin =
        document.getElementById("navLogin");

      if (!navLogin) {
        return;
      }


      try {

        const response =
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


        if (!response.ok) {
          throw new Error(
            `HTTP ${response.status}`
          );
        }


        const data =
          await response.json();


        /*
         * =====================================
         * NOT LOGGED IN
         * =====================================
         */

        if (!data.authenticated) {

          navLogin.textContent =
            "LOGIN";

          navLogin.href =
            "/login";

          navLogin.onclick = null;

          navLogin.classList.remove(
            "logged-in"
          );

          if (window.location.pathname.includes("/questions")) {
            window.location.href = "/login";
          }

          return;
        }



        /*
         * =====================================
         * LOGGED IN
         * =====================================
         */

        navLogin.textContent =
          `TEAM: ${data.team}`;

        navLogin.href =
          "#";

        navLogin.classList.add(
          "logged-in"
        );


        /*
         * Clicking the team name
         * gives the logout option.
         */

        navLogin.onclick =
          async (event) => {

            event.preventDefault();


            const confirmed =
              window.confirm(
                `LOG OUT OF ${data.team}?`
              );


            if (!confirmed) {
              return;
            }


            try {

              await fetch(
                "/api/logout",
                {
                  method: "POST",

                  headers: {
                    "Accept":
                      "application/json"
                  }
                }
              );

            } catch (error) {

              console.error(
                "[STARDUST] Logout failed:",
                error
              );

            }


            window.location.href =
              "/login";

          };

      } catch (error) {

        console.error(
          "[STARDUST] Session check failed:",
          error
        );

      }

    }
  );

})();
(function () {

    const bar = document.getElementById("scrollProgressBar");
    const value = document.getElementById("scrollProgressValue");

    if (!bar || !value) return;

    function updateScrollProgress() {

        const scrollTop = window.scrollY;

        const documentHeight =
            document.documentElement.scrollHeight - window.innerHeight;

        if (documentHeight <= 0) {
            bar.style.width = "0%";
            value.textContent = "00%";
            return;
        }

        const progress = Math.min(
            100,
            Math.max(0, (scrollTop / documentHeight) * 100)
        );

        bar.style.width = progress + "%";

        value.textContent =
            String(Math.round(progress)).padStart(2, "0") + "%";
    }

    window.addEventListener("scroll", updateScrollProgress, {
        passive: true
    });

    window.addEventListener("resize", updateScrollProgress);

    updateScrollProgress();

})();