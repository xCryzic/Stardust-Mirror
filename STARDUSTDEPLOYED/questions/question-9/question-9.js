(() => {

    "use strict";


    const answerForm =
        document.getElementById(
            "answerForm"
        );

    const answerInput =
        document.getElementById(
            "answerInput"
        );

    const answerMessage =
        document.getElementById(
            "answerMessage"
        );

    const nextContainer =
        document.getElementById(
            "nextContainer"
        );

    const backendStatus =
        document.getElementById(
            "backendStatus"
        );


    /* =====================================================
       SESSION CHECK
    ===================================================== */

    async function checkSession() {

        try {

            const response =
                await fetch(
                    "/api/session",
                    {
                        credentials:
                            "same-origin"
                    }
                );


            const data =
                await response.json();


            if (!data.authenticated) {

                window.location.href =
                    "/login";

                return false;

            }


            backendStatus.textContent =
                "ONLINE";

            backendStatus.className =
                "online";

            return true;


        } catch (error) {

            console.error(
                "Session check failed:",
                error
            );


            backendStatus.textContent =
                "OFFLINE";

            backendStatus.className =
                "offline";

            return false;

        }

    }


    /* =====================================================
       SUBMIT FLAG
    ===================================================== */

    answerForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            const value =
                answerInput.value.trim();


            if (!value) {

                answerMessage.textContent =
                    "FLAG REQUIRED.";

                answerMessage.className =
                    "answer-message error";

                return;

            }


            const submitButton =
                answerForm.querySelector(
                    "button"
                );


            submitButton.disabled =
                true;

            answerInput.disabled =
                true;


            answerMessage.textContent =
                "CHECKING FLAG...";

            answerMessage.className =
                "answer-message";


            try {

                const response =
                    await fetch(
                        "/api/questions/9/submit",
                        {
                            method: "POST",

                            credentials:
                                "same-origin",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({
                                    answer: value
                                })
                        }
                    );


                const data =
                    await response.json();


                /* =============================
                   SESSION EXPIRED
                ============================= */

                if (
                    response.status === 401
                ) {

                    window.location.href =
                        "/login";

                    return;

                }


                /* =============================
                   CORRECT
                ============================= */

                if (data.correct) {

                    answerMessage.textContent =
                        "CORRECT. LEVEL 09 CLEARED.";

                    answerMessage.className =
                        "answer-message success";


                    nextContainer.style.display =
                        "block";


                    return;

                }


                /* =============================
                   WRONG
                ============================= */

                answerMessage.textContent =
                    data.message ||
                    "SIGNAL REJECTED.";

                answerMessage.className =
                    "answer-message error";


                submitButton.disabled =
                    false;

                answerInput.disabled =
                    false;

                answerInput.focus();


            } catch (error) {

                console.error(
                    "Submission error:",
                    error
                );


                answerMessage.textContent =
                    "CONNECTION ERROR.";

                answerMessage.className =
                    "answer-message error";


                submitButton.disabled =
                    false;

                answerInput.disabled =
                    false;

            }

        }
    );


    /* =====================================================
       START
    ===================================================== */

    checkSession();

})();