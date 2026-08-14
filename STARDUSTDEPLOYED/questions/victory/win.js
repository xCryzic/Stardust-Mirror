"use strict";


const story =
    document.getElementById("story");

const continueSection =
    document.getElementById("continue");


/* =========================================================
   STORY
========================================================= */

const lines = [

    {
        text: "CONNECTION TERMINATED.",
        className: "system",
        delay: 1200
    },

    {
        text: "",
        className: "system",
        delay: 900
    },

    {
        text: "STARDUST // FINAL MISSION REPORT",
        className: "title",
        delay: 1500
    },

    {
        text: "",
        className: "system",
        delay: 900
    },

    {
        text:
            "1971.",
        className: "year",
        delay: 1200
    },

    {
        text:
            "Five people were sent into the dark.",
        className: "story-line",
        delay: 1800
    },

    {
        text:
            "They were told they were going to study an unexplained signal.",
        className: "story-line",
        delay: 2200
    },

    {
        text:
            "They were told the mission would last months.",
        className: "story-line",
        delay: 1800
    },

    {
        text:
            "They were told they would come home.",
        className: "story-line",
        delay: 2200
    },

    {
        text: "",
        className: "system",
        delay: 1000
    },

    {
        text:
            "They never did.",
        className: "emotional",
        delay: 2500
    },

    {
        text: "",
        className: "system",
        delay: 1200
    },

    {
        text:
            "Something happened beyond the edge of their mission.",
        className: "story-line",
        delay: 2200
    },

    {
        text:
            "Something they could not explain.",
        className: "story-line",
        delay: 1800
    },

    {
        text:
            "Something that changed the way they understood themselves.",
        className: "story-line",
        delay: 2300
    },

    {
        text: "",
        className: "system",
        delay: 1000
    },

    {
        text:
            "So they left fragments.",
        className: "emotional",
        delay: 1800
    },

    {
        text:
            "Records.",
        className: "fragment",
        delay: 900
    },

    {
        text:
            "Coordinates.",
        className: "fragment",
        delay: 900
    },

    {
        text:
            "Messages.",
        className: "fragment",
        delay: 900
    },

    {
        text:
            "Warnings.",
        className: "fragment",
        delay: 900
    },

    {
        text:
            "Memories.",
        className: "fragment",
        delay: 1200
    },

    {
        text: "",
        className: "system",
        delay: 1000
    },

    {
        text:
            "And somewhere inside all of it...",
        className: "story-line",
        delay: 1800
    },

    {
        text:
            "MIRROR was waiting.",
        className: "mirror",
        delay: 2500
    },

    {
        text: "",
        className: "system",
        delay: 1000
    },

    {
        text:
            "It was never simply a machine.",
        className: "story-line",
        delay: 2000
    },

    {
        text:
            "It remembered them.",
        className: "story-line",
        delay: 1500
    },

    {
        text:
            "It remembered their voices.",
        className: "story-line",
        delay: 1500
    },

    {
        text:
            "Their fear.",
        className: "story-line",
        delay: 1200
    },

    {
        text:
            "Their hope.",
        className: "story-line",
        delay: 1200
    },

    {
        text:
            "And the moment they disappeared.",
        className: "emotional",
        delay: 2200
    },

    {
        text: "",
        className: "system",
        delay: 1000
    },

    {
        text:
            "For years, MIRROR waited for someone to understand.",
        className: "story-line",
        delay: 2400
    },

    {
        text:
            "Someone to find the fragments.",
        className: "story-line",
        delay: 1800
    },

    {
        text:
            "Someone to follow the trail.",
        className: "story-line",
        delay: 1800
    },

    {
        text:
            "Someone to finish the mission.",
        className: "emotional",
        delay: 2200
    },

    {
        text: "",
        className: "system",
        delay: 1200
    },

    {
        text:
            "That someone was you.",
        className: "final",
        delay: 3000
    },

    {
        text: "",
        className: "system",
        delay: 1200
    },

    {
        text:
            "You recovered the fragments.",
        className: "success",
        delay: 1600
    },

    {
        text:
            "You decoded the records.",
        className: "success",
        delay: 1600
    },

    {
        text:
            "You found the truth buried inside the noise.",
        className: "success",
        delay: 2200
    },

    {
        text:
            "And when MIRROR finally asked you for the last answer...",
        className: "story-line",
        delay: 2200
    },

    {
        text:
            "you gave it one.",
        className: "final",
        delay: 2600
    },

    {
        text: "",
        className: "system",
        delay: 1200
    },

    {
        text:
            "For the first time in 55 years...",
        className: "story-line",
        delay: 2000
    },

    {
        text:
            "the signal went silent.",
        className: "emotional",
        delay: 2800
    },

    {
        text: "",
        className: "system",
        delay: 1200
    },

    {
        text:
            "Not because it was destroyed.",
        className: "story-line",
        delay: 1800
    },

    {
        text:
            "Not because it failed.",
        className: "story-line",
        delay: 1800
    },

    {
        text:
            "But because there was finally nothing left to say.",
        className: "emotional",
        delay: 2800
    },

    {
        text: "",
        className: "system",
        delay: 1200
    },

    {
        text:
            "The crew was not forgotten.",
        className: "final",
        delay: 2200
    },

    {
        text:
            "Their story was not lost.",
        className: "final",
        delay: 2200
    },

    {
        text:
            "And MIRROR finally got to rest.",
        className: "final",
        delay: 2800
    },

    {
        text: "",
        className: "system",
        delay: 1200
    },

    {
        text:
            "MISSION COMPLETE.",
        className: "complete",
        delay: 3000
    }

];


/* =========================================================
   TYPE STORY
========================================================= */

function wait(ms) {

    return new Promise(
        resolve => setTimeout(resolve, ms)
    );

}


async function playStory() {

    for (const line of lines) {

        await wait(line.delay);

        const element =
            document.createElement("div");

        element.className =
            `story-line-render ${line.className}`;

        element.textContent =
            line.text;

        story.appendChild(element);

        window.scrollTo({
            top:
                document.body.scrollHeight,
            behavior:
                "smooth"
        });

    }


    await wait(1800);

    continueSection.classList.remove(
        "hidden"
    );

}


playStory();