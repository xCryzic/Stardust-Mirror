"use strict";

document.addEventListener("DOMContentLoaded", () => {

    const recordsContainer =
        document.getElementById("records");

    const noteElement =
        document.getElementById("note");

    const statusElement =
        document.getElementById("status");

    const analyseButton =
        document.getElementById("analyseButton");

    const delayOutput =
        document.getElementById("delayOutput");

    const messageElement =
        document.getElementById("message");

    const answerInput =
        document.getElementById("answerInput");

    const answerForm =
        document.getElementById("answerForm");

    const answerSubmit =
        document.getElementById("answerSubmit");

    const answerStatus =
        document.getElementById("answerStatus");

    const backendStatus =
        document.getElementById("backendStatus");

    const systemMessage =
        document.getElementById("systemMessage");


    /* ============================================================
       LOAD Q7
       
       Q7 is controlled by Flask.
       The previous question must be solved before this page
       becomes usable.
    ============================================================ */

    async function loadQuestionAccess() {

        try {

            const response = await fetch(
                "/api/questions/7",
                {
                    method: "GET",
                    credentials: "same-origin",
                    cache: "no-store",
                    headers: {
                        "Accept": "application/json"
                    }
                }
            );

            if (response.status === 401) {

                window.location.href = "/login";
                return false;

            }

            if (!response.ok) {

                throw new Error(
                    `Question API returned ${response.status}`
                );

            }

            const data = await response.json();


            /* ====================================================
               PREVIOUS LEVEL NOT CLEARED
            ==================================================== */

            if (data.locked) {

                statusElement.textContent =
                    "ACCESS DENIED";

                systemMessage.textContent =
                    data.message ||
                    "PREVIOUS LEVEL NOT CLEARED.";

                noteElement.textContent =
                    "STATION 01 REMAINS INACCESSIBLE.";

                recordsContainer.textContent =
                    "ACCESS TO THIS RECORD HAS NOT BEEN GRANTED.";

                analyseButton.disabled = true;

                answerInput.disabled = true;

                answerSubmit.disabled = true;

                return false;
            }


            /* ====================================================
               Q7 UNLOCKED
            ==================================================== */

            statusElement.textContent =
                "RECORD RECOVERED";

            systemMessage.textContent =
                "STATION 01 ONLINE // RECORD AVAILABLE";


            /*
                The station data is public only after Q7
                itself has been unlocked by Flask.
            */

            loadStation();


            /*
                IMPORTANT:
                The answer terminal is available immediately.

                Downloading the analysis file is OPTIONAL.
            */

            answerInput.disabled = false;
            answerSubmit.disabled = false;

            messageElement.textContent =
                "MESSAGE RECOVERY READY";


            return true;


        } catch (error) {

            console.error(
                "[STARDUST] Q7 access check failed:",
                error
            );

            statusElement.textContent =
                "RECOVERY FAILED";

            systemMessage.textContent =
                "UNABLE TO CONTACT MIRROR CORE.";

            recordsContainer.textContent =
                "QUESTION ACCESS COULD NOT BE VERIFIED.";

            analyseButton.disabled = true;

            answerInput.disabled = true;

            answerSubmit.disabled = true;

            return false;
        }
    }


    /* ============================================================
       LOAD STATION RECORD
    ============================================================ */

    async function loadStation() {

        try {

            const response = await fetch(
                "/questions/question-7/station-1/",
                {
                    method: "GET",
                    cache: "no-store",
                    headers: {
                        "Accept": "application/json"
                    }
                }
            );


            if (!response.ok) {

                throw new Error(
                    `Station returned ${response.status}`
                );

            }


            const data = await response.json();


            renderRecords(
                data.records
            );


            noteElement.textContent =
                data.recovered_note || "";


            /*
                Download is available as soon as Q7
                is unlocked.
            */

            analyseButton.disabled = false;


        } catch (error) {

            console.error(
                "[STARDUST] Station recovery failed:",
                error
            );

            statusElement.textContent =
                "RECOVERY FAILED";

            systemMessage.textContent =
                "STATION 01 OFFLINE";

            recordsContainer.textContent =
                "UNABLE TO RECOVER STATION RECORD.";

            /*
                Do NOT disable the answer terminal here.
                The player should still be able to submit
                an answer at any time after Q7 is unlocked.
            */

            answerInput.disabled = false;
            answerSubmit.disabled = false;
        }
    }


    /* ============================================================
       DISPLAY RECORDS
    ============================================================ */

    function renderRecords(records) {

        recordsContainer.innerHTML = "";


        if (!Array.isArray(records)) {

            recordsContainer.textContent =
                "NO RECORDS FOUND.";

            return;
        }


        records.forEach((record) => {

            const row =
                document.createElement("div");

            row.className =
                "record-line";


            const time =
                document.createElement("span");

            time.className =
                "record-time";

            time.textContent =
                record.time || "--:--:---";


            const status =
                document.createElement("span");

            status.className =
                "record-status";

            status.textContent =
                record.status || "UNKNOWN";


            const fragment =
                document.createElement("span");

            fragment.className =
                "record-fragment";

            fragment.textContent =
                record.fragment || "";


            row.appendChild(time);
            row.appendChild(status);
            row.appendChild(fragment);

            recordsContainer.appendChild(row);

        });
    }


    /* ============================================================
       DOWNLOAD ANALYSIS FILE
       
       OPTIONAL.
       
       The player does NOT need to download this before
       submitting the flag.
    ============================================================ */

    analyseButton.addEventListener(
        "click",
        () => {

            const fileUrl =
                "/questions/question-7/analyze-delay.txt";


            const link =
                document.createElement("a");


            link.href =
                fileUrl;

            link.download =
                "analyze-delay.txt";


            document.body.appendChild(link);

            link.click();

            document.body.removeChild(link);


            /* -----------------------------------------------
               DOWNLOAD STATUS
            ------------------------------------------------ */

            delayOutput.innerHTML = `
                <div class="delay-row">
                    <span>FILE</span>
                    <span>analyze-delay.txt</span>
                </div>

                <div class="delay-row">
                    <span>STATUS</span>
                    <span>DOWNLOAD COMPLETE</span>
                </div>
            `;


            analyseButton.textContent =
                "ANALYSIS DOWNLOADED";

            messageElement.textContent =
                "MESSAGE RECOVERY READY";

            systemMessage.textContent =
                "ANALYSIS FILE RECOVERED // MESSAGE CHANNEL OPEN";


            answerInput.disabled = false;
            answerSubmit.disabled = false;

        }
    );


    /* ============================================================
       SUBMIT FLAG
       
       The backend is the ONLY authority for the answer.
    ============================================================ */

    answerForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            const answer =
                answerInput.value.trim();


            if (!answer) {

                answerStatus.textContent =
                    "FLAG REQUIRED.";

                answerStatus.className =
                    "answer-message error";

                answerInput.focus();

                return;
            }


            answerSubmit.disabled = true;


            answerStatus.textContent =
                "TRANSMITTING...";

            answerStatus.className =
                "answer-message";


            try {

                const response = await fetch(
                    "/api/questions/7/submit",
                    {
                        method: "POST",

                        credentials: "same-origin",

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


                const result =
                    await response.json();


                /* =================================================
                   LOGIN REQUIRED
                ================================================= */

                if (response.status === 401) {

                    window.location.href =
                        "/login";

                    return;
                }


                /* =================================================
                   LEVEL LOCK
                ================================================= */

                if (response.status === 403) {

                    answerStatus.textContent =
                        result.message ||
                        "PREVIOUS LEVEL NOT CLEARED.";

                    answerStatus.className =
                        "answer-message error";

                    answerSubmit.disabled = false;

                    return;
                }


                /* =================================================
                   CORRECT
                ================================================= */

                if (result.correct) {

                    answerStatus.textContent =
                        result.message ||
                        "CORRECT FLAG. LEVEL CLEARED.";

                    answerStatus.className =
                        "answer-message success";


                    answerInput.value =
                        answer;

                    answerInput.disabled =
                        true;

                    answerSubmit.disabled =
                        true;


                    systemMessage.textContent =
                        "STATION 01 RECOVERED // LEVEL CLEARED";


                    /* ---------------------------------------------
                       NEXT QUESTION
                    --------------------------------------------- */

                    if (result.next) {

                        const nextButton =
                            document.createElement("a");


                        nextButton.href =
                            `/questions/question-${result.next}/`;


                        nextButton.className =
                            "next-question-button";


                        nextButton.textContent =
                            `CONTINUE TO QUESTION ${result.next} →`;


                        /*
                            Prevent duplicate next buttons if the
                            frontend receives the event more than once.
                        */

                        if (
                            !answerStatus.parentElement
                                .querySelector(".next-question-button")
                        ) {

                            answerStatus
                                .parentElement
                                .appendChild(
                                    nextButton
                                );
                        }


                    } else {

                        const leaderboardButton =
                            document.createElement("a");


                        leaderboardButton.href =
                            "/leaderboard";


                        leaderboardButton.className =
                            "next-question-button";


                        leaderboardButton.textContent =
                            "VIEW LEADERBOARD →";


                        if (
                            !answerStatus.parentElement
                                .querySelector(".next-question-button")
                        ) {

                            answerStatus
                                .parentElement
                                .appendChild(
                                    leaderboardButton
                                );
                        }
                    }


                    return;
                }


                /* =================================================
                   WRONG FLAG
                ================================================= */

                answerStatus.textContent =
                    result.message ||
                    "SIGNAL REJECTED.";

                answerStatus.className =
                    "answer-message error";

                answerSubmit.disabled =
                    false;


            } catch (error) {

                console.error(
                    "[STARDUST] Submission error:",
                    error
                );


                answerStatus.textContent =
                    "CONNECTION ERROR.";

                answerStatus.className =
                    "answer-message error";


                answerSubmit.disabled =
                    false;
            }

        }
    );


    /* ============================================================
       BACKEND STATUS
    ============================================================ */

    async function checkBackend() {

        try {

            const response =
                await fetch(
                    "/api/health",
                    {
                        method: "GET",
                        cache: "no-store",
                        headers: {
                            "Accept":
                                "application/json"
                        }
                    }
                );


            if (!response.ok) {

                throw new Error(
                    `Backend returned ${response.status}`
                );

            }


            backendStatus.textContent =
                "ONLINE";

            backendStatus.className =
                "online";


        } catch (error) {

            console.error(
                "[STARDUST] Backend check failed:",
                error
            );


            backendStatus.textContent =
                "OFFLINE";

            backendStatus.className =
                "offline";
        }
    }


    /* ============================================================
       START
    ============================================================ */

    checkBackend();

    loadQuestionAccess();

});
/* ============================================================
   DOWNLOAD ANALYSIS FILE
============================================================ */

analyseButton.addEventListener(
    "click",
    () => {

        const fileUrl =
            "/questions/question-7/analyze-delay.txt";

        /*
         * Let Flask handle the download.
         * Do NOT create a fake <a> element.
         */

        window.location.href = fileUrl;


        /*
         * Update the UI after triggering the download.
         */

        delayOutput.innerHTML = `
            <div class="delay-row">
                <span>FILE</span>
                <span>analyze-delay.txt</span>
            </div>

            <div class="delay-row">
                <span>STATUS</span>
                <span>DOWNLOAD REQUESTED</span>
            </div>
        `;

        analyseButton.textContent =
            "DOWNLOAD ANALYSIS";

        messageElement.textContent =
            "ANALYSIS FILE REQUESTED";

        systemMessage.textContent =
            "STATION 01 // ANALYSIS FILE REQUESTED";

        /*
         * Answer submission remains available.
         */

        answerInput.disabled = false;
        answerSubmit.disabled = false;
    }
);