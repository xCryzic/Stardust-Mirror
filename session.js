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