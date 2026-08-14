(() => {
    "use strict";

    document.addEventListener("DOMContentLoaded", async () => {

        const form = document.getElementById("answerForm");
        const input = document.getElementById("answerInput");
        const answerMessage = document.getElementById("answerMessage");
        const backendStatus = document.getElementById("backendStatus");
        const nextContainer = document.getElementById("nextQuestionContainer");
        const nextButton = document.getElementById("nextQuestionButton");
        const systemMessage = document.getElementById("systemMessage");

        const questionId = 8;

        const audioPath =
            "/questions/question-8/station-02.wav";


        /* =====================================================
           HELPERS
        ===================================================== */

        function setBackendStatus(status) {

            if (!backendStatus) {
                return;
            }

            backendStatus.classList.remove(
                "online",
                "offline"
            );

            if (status === "online") {

                backendStatus.textContent =
                    "BACKEND: ONLINE";

                backendStatus.classList.add(
                    "online"
                );

            } else {

                backendStatus.textContent =
                    "BACKEND: OFFLINE";

                backendStatus.classList.add(
                    "offline"
                );
            }
        }


        function showNextQuestion(next = 9) {

            if (nextContainer) {
                nextContainer.hidden = false;
            }

            if (nextButton) {

                nextButton.href =
                    `/questions/question-${next}/`;

                nextButton.textContent =
                    `NEXT QUESTION ${next} →`;
            }
        }


        /* =====================================================
           SESSION CHECK
        ===================================================== */

        try {

            const response = await fetch(
                "/api/session",
                {
                    method: "GET",
                    credentials: "same-origin",
                    headers: {
                        "Accept": "application/json"
                    }
                }
            );


            const data = await response.json();


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

            setBackendStatus("offline");

            if (systemMessage) {

                systemMessage.textContent =
                    "TRANSMISSION SYSTEM UNAVAILABLE.";
            }

            return;
        }


        /* =====================================================
           LOAD QUESTION 8
        ===================================================== */

        try {

            const response = await fetch(
                `/api/questions/${questionId}`,
                {
                    method: "GET",
                    credentials: "same-origin",
                    headers: {
                        "Accept": "application/json"
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


            const data =
                await response.json();


            /* =================================================
               QUESTION LOCKED
            ================================================= */

            if (data.locked) {

                setBackendStatus("online");

                if (answerMessage) {

                    answerMessage.textContent =
                        data.message ||
                        "MIRROR: PREVIOUS LEVEL NOT CLEARED.";

                    answerMessage.className =
                        "answer-message error";
                }


                if (form) {

                    const submitButton =
                        form.querySelector("button");

                    if (input) {
                        input.disabled = true;
                    }

                    if (submitButton) {
                        submitButton.disabled = true;
                    }
                }


                if (systemMessage) {

                    systemMessage.textContent =
                        "TRANSMISSION LOCKED // PREVIOUS LEVEL REQUIRED.";
                }

                return;
            }


            /* =================================================
               BACKEND ONLINE
            ================================================= */

            setBackendStatus("online");


            /* =================================================
               ALREADY SOLVED
            ================================================= */

            if (data.already_solved) {

                if (input) {

                    input.value =
                        "ALREADY CLEARED";

                    input.disabled = true;
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
                        "answer-message success";
                }


                if (systemMessage) {

                    systemMessage.textContent =
                        "STATION 02 // TRANSMISSION ALREADY RECOVERED.";
                }


                showNextQuestion(
                    data.next || 9
                );


                return;
            }


            /* =================================================
               NORMAL Q8 STATE
            ================================================= */

            if (systemMessage) {

                systemMessage.textContent =
                    "STATION 02 // TRANSMISSION READY.";
            }


            /*
             * The WAV file is deliberately not fetched during
             * page load. The download happens only when the
             * user clicks the recovery/download button.
             *
             * This avoids trying to interpret the WAV as text
             * or accidentally replacing its binary contents.
             */


            const audioDownload =
                document.getElementById(
                    "downloadStation02"
                );


            if (audioDownload) {

                audioDownload.href =
                    audioPath;

                audioDownload.setAttribute(
                    "download",
                    "station-02.wav"
                );

                audioDownload.addEventListener(
                    "click",
                    () => {

                        console.log(
                            "[STARDUST] Downloading station-02.wav"
                        );
                    }
                );
            }


        } catch (error) {

            console.error(
                "[STARDUST] Question 8 load failed:",
                error
            );

            setBackendStatus("offline");

            if (systemMessage) {

                systemMessage.textContent =
                    "TRANSMISSION SYSTEM UNAVAILABLE.";
            }

            return;
        }


        /* =====================================================
           SUBMIT ANSWER
        ===================================================== */

        if (!form) {
            return;
        }


        form.addEventListener(
            "submit",
            async (event) => {

                event.preventDefault();


                if (!input) {
                    return;
                }


                const answer =
                    input.value.trim();


                /* =================================================
                   EMPTY ANSWER
                ================================================= */

                if (!answer) {

                    if (answerMessage) {

                        answerMessage.textContent =
                            "MIRROR: ENTER A TRANSMISSION.";

                        answerMessage.className =
                            "answer-message error";
                    }

                    input.focus();

                    return;
                }


                const submitButton =
                    form.querySelector("button");


                input.disabled = true;


                if (submitButton) {
                    submitButton.disabled = true;
                }


                if (answerMessage) {

                    answerMessage.textContent =
                        "MIRROR: ANALYSING TRANSMISSION...";

                    answerMessage.className =
                        "answer-message";
                }


                /* =================================================
                   SEND ANSWER TO FLASK
                ================================================= */

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
                                        answer: answer
                                    })
                            }
                        );


                    const data =
                        await response.json();


                    /* =================================================
                       LOGIN EXPIRED
                    ================================================= */

                    if (
                        response.status === 401 ||
                        data.authenticated === false
                    ) {

                        window.location.href =
                            "/login";

                        return;
                    }


                    /* =================================================
                       PREVIOUS LEVEL NOT CLEARED
                    ================================================= */

                    if (
                        response.status === 403
                    ) {

                        if (answerMessage) {

                            answerMessage.textContent =
                                data.message ||
                                "MIRROR: PREVIOUS LEVEL NOT CLEARED.";

                            answerMessage.className =
                                "answer-message error";
                        }


                        input.disabled = false;

                        if (submitButton) {
                            submitButton.disabled = false;
                        }

                        return;
                    }


                    /* =================================================
                       CORRECT ANSWER
                    ================================================= */

                    if (
                        response.ok &&
                        data.correct === true
                    ) {

                        if (answerMessage) {

                            answerMessage.innerHTML =
                                `
                                <strong>✓ TRANSMISSION VERIFIED</strong>
                                <br>
                                ${data.message ||
                                    "CORRECT TRANSMISSION."}
                                <br>
                                <span>
                                    +${data.points || 0} POINTS
                                </span>
                                `;

                            answerMessage.className =
                                "answer-message success";
                        }


                        input.value =
                            answer;

                        input.disabled = true;


                        if (submitButton) {
                            submitButton.disabled = true;
                        }


                        if (systemMessage) {

                            systemMessage.textContent =
                                "STATION 02 // TRANSMISSION RECOVERED.";
                        }


                        /* =================================================
                           UNLOCK Q9
                        ================================================= */

                        showNextQuestion(
                            data.next || 9
                        );


                        return;
                    }


                    /* =================================================
                       WRONG ANSWER
                    ================================================= */

                    if (answerMessage) {

                        answerMessage.textContent =
                            data.message ||
                            "MIRROR: TRANSMISSION REJECTED.";

                        answerMessage.className =
                            "answer-message error";
                    }


                    input.disabled = false;


                    if (submitButton) {
                        submitButton.disabled = false;
                    }


                    input.focus();


                } catch (error) {

                    console.error(
                        "[STARDUST] Submission failed:",
                        error
                    );


                    if (answerMessage) {

                        answerMessage.textContent =
                            "MIRROR: CONNECTION ERROR. TRY AGAIN.";

                        answerMessage.className =
                            "answer-message error";
                    }


                    input.disabled = false;


                    if (submitButton) {
                        submitButton.disabled = false;
                    }


                    input.focus();
                }

            }
        );

    });

})();