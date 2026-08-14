/* =========================================================
   STARDUST // MIRROR PROTOCOL
   QUESTION 7
   THE FIRST STATION
========================================================= */

const QUESTION_ID = 7;
const NEXT_QUESTION_URL = "/questions/question-8/question-8.html";


/* =========================================================
   ELEMENTS
========================================================= */

const statusEl = document.getElementById("status");
const noteEl = document.getElementById("note");

const recordsEl = document.getElementById("records");
const messageEl = document.getElementById("message");

const analyseButton = document.getElementById("analyseButton");
const delayOutput = document.getElementById("delayOutput");

const backendStatus = document.getElementById("backendStatus");

const answerForm = document.getElementById("answerForm");
const answerInput = document.getElementById("answerInput");
const answerSubmit = document.getElementById("answerSubmit");
const answerStatus = document.getElementById("answerStatus");

const systemMessage = document.getElementById("systemMessage");

const nextQuestionContainer =
    document.getElementById("nextQuestionContainer");

const nextQuestionButton =
    document.getElementById("nextQuestionButton");


/* =========================================================
   STATE
========================================================= */

let questionLoaded = false;
let backendOnline = false;


/* =========================================================
   HELPERS
========================================================= */

function setBackendStatus(online) {

    backendOnline = online;

    if (!backendStatus) return;

    backendStatus.classList.remove("online", "offline");

    if (online) {
        backendStatus.textContent = "BACKEND ONLINE";
        backendStatus.classList.add("online");
    } else {
        backendStatus.textContent = "BACKEND OFFLINE";
        backendStatus.classList.add("offline");
    }
}


function showNextQuestion() {

    if (!nextQuestionContainer) return;

    nextQuestionButton.href = NEXT_QUESTION_URL;

    nextQuestionContainer.hidden = false;

    /*
       Scroll naturally to the button.
       No position manipulation.
    */
    setTimeout(() => {
        nextQuestionContainer.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
    }, 150);
}


function hideNextQuestion() {

    if (!nextQuestionContainer) return;

    nextQuestionContainer.hidden = true;
}


function setAnswerMessage(text, type = "") {

    if (!answerStatus) return;

    answerStatus.textContent = text;

    answerStatus.classList.remove(
        "success",
        "error"
    );

    if (type) {
        answerStatus.classList.add(type);
    }
}


function setSystemMessage(text) {

    if (!systemMessage) return;

    systemMessage.textContent = text;
}


/* =========================================================
   LOAD QUESTION
========================================================= */

async function loadQuestion() {

    try {

        setBackendStatus(false);

        const response = await fetch(
            `/api/questions/${QUESTION_ID}`,
            {
                method: "GET",
                credentials: "include",
                cache: "no-store"
            }
        );

        if (!response.ok) {
            throw new Error(
                `HTTP ${response.status}`
            );
        }

        const data = await response.json();

        setBackendStatus(true);

        questionLoaded = true;

        /*
           The backend may return the station data.
           Only populate fields that actually exist.
        */

        if (data.status && statusEl) {
            statusEl.textContent = data.status;
        }

        if (data.note && noteEl) {
            noteEl.textContent = data.note;
        }

        if (Array.isArray(data.records)) {
            renderRecords(data.records);
        }

        if (data.message && messageEl) {
            messageEl.textContent = data.message;
        }

        /*
           If your backend reports that Q7 is already solved,
           show Q8 immediately.
        */

        if (
            data.solved === true ||
            data.completed === true ||
            data.already_solved === true
        ) {
            markSolved();
        }

        enableAnswerTerminal();

        if (analyseButton) {
            analyseButton.disabled = false;
        }

        setSystemMessage(
            "STATION ACCESS GRANTED // RECOVERY CHANNEL ACTIVE"
        );

    } catch (error) {

        console.error(
            "Q7 load error:",
            error
        );

        setBackendStatus(false);

        if (statusEl) {
            statusEl.textContent =
                "TRANSMISSION UNAVAILABLE";
        }

        if (noteEl) {
            noteEl.textContent =
                "Unable to establish recovery channel.";
        }

        setSystemMessage(
            "BACKEND CONNECTION FAILED"
        );

        disableAnswerTerminal();
    }
}


/* =========================================================
   RECORD RENDERING
========================================================= */

function renderRecords(records) {

    if (!recordsEl) return;

    recordsEl.innerHTML = "";

    records.forEach((record) => {

        const row =
            document.createElement("div");

        row.className = "record-line";


        const time =
            document.createElement("div");

        time.className = "record-time";

        time.textContent =
            record.time ||
            record.timestamp ||
            "";


        const recordStatus =
            document.createElement("div");

        recordStatus.className =
            "record-status";

        recordStatus.textContent =
            record.status ||
            "RECOVERED";


        const fragment =
            document.createElement("div");

        fragment.className =
            "record-fragment";

        fragment.textContent =
            record.fragment ||
            record.message ||
            "";


        row.appendChild(time);
        row.appendChild(recordStatus);
        row.appendChild(fragment);

        recordsEl.appendChild(row);
    });
}


/* =========================================================
   ANSWER TERMINAL
========================================================= */

function enableAnswerTerminal() {

    if (!answerInput || !answerSubmit) return;

    answerInput.disabled = false;
    answerSubmit.disabled = false;
}


function disableAnswerTerminal() {

    if (!answerInput || !answerSubmit) return;

    answerInput.disabled = true;
    answerSubmit.disabled = true;
}


/* =========================================================
   MARK Q7 SOLVED
========================================================= */

function markSolved() {

    setAnswerMessage(
        "TRANSMISSION ACCEPTED // QUESTION 07 SOLVED",
        "success"
    );

    setSystemMessage(
        "QUESTION 07 COMPLETE // NEXT TRANSMISSION AVAILABLE"
    );

    if (answerInput) {
        answerInput.disabled = true;
    }

    if (answerSubmit) {
        answerSubmit.disabled = true;
    }

    showNextQuestion();
}


/* =========================================================
   SUBMIT ANSWER
========================================================= */

if (answerForm) {

    answerForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();

            if (!questionLoaded) {
                setAnswerMessage(
                    "QUESTION DATA NOT READY",
                    "error"
                );

                return;
            }

            const answer =
                answerInput.value.trim();

            if (!answer) {

                setAnswerMessage(
                    "ENTER A FLAG",
                    "error"
                );

                answerInput.focus();

                return;
            }


            answerSubmit.disabled = true;

            setAnswerMessage(
                "TRANSMITTING...",
                ""
            );


            try {

                const response = await fetch(
                    `/api/questions/${QUESTION_ID}/submit`,
                    {
                        method: "POST",

                        credentials: "include",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            answer: answer,
                            flag: answer
                        })
                    }
                );


                let data = {};

                try {
                    data = await response.json();
                } catch {
                    data = {};
                }


                if (!response.ok) {

                    throw new Error(
                        data.error ||
                        data.message ||
                        `HTTP ${response.status}`
                    );
                }


                /*
                   Accept the common success formats
                   used by the Flask backend.
                */

                if (
                    data.success === true ||
                    data.correct === true ||
                    data.solved === true ||
                    data.status === "correct"
                ) {

                    markSolved();

                    return;
                }


                /*
                   Backend responded successfully but
                   indicates an incorrect answer.
                */

                setAnswerMessage(
                    data.error ||
                    data.message ||
                    "INCORRECT TRANSMISSION",
                    "error"
                );

                setSystemMessage(
                    "RECOVERY FAILED // RETRY TRANSMISSION"
                );

                answerSubmit.disabled = false;

            } catch (error) {

                console.error(
                    "Q7 submit error:",
                    error
                );

                setAnswerMessage(
                    error.message ||
                    "TRANSMISSION FAILED",
                    "error"
                );

                setSystemMessage(
                    "TRANSMISSION ERROR"
                );

                answerSubmit.disabled = false;
            }

        }
    );
}


/* =========================================================
   ANALYSIS BUTTON
========================================================= */

if (analyseButton) {

    analyseButton.addEventListener(
        "click",
        async function() {

            analyseButton.disabled = true;

            analyseButton.textContent =
                "LOADING ANALYSIS...";

            try {

                /*
                   This uses the existing Q7 analysis
                   endpoint. If your Flask endpoint has
                   a different path, change ONLY this URL.
                */

                const response = await fetch(
                    "/questions/question-7/analyze-delay.txt",
                    {
                        credentials: "include",
                        cache: "no-store"
                    }
                );

                if (!response.ok) {
                    throw new Error(
                        `HTTP ${response.status}`
                    );
                }

                const text =
                    await response.text();

                renderAnalysis(text);

                analyseButton.textContent =
                    "ANALYSIS RECOVERED";

            } catch (error) {

                console.error(
                    "Analysis error:",
                    error
                );

                /*
                   Don't destroy the rest of Q7
                   if the optional analysis download
                   fails.
                */

                if (delayOutput) {
                    delayOutput.textContent =
                        "ANALYSIS FILE UNAVAILABLE";
                }

                analyseButton.textContent =
                    "RETRY ANALYSIS";

                analyseButton.disabled = false;
            }
        }
    );
}


/* =========================================================
   ANALYSIS DISPLAY
========================================================= */

function renderAnalysis(text) {

    if (!delayOutput) return;

    delayOutput.innerHTML = "";

    const lines =
        text
            .split(/\r?\n/)
            .map(line => line.trim())
            .filter(Boolean);


    lines.forEach((line) => {

        const row =
            document.createElement("div");

        row.className = "delay-row";

        const content =
            document.createElement("span");

        content.textContent = line;

        row.appendChild(content);

        delayOutput.appendChild(row);
    });
}


/* =========================================================
   INITIALISE
========================================================= */

hideNextQuestion();

loadQuestion();