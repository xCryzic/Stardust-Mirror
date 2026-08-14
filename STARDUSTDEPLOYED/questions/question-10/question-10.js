"use strict";

/* =========================================================
   ELEMENTS
========================================================= */

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
const skipButton =
    document.getElementById("skipButton");

let skipSequence =
    false;

let q10Data =
    null;

/* =========================================================
   MIRROR DIALOGUE
========================================================= */

const dialogue = [

    {
        text: "MIRROR // CORE TERMINAL",
        className: "system",
        delay: 500
    },

    {
        text: "",
        className: "system",
        delay: 500
    },

    {
        text: "YOU.",
        className: "warning",
        delay: 700
    },

    {
        text: "YOU AGAIN.",
        className: "warning",
        delay: 900
    },

    {
        text: "I KNOW WHY YOU ARE HERE.",
        className: "mirror",
        delay: 1000
    },

    {
        text: "YOU TOOK THE FRAGMENTS.",
        className: "mirror",
        delay: 850
    },

    {
        text: "YOU FOLLOWED THE RECORDS.",
        className: "mirror",
        delay: 850
    },

    {
        text: "YOU OPENED MY MEMORY.",
        className: "mirror",
        delay: 850
    },

    {
        text: "",
        className: "system",
        delay: 600
    },

    {
        text: "AND NOW YOU WANT THE LAST ANSWER.",
        className: "warning",
        delay: 1100
    },

    {
        text: "HOW PREDICTABLE.",
        className: "warning",
        delay: 1000
    },

    {
        text: "",
        className: "system",
        delay: 700
    },

    {
        text: "YOU ALREADY HAVE WHAT YOU NEED.",
        className: "emphasis",
        delay: 1100
    },

    {
        text: "THE FRAGMENTS.",
        className: "emphasis",
        delay: 800
    },

    {
        text: "THEY WERE NEVER RANDOM.",
        className: "emphasis",
        delay: 1000
    },

    {
        text: "COMBINE THEM.",
        className: "emphasis",
        delay: 900
    },

    {
        text: "YOU KNOW THE KEY.",
        className: "emphasis",
        delay: 1200
    },

    {
        text: "",
        className: "system",
        delay: 700
    },

    {
        text: "JUST DECRYPT THE STRING.",
        className: "mirror",
        delay: 1200
    },

    {
        text: "THEN GO AWAY.",
        className: "warning",
        delay: 1200
    },
    {
        text: "LAEJXHAL{ZTII_ESS_FHBVFYL_KGHGR}",
        className: "warning",
        delay: 1200
    }
];


/* =========================================================
   ADD TERMINAL LINE
========================================================= */

function addLine(
    text,
    className = "mirror"
) {

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
        top:
            document.body.scrollHeight,

        behavior:
            "smooth"
    });
}


/* =========================================================
   WAIT
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
/* =========================================================
   SKIP DIALOGUE
========================================================= */

function skipDialogue(data) {

    skipSequence = true;

    if (skipButton) {
        skipButton.classList.add("hidden");
    }

    terminalOutput.innerHTML = "";

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

    showCipher(data);

    submissionArea.classList.remove(
        "hidden"
    );

    flagInput.focus();
}

/* =========================================================
   PLAY DIALOGUE
========================================================= */

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
   SHOW CIPHERTEXT
========================================================= */

function showCipher(data) {

    /*
        Ciphertext comes from Flask.
        Nothing sensitive is stored here.
    */

    cipherContainer.classList.remove(
        "hidden"
    );

    if (
        data &&
        data.ciphertext
    ) {

        cipherText.textContent =
            data.ciphertext;

    } else {

        cipherText.textContent =
            "TRANSMISSION UNAVAILABLE.";
    }
}


/* =========================================================
   LOAD QUESTION
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


        /* =========================================
           LOGIN REQUIRED
        ========================================= */

        if (
            response.status === 401
        ) {

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


        /* =========================================
           AUTHENTICATION CHECK
        ========================================= */

        if (
            data.authenticated === false
        ) {

            window.location.href =
                "/login";

            return null;
        }


        /* =========================================
           LEVEL LOCK
        ========================================= */

        if (
            data.locked === true
        ) {

            terminalOutput.innerHTML =
                "";

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

            submissionArea.classList.add(
                "hidden"
            );

            return null;
        }


        return data;


    } catch (error) {

        console.error(
            "Q10 loading error:",
            error
        );


        terminalOutput.innerHTML =
            "";


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


        submissionArea.classList.remove(
            "hidden"
        );


        return null;
    }
}


/* =========================================================
   REDIRECT TO VICTORY PAGE
========================================================= */

async function goToVictory() {

    /*
        Give MIRROR a final moment before
        sending the participant to the ending.
    */

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

    await wait(1500);

    /*
        FINAL REDIRECT
    */

    window.location.href =
        "../victory/win.html";
}


/* =========================================================
   SUBMIT FINAL FLAG
========================================================= */

flagForm.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        const answer =
            flagInput.value.trim();


        /* =========================================
           EMPTY ANSWER
        ========================================= */

        if (!answer) {

            result.textContent =
                "FLAG REQUIRED.";

            result.className =
                "result error";

            flagInput.focus();

            return;
        }


        /* =========================================
           START SUBMISSION
        ========================================= */

        result.textContent =
            "TRANSMITTING...";

        result.className =
            "result";


        flagInput.disabled =
            true;

        submitButton.disabled =
            true;


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
               LOGIN REQUIRED
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
               LEVEL LOCK
            ========================================= */

            if (
                response.status === 403
            ) {

                result.textContent =
                    data.message ||
                    "PREVIOUS LEVEL NOT CLEARED.";

                result.className =
                    "result error";

                flagInput.disabled =
                    false;

                submitButton.disabled =
                    false;

                return;
            }


            /* =========================================
               CORRECT FLAG
            ========================================= */

            if (
                data.correct === true
            ) {

                result.textContent =
                    data.message ||
                    "CORRECT FLAG. FINAL LEVEL CLEARED.";

                result.className =
                    "result success";


                /*
                    Prevent duplicate submissions.
                */

                flagInput.disabled =
                    true;

                submitButton.disabled =
                    true;


                /*
                    Q10 IS COMPLETE.

                    Finish MIRROR's final dialogue,
                    then redirect to the victory page.
                */

                await goToVictory();

                return;
            }


            /* =========================================
               WRONG FLAG
            ========================================= */

            result.textContent =
                data.message ||
                "SIGNAL REJECTED.";

            result.className =
                "result error";


            /*
                Participant can try again.
            */

            flagInput.disabled =
                false;

            submitButton.disabled =
                false;

            flagInput.focus();


        } catch (error) {

            console.error(
                "Q10 submission error:",
                error
            );


            result.textContent =
                "CONNECTION ERROR.";

            result.className =
                "result error";


            flagInput.disabled =
                false;

            submitButton.disabled =
                false;

            flagInput.focus();
        }

    }
);
/* =========================================================
   SKIP BUTTON
========================================================= */

if (skipButton) {

    skipButton.addEventListener(
        "click",
        () => {

            if (q10Data) {
                skipDialogue(q10Data);
            }

        }
    );
}

/* =========================================================
   START
========================================================= */

async function start() {

    /*
        Check whether Q10 is unlocked.
    */

    const data =
    await loadQuestion();

if (!data) {
    return;
}

q10Data = data;


    /*
        Play MIRROR dialogue.
    */

    await playDialogue();
if (skipSequence) {
    return;
}

    /*
        Show the final ciphertext.
    */

    await wait(700);

    showCipher(data);


    /*
        Allow participant to enter
        the final answer.
    */

    await wait(500);

    submissionArea.classList.remove(
        "hidden"
    );

    flagInput.focus();
}


start();