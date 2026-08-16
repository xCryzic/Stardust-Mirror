(() => {

    "use strict";


    /* =========================================================
       ELEMENTS
    ========================================================= */

    const skipButton =
        document.getElementById("skipButton");

    const terminalOutput =
        document.getElementById("terminalOutput");

    const cipherContainer =
        document.getElementById("cipherContainer");

    const cipherText =
        document.getElementById("cipherText");

    const submissionArea =
        document.getElementById("submissionArea");

    const flagForm =
        document.getElementById("flagForm");

    const flagInput =
        document.getElementById("flagInput");

    const submitButton =
        document.getElementById("submitButton");

    const result =
        document.getElementById("result");

    const winContainer =
        document.getElementById("winContainer");

    const winButton =
        document.getElementById("winButton");


    /* =========================================================
       FALLBACK TRANSMISSION
    ========================================================= */

    const TRANSMISSION =
        "LAEJXHAL{ZTII_ESS_FHBVFYL_KGHGR}";


    /* =========================================================
       STATE
    ========================================================= */

    let q10Data = null;
    let skipSequence = false;


    /* =========================================================
       HELPERS
    ========================================================= */

    function wait(ms) {

        return new Promise(
            resolve => {
                setTimeout(
                    resolve,
                    ms
                );
            }
        );

    }


    function addLine(
        text,
        className = "mirror"
    ) {

        if (!terminalOutput) {
            return;
        }

        const line =
            document.createElement("div");

        line.className =
            `line ${className}`;

        line.textContent =
            text;

        terminalOutput.appendChild(
            line
        );

        window.scrollTo({
            top: document.body.scrollHeight,
            behavior: "smooth"
        });

    }


    function setResult(
        message,
        type = ""
    ) {

        if (!result) {
            return;
        }

        result.textContent =
            message;

        result.className =
            "result";

        if (type) {
            result.classList.add(
                type
            );
        }

    }


    /* =========================================================
       SHOW WIN BUTTON
    ========================================================= */

    function showWinButton() {

        if (!winContainer) {
            return;
        }

        winContainer.classList.remove(
            "hidden"
        );

        if (winButton) {

            winButton.href =
                "/victory/win.html";

        }

    }


    function hideWinButton() {

        if (!winContainer) {
            return;
        }

        winContainer.classList.add(
            "hidden"
        );

    }


    /* =========================================================
       SHOW CIPHERTEXT
    ========================================================= */

    function showCipher(data) {

        if (!cipherContainer) {
            return;
        }

        cipherContainer.classList.remove(
            "hidden"
        );


        const ciphertext =
            data &&
            data.ciphertext
                ? data.ciphertext
                : TRANSMISSION;


        if (cipherText) {

            cipherText.textContent =
                ciphertext;

        }

    }


    /* =========================================================
       LOAD Q10
    ========================================================= */

    async function loadQuestion() {

        try {

            const response =
                await fetch(
                    "/api/questions/10",
                    {
                        method: "GET",

                        credentials:
                            "same-origin",

                        cache:
                            "no-store",

                        headers: {
                            "Accept":
                                "application/json"
                        }
                    }
                );


            if (response.status === 401) {

                window.location.href =
                    "/login";

                return null;

            }


            if (!response.ok) {

                throw new Error(
                    `HTTP ${response.status}`
                );

            }


            const data =
                await response.json();


            if (
                data.authenticated === false
            ) {

                window.location.href =
                    "/login";

                return null;

            }


            if (
                data.locked === true
            ) {

                if (submissionArea) {
                    submissionArea.classList.add(
                        "hidden"
                    );
                }

                if (skipButton) {
                    skipButton.classList.add(
                        "hidden"
                    );
                }

                addLine(
                    "MIRROR // ACCESS DENIED",
                    "warning"
                );

                addLine(
                    "",
                    "system"
                );

                addLine(
                    data.message ||
                    "PREVIOUS LEVEL NOT CLEARED.",
                    "warning"
                );

                return null;

            }


            q10Data =
                data;


            return data;

        } catch (error) {

            console.error(
                "Q10 loading error:",
                error
            );

            addLine(
                "MIRROR // CONNECTION FAILURE",
                "warning"
            );

            addLine(
                "",
                "system"
            );

            addLine(
                "THE CORE REFUSES TO RESPOND.",
                "warning"
            );

            return null;

        }

    }


    /* =========================================================
       DIALOGUE
    ========================================================= */

    const dialogue = [

        {
            text:
                "MIRROR // CORE TERMINAL",
            className:
                "system",
            delay:
                500
        },

        {
            text:
                "",
            className:
                "system",
            delay:
                500
        },

        {
            text:
                "YOU ALREADY HAVE WHAT YOU NEED.",
            className:
                "emphasis",
            delay:
                1000
        },

        {
            text:
                "THE FRAGMENTS.",
            className:
                "emphasis",
            delay:
                900
        },

        {
            text:
                "THEY WERE NEVER RANDOM.",
            className:
                "emphasis",
            delay:
                1000
        },

        {
            text:
                "COMBINE THEM.",
            className:
                "emphasis",
            delay:
                900
        },

        {
            text:
                "YOU KNOW THE KEY.",
            className:
                "emphasis",
            delay:
                1200
        },

        {
            text:
                "",
            className:
                "system",
            delay:
                600
        },

        {
            text:
                "JUST DECRYPT THE STRING.",
            className:
                "mirror",
            delay:
                1200
        },

        {
            text:
                "THEN GO AWAY.",
            className:
                "warning",
            delay:
                1200
        }

    ];


    async function playDialogue() {

        for (
            const line
            of dialogue
        ) {

            if (skipSequence) {
                return;
            }

            await wait(
                line.delay
            );


            if (skipSequence) {
                return;
            }


            addLine(
                line.text,
                line.className
            );

        }

    }


    /* =========================================================
       SKIP
    ========================================================= */

    function skipDialogue() {

        skipSequence =
            true;


        if (skipButton) {

            skipButton.classList.add(
                "hidden"
            );

        }


        if (terminalOutput) {

            terminalOutput.innerHTML =
                "";

        }


        addLine(
            "MIRROR // CORE TERMINAL",
            "system"
        );

        addLine(
            "",
            "system"
        );

        addLine(
            "MIRROR: YOU ALREADY HAVE WHAT YOU NEED.",
            "emphasis"
        );

        addLine(
            "MIRROR: THE FRAGMENTS.",
            "emphasis"
        );

        addLine(
            "MIRROR: THEY WERE NEVER RANDOM.",
            "emphasis"
        );

        addLine(
            "MIRROR: COMBINE THEM.",
            "emphasis"
        );

        addLine(
            "MIRROR: JUST DECRYPT THE STRING.",
            "mirror"
        );

        addLine(
            "MIRROR: THEN GO AWAY.",
            "warning"
        );


        showCipher(
            q10Data
        );


        if (flagInput) {
            flagInput.focus();
        }

    }


    if (skipButton) {

        skipButton.addEventListener(
            "click",
            skipDialogue
        );

    }


    /* =========================================================
       VICTORY SEQUENCE
    ========================================================= */

    async function goToVictory() {

        await wait(700);

        addLine(
            "",
            "system"
        );

        addLine(
            "MIRROR: ...",
            "warning"
        );

        await wait(1000);

        addLine(
            "MIRROR: FINE.",
            "warning"
        );

        await wait(1000);

        addLine(
            "MIRROR: YOU FOUND IT.",
            "emphasis"
        );

        await wait(1200);

        addLine(
            "",
            "system"
        );

        addLine(
            "MIRROR: THE PROTOCOL IS COMPLETE.",
            "emphasis"
        );

        await wait(1200);

        addLine(
            "MIRROR: GO.",
            "warning"
        );

    }


    /* =========================================================
       SUBMIT
    ========================================================= */

    if (flagForm) {

        flagForm.addEventListener(
            "submit",
            async event => {

                event.preventDefault();


                const answer =
                    flagInput
                        ? flagInput.value.trim()
                        : "";


                if (!answer) {

                    setResult(
                        "FLAG REQUIRED.",
                        "error"
                    );

                    if (flagInput) {
                        flagInput.focus();
                    }

                    return;

                }


                if (submitButton) {
                    submitButton.disabled = true;
                }

                if (flagInput) {
                    flagInput.disabled = true;
                }


                setResult(
                    "TRANSMITTING..."
                );


                try {

                    const response =
                        await fetch(
                            "/api/questions/10/submit",
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
                                        answer:
                                            answer
                                    })
                            }
                        );


                    const data =
                        await response.json();


                    /* =========================================
                       LOGIN
                    ========================================= */

                    if (
                        response.status === 401 ||
                        data.authenticated === false
                    ) {

                        window.location.href =
                            "/login";

                        return;

                    }


                    /* =========================================
                       LOCKED
                    ========================================= */

                    if (
                        response.status === 403 ||
                        data.locked === true
                    ) {

                        setResult(
                            data.message ||
                            "PREVIOUS LEVEL NOT CLEARED.",
                            "error"
                        );

                        if (flagInput) {
                            flagInput.disabled = false;
                        }

                        if (submitButton) {
                            submitButton.disabled = false;
                        }

                        return;

                    }


                    /* =========================================
                       ALREADY SOLVED
                    ========================================= */

                    if (
                        data.already_solved === true
                    ) {

                        setResult(
                            "QUESTION ALREADY CLEARED.",
                            "success"
                        );

                        showWinButton();

                        return;

                    }


                    /* =========================================
                       CORRECT
                    ========================================= */

                    if (
                        data.correct === true
                    ) {

                        setResult(
                            data.message ||
                            "CORRECT. MIRROR PROTOCOL COMPLETE.",
                            "success"
                        );

                        showWinButton();

                        /*
                         * Keep the player on Q10.
                         * They can click the win button whenever
                         * they are ready.
                         */

                        return;

                    }


                    /* =========================================
                       WRONG
                    ========================================= */

                    setResult(
                        data.message ||
                        "SIGNAL REJECTED.",
                        "error"
                    );


                    if (flagInput) {
                        flagInput.disabled = false;
                        flagInput.focus();
                    }

                    if (submitButton) {
                        submitButton.disabled = false;
                    }

                } catch (error) {

                    console.error(
                        "Q10 submission error:",
                        error
                    );

                    setResult(
                        "CONNECTION ERROR.",
                        "error"
                    );


                    if (flagInput) {
                        flagInput.disabled = false;
                        flagInput.focus();
                    }

                    if (submitButton) {
                        submitButton.disabled = false;
                    }

                }

            }
        );

    }


    /* =========================================================
       START
    ========================================================= */

    async function start() {

        hideWinButton();

        const data =
            await loadQuestion();


        if (!data) {
            return;
        }


        /*
         * Team already completed Q10.
         * Show the win button immediately.
         */

        if (
            data.already_solved === true
        ) {

            if (skipButton) {
                skipButton.classList.add(
                    "hidden"
                );
            }

            addLine(
                "MIRROR // CORE TERMINAL",
                "system"
            );

            addLine(
                "",
                "system"
            );

            addLine(
                "FINAL CONNECTION ALREADY CLEARED.",
                "emphasis"
            );

            showCipher(
                data
            );

            setResult(
                "QUESTION ALREADY CLEARED.",
                "success"
            );

            if (flagInput) {
                flagInput.disabled = true;
            }

            if (submitButton) {
                submitButton.disabled = true;
            }

            showWinButton();

            return;

        }


        /* Normal Q10 sequence */

        await playDialogue();


        if (skipSequence) {
            return;
        }


        showCipher(
            data
        );


        if (skipButton) {
            skipButton.classList.add(
                "hidden"
            );
        }


        if (flagInput) {
            flagInput.focus();
        }

    }


    start();

})();