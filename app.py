from pathlib import Path
import os
import sqlite3
from datetime import datetime, timezone

from flask import (
    Flask,
    abort,
    jsonify,
    request,
    send_file,
    send_from_directory,
    session,
)

from werkzeug.security import (
    check_password_hash,
    generate_password_hash,
)


# ============================================================
# STARDUST // MIRROR PROTOCOL
# Flask Backend
# ============================================================

BASE_DIR = Path(__file__).resolve().parent
DATABASE = BASE_DIR / "stardust.db"

app = Flask(__name__, static_folder=None)
@app.route("/favicon.ico")
def favicon():
    return send_from_directory(
        BASE_DIR,
        "favicon.ico",
        mimetype="image/vnd.microsoft.icon"
    )
app.secret_key = os.getenv(
    "SECRET_KEY",
    "stardust-dev-secret-key",
)

app.config.update(
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE="Lax",
    SESSION_COOKIE_SECURE=False,
)


# ============================================================
# ENVIRONMENT
# ============================================================

def load_env_file(path: Path):
    """Load KEY=VALUE pairs from a .env file."""

    if not path.is_file():
        return

    try:
        lines = path.read_text(
            encoding="utf-8"
        ).splitlines()
    except OSError:
        return

    for raw_line in lines:
        line = raw_line.strip()

        if not line or line.startswith("#"):
            continue

        if "=" not in line:
            continue

        key, value = line.split("=", 1)

        key = key.strip()
        value = value.strip()

        if (
            len(value) >= 2
            and value[0] == value[-1]
            and value[0] in ('"', "'")
        ):
            value = value[1:-1]

        if key:
            os.environ.setdefault(key, value)


# Load all question environments.
for question_number in range(1, 11):
    load_env_file(
        BASE_DIR
        / "questions"
        / f"question-{question_number}"
        / ".env"
    )


# ============================================================
# DATABASE
# ============================================================

def get_db():
    db = sqlite3.connect(DATABASE)
    db.row_factory = sqlite3.Row
    db.execute("PRAGMA foreign_keys = ON")
    return db


def utc_now():
    return datetime.now(timezone.utc).isoformat()


def init_db():
    db = get_db()

    db.executescript(
        """
        CREATE TABLE IF NOT EXISTS teams (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            team_name TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            score INTEGER NOT NULL DEFAULT 0,
            current_level INTEGER NOT NULL DEFAULT 1,
            created_at TEXT NOT NULL,
            last_login TEXT
        );

        CREATE TABLE IF NOT EXISTS solves (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            team_id INTEGER NOT NULL,
            question_id INTEGER NOT NULL,
            points INTEGER NOT NULL,
            solved_at TEXT NOT NULL,

            UNIQUE(team_id, question_id),

            FOREIGN KEY(team_id)
                REFERENCES teams(id)
                ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS submissions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            team_id INTEGER NOT NULL,
            question_id INTEGER NOT NULL,
            submitted_flag TEXT NOT NULL,
            correct INTEGER NOT NULL DEFAULT 0,
            submitted_at TEXT NOT NULL,

            FOREIGN KEY(team_id)
                REFERENCES teams(id)
                ON DELETE CASCADE
        );
        """
    )

    db.commit()
    db.close()


# ============================================================
# PREDEFINED TEAMS
# ============================================================

INITIAL_TEAMS = {
    "TEST1": "test123",
    "TEST2": "test456",

    "TEAM ALPHA": "St@rDust!71",
    "TEAM BRAVO": "C0sm1c#2027",
    "TEAM CHARLIE": "M1rr0r@1971",
    "TEAM DELTA": "D33pSp@ce!",
    "TEAM ECHO": "V0id#S1gn@1",
    "TEAM FOXTROT": "0rb1t@171",
    "TEAM GOLF": "Tr@c3Th3St@r$",
    "TEAM HOTEL": "L0stM1ss10n!",
    "TEAM INDIA": "C0sm0s@1971",
    "TEAM JULIETT": "D@rkM@tter#",
    "TEAM KILO": "St@rL1ght!",
    "TEAM LIMA": "F1n@lTr@c3",
    "TEAM MIKE": "L@stS1gn@1",
    "TEAM NOVEMBER": "Tr@nsm1ss10n#71",
    "TEAM ORION": "Ex0pl@n3t!27",

}


def seed_teams():
    db = get_db()

    for team_name, password in INITIAL_TEAMS.items():

        existing = db.execute(
            """
            SELECT id
            FROM teams
            WHERE team_name = ?
            """,
            (team_name,),
        ).fetchone()

        if existing is None:
            db.execute(
                """
                INSERT INTO teams (
                    team_name,
                    password_hash,
                    created_at
                )
                VALUES (?, ?, ?)
                """,
                (
                    team_name,
                    generate_password_hash(password),
                    utc_now(),
                ),
            )

    db.commit()
    db.close()


# ============================================================
# FLAGS
# ============================================================

FLAGS = {
    1: os.getenv("QUESTION_1_FLAG", "").strip(),
    2: os.getenv("QUESTION_2_FLAG", "").strip(),
    3: os.getenv("QUESTION_3_FLAG", "").strip(),
    4: os.getenv("QUESTION_4_FLAG", "").strip(),
    5: os.getenv("QUESTION_5_FLAG", "").strip(),
    6: os.getenv("QUESTION_6_FLAG", "").strip(),
    7: os.getenv("QUESTION_7_FLAG", "").strip(),
    8: os.getenv("QUESTION_8_FLAG", "").strip(),
    9: os.getenv("QUESTION_9_FLAG", "").strip(),
    10: os.getenv("QUESTION_10_FLAG", "").strip(),
}


# ============================================================
# QUESTIONS
# ============================================================

QUESTIONS = {

    1: {
        "id": 1,
        "title": "MIRROR // SIGNAL RECOVERY",
        "question": (
            "What phrase is hidden in "
            "the recovered transmission?"
        ),
        "hint": "The mirror is listening.",
    },

    2: {
        "id": 2,
        "title": "ECHOES OF THE ARCHIVE",
        "question": (
            "The archive appears intact, but "
            "some information survived outside "
            "the visible record. Find the fragments "
            "and reconstruct what was left behind."
        ),
        "hint": "Inspect the recovered record carefully.",
    },

    3: {
        "id": 3,
        "title": "THE LAST LOG",
        "question": (
            "Recover the crew's final conversation "
            "and uncover the message hidden within it."
        ),
        "hint": (
            "The crew's words are not as broken "
            "as they appear."
        ),
    },

    4: {
        "id": 4,
        "title": "GHOST IN THE BUFFER",
        "question": (
            "The recovered log contains a message "
            "hidden in plain sight. Follow what it tells you."
        ),
        "hint": (
            "The beginning of each record may know "
            "more than the record itself."
        ),
    },

    5: {
        "id": 5,
        "title": "MIRROR SPEAKS",
        "question": (
            "A recovered live transcript has been reconstructed. "
            "MIRROR's own words are encrypted. "
            "Recover the original transmission."
        ),
        "hint": "A crewmate might be the key.",
    },

    6: {
        "id": 6,
        "title": "THE LAST COORDINATES",
        "question": (
            "The final navigation record points to a "
            "destination. Recover the flag left behind there."
        ),
        "hint": (
            "Branches, forks, and no rivers. "
            "Where do investigators leave their work?"
        ),
    },

    7: {
        "id": 7,
        "title": "THE FIRST STATION",
        "question": (
            "The unknown signal was received by a "
            "private ground station. Its recovered "
            "transmission has been corrupted in a "
            "deliberate pattern. Recover the real "
            "message hidden inside Station 1's record."
        ),
        "hint": (
            "The corruption repeats. "
            "Look for what survived between the noise."
        ),
    },

    8: {
        "id": 8,
        "title": "MIRROR CORE",
        "question": (
            "MIRROR CORE ACCESS ESTABLISHED. "
            "The final surviving system record has been recovered. "
            "Determine what MIRROR is asking you to do."
        ),
        "hint": "MIRROR remembers who created it.",
    },

    9: {
        "id": 9,
        "title": "THE ROOM THAT LIES",
        "question": (
            "Six cameras recorded the same room. "
            "Something is wrong with the timestamps. "
            "Reconstruct what actually happened."
        ),
        "hint": (
            "The cameras were never synchronized. "
            "Fix their clocks before trusting the order of events."
        ),
    },

    10: {
        "id": 10,
        "title": "MIRROR // FINAL CONNECTION",
        "question": (
            "The core is no longer responding normally."
        ),
        "hint": (
            "You already have what you need."
        ),
    },
}


# ============================================================
# POINTS
# ============================================================

POINTS = {
    1: 10,
    2: 20,
    3: 30,
    4: 40,
    5: 50,
    6: 60,
    7: 70,
    8: 100,
    9: 110,
    10: 150,
}


# ============================================================
# QUESTION ORDER
# ============================================================

QUESTION_ORDER = [
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    10,
]


# ============================================================
# FILE HELPERS
# ============================================================

def safe_path(relative_path: str):

    path = (
        BASE_DIR / relative_path
    ).resolve()

    try:
        path.relative_to(
            BASE_DIR.resolve()
        )
    except ValueError:
        abort(404)

    relative_parts = path.relative_to(
        BASE_DIR
    ).parts

    if any(
        part.startswith(".")
        for part in relative_parts
    ):
        abort(404)

    return path


def serve(relative_path: str):

    path = safe_path(relative_path)

    if not path.is_file():
        abort(404)

    relative = path.relative_to(
        BASE_DIR
    )

    return send_from_directory(
        str(BASE_DIR),
        str(relative),
    )


def question_page(number: int):

    folder = (
        BASE_DIR
        / "questions"
        / f"question-{number}"
    )

    filename = f"question-{number}.html"

    file_path = folder / filename

    if not file_path.is_file():
        abort(404)

    return send_from_directory(
        str(folder),
        filename,
    )


# ============================================================
# MAIN PAGES
# ============================================================

@app.get("/")
def home():
    return serve("index.html")


@app.get("/style.css")
def style_css():
    return send_from_directory(
        str(BASE_DIR),
        "style.css",
    )
# ============================================================
# HOMEPAGE MEDIA
# ============================================================

@app.get("/dust.mp4")
def dust_video():
    file_path = BASE_DIR / "dust.mp4"

    if not file_path.is_file():
        app.logger.error("dust.mp4 not found: %s", file_path)
        abort(404)

    return send_file(
        file_path,
        mimetype="video/mp4",
        max_age=0,
    )


@app.get("/investigation-intro.mp4")
def investigation_intro_video():
    file_path = BASE_DIR / "investigation-intro.mp4"

    if not file_path.is_file():
        app.logger.error(
            "investigation-intro.mp4 not found: %s",
            file_path,
        )
        abort(404)

    return send_file(
        file_path,
        mimetype="video/mp4",
        max_age=0,
    )


@app.get("/logo.png")
def homepage_logo():
    file_path = BASE_DIR / "logo.png"

    if not file_path.is_file():
        app.logger.error(
            "logo.png not found: %s",
            file_path,
        )
        abort(404)

    return send_file(
        file_path,
        mimetype="image/png",
        max_age=0,
    )

@app.get("/questions")
@app.get("/questions/")
def questions():
    return serve(
        "questions/question-page.html"
    )


@app.get("/questions/question-<int:number>")
@app.get("/questions/question-<int:number>/")
def question(number):

    if number not in QUESTIONS:
        abort(404)

    return question_page(number)


@app.get("/login")
@app.get("/login/")
def login():
    return serve("login.html")


@app.get("/leaderboard")
@app.get("/leaderboard/")
def leaderboard():
    return serve("leaderboard.html")


# ============================================================
# Q6 // GITHUB-STYLE ENDPOINT
# ============================================================

@app.get(
    "/questions/question-6/github-endpoint"
)
@app.get(
    "/questions/question-6/github-endpoint/"
)
def q6_github_endpoint():

    folder = (
        BASE_DIR
        / "questions"
        / "question-6"
        / "github-endpoint"
    )

    index_file = folder / "index.html"

    if not index_file.is_file():
        abort(404)

    return send_from_directory(
        str(folder),
        "index.html",
    )


# ============================================================
# Q7 // STATION 01
# ============================================================

@app.get(
    "/questions/question-7/station-1"
)
@app.get(
    "/questions/question-7/station-1/"
)
def q7_station_1():

    return jsonify({

        "station": "STATION 01",

        "status": "RECOVERED",

        "recovered_note": (
            "THE DELAY IS THE KEY. "
            "DOWNLOAD THE ANALYSIS FILE "
            "AND DECODE THE SURVIVING TIMING."
        ),

        "analysis_download": (
            "/questions/question-7/"
            "analyze-delay.txt"
        ),

        "records": [

            {
                "time": "03:14:27.120",
                "status": "CORRUPTED",
            },

            {
                "time": "03:14:27.420",
                "status": "CORRUPTED",
                "fragment": "........",
            },

            {
                "time": "03:14:28.020",
                "status": "CORRUPTED",
                "fragment": "........",
            },

            {
                "time": "03:14:28.320",
                "status": "CORRUPTED",
                "fragment": "........",
            },

            {
                "time": "03:14:29.220",
                "status": "CORRUPTED",
                "fragment": "........",
            },

            {
                "time": "03:14:29.520",
                "status": "CORRUPTED",
                "fragment": "........",
            },
        ],
    })


# ============================================================
# Q7 // ANALYSIS FILE DOWNLOAD
# ============================================================

@app.get(
    "/questions/question-7/analyze-delay.txt"
)
def q7_download_analysis():

    file_path = (
        BASE_DIR
        / "questions"
        / "question-7"
        / "analyze-delay.txt"
    )

    if not file_path.is_file():
        abort(404)

    return send_file(
        file_path,
        mimetype="text/plain",
        as_attachment=True,
        download_name="analyze-delay.txt",
        max_age=0,
    )


# ============================================================
# Q8 // STATION 02 AUDIO
# ============================================================

@app.get(
    "/questions/question-8/station-02.wav"
)
def q8_download_station_02():

    file_path = (
        BASE_DIR
        / "questions"
        / "question-8"
        / "station-02.wav"
    )

    if not file_path.is_file():

        app.logger.error(
            "Q8 audio file not found: %s",
            file_path,
        )

        abort(404)

    return send_file(
        file_path,
        mimetype="audio/wav",
        as_attachment=True,
        download_name="station-02.wav",
        max_age=0,
    )


# ============================================================
# GENERAL FRONTEND FILES
# ============================================================

@app.get("/<path:filename>")
def frontend_file(filename):

    if filename.startswith("api/"):
        abort(404)

    special_prefixes = (
        "questions/question-6/github-endpoint",
        "questions/question-7/station-1",
        "questions/question-7/analyze-delay.txt",
        "questions/question-7/analyze-delay",
        "questions/question-7/download-analysis",
        "questions/question-8/station-02.wav",
    )

    if filename in special_prefixes:
        abort(404)

    path = safe_path(filename)

    if not path.is_file():
        abort(404)

    return send_from_directory(
        str(path.parent),
        path.name,
    )


# ============================================================
# AUTHENTICATION
# ============================================================

@app.post("/api/login")
def api_login():

    data = request.get_json(
        silent=True
    ) or {}

    team = str(
        data.get("team", "")
    ).strip().upper()

    password = str(
        data.get("password", "")
    )

    if not team or not password:

        return jsonify({
            "success": False,
            "message": (
                "TEAM NAME AND PASSWORD REQUIRED."
            ),
        }), 400

    db = get_db()

    row = db.execute(
        """
        SELECT *
        FROM teams
        WHERE team_name = ?
        """,
        (team,),
    ).fetchone()

    if (
        row is None
        or not check_password_hash(
            row["password_hash"],
            password,
        )
    ):

        db.close()

        return jsonify({
            "success": False,
            "message": (
                "INVALID MISSION CREDENTIALS."
            ),
        }), 401

    db.execute(
        """
        UPDATE teams
        SET last_login = ?
        WHERE id = ?
        """,
        (
            utc_now(),
            row["id"],
        ),
    )

    db.commit()
    db.close()

    session.clear()

    session["team_id"] = row["id"]
    session["team"] = row["team_name"]

    return jsonify({
        "success": True,
        "message": "ACCESS GRANTED.",
        "team": row["team_name"],
    })


@app.post("/api/logout")
def api_logout():

    session.clear()

    return jsonify({
        "success": True,
        "message": "SESSION TERMINATED.",
    })


# ============================================================
# SESSION
# ============================================================

@app.get("/api/session")
def api_session():

    team_id = session.get("team_id")

    if not team_id:

        return jsonify({
            "authenticated": False,
        })

    db = get_db()

    team = db.execute(
        """
        SELECT
            id,
            team_name,
            score,
            current_level
        FROM teams
        WHERE id = ?
        """,
        (team_id,),
    ).fetchone()

    db.close()

    if team is None:

        session.clear()

        return jsonify({
            "authenticated": False,
        })

    return jsonify({
        "authenticated": True,
        "team": team["team_name"],
        "score": team["score"],
        "current_level": team["current_level"],
    })


# ============================================================
# LEADERBOARD
# ============================================================

@app.get("/api/leaderboard")
def api_leaderboard():

    db = get_db()

    teams = db.execute(
        """
        SELECT
            team_name,
            score
        FROM teams
        ORDER BY
            score DESC,
            team_name ASC
        """
    ).fetchall()

    db.close()

    leaderboard = []

    for rank, team in enumerate(
        teams,
        start=1,
    ):

        leaderboard.append({
            "rank": rank,
            "team": team["team_name"],
            "score": team["score"],
        })

    return jsonify({
        "leaderboard": leaderboard,
    })


# ============================================================
# HEALTH
# ============================================================

@app.get("/api/health")
def health():

    return jsonify({
        "status": "online",
        "mission": "STARDUST",
        "system": "MIRROR",
    })


# ============================================================
# CURRENT TEAM
# ============================================================

def get_current_team():

    team_id = session.get("team_id")

    if not team_id:
        return None

    db = get_db()

    team = db.execute(
        """
        SELECT *
        FROM teams
        WHERE id = ?
        """,
        (team_id,),
    ).fetchone()

    db.close()

    return team


# ============================================================
# NEXT QUESTION
# ============================================================

def get_next_question_id(question_id):

    if question_id not in QUESTION_ORDER:
        return None

    index = QUESTION_ORDER.index(
        question_id
    )

    if index + 1 >= len(QUESTION_ORDER):
        return None

    return QUESTION_ORDER[index + 1]


# ============================================================
# CHECK SOLVED
# ============================================================

def db_check_solved(
    team_id,
    question_id,
):

    db = get_db()

    result = db.execute(
        """
        SELECT id
        FROM solves
        WHERE team_id = ?
        AND question_id = ?
        """,
        (
            team_id,
            question_id,
        ),
    ).fetchone()

    db.close()

    return result is not None


# ============================================================
# QUESTION ACCESS
# ============================================================

def question_is_unlocked(
    team_id,
    question_id,
):

    if question_id not in QUESTION_ORDER:
        return False

    index = QUESTION_ORDER.index(
        question_id
    )

    # Q1 is always unlocked.
    if index == 0:
        return True

    previous_question_id = (
        QUESTION_ORDER[index - 1]
    )

    return db_check_solved(
        team_id,
        previous_question_id,
    )


# ============================================================
# QUESTION API
# ============================================================

@app.get("/api/questions/<int:number>")
def question_api(number):

    question_data = QUESTIONS.get(number)

    if not question_data:
        abort(404)

    team = get_current_team()

    if team is None:

        return jsonify({
            "success": False,
            "authenticated": False,
            "message": (
                "AUTHENTICATION REQUIRED."
            ),
        }), 401

    already_solved = db_check_solved(
        team["id"],
        number,
    )

    unlocked = question_is_unlocked(
        team["id"],
        number,
    )

    # ========================================================
    # LOCKED
    # ========================================================

    if not unlocked:

        return jsonify({

            "success": True,

            "authenticated": True,

            "locked": True,

            "id": number,

            "title": question_data["title"],

            "message": (
                "PREVIOUS LEVEL NOT CLEARED."
            ),

            "already_solved": False,

            "points": POINTS.get(
                number,
                0,
            ),

            "next": get_next_question_id(
                number
            ),
        })


    # ========================================================
    # Q8 SPECIAL
    # ========================================================

    if number == 8:

        return jsonify({

            "success": True,

            "authenticated": True,

            "locked": False,

            "id": 8,

            "title": "MIRROR CORE",

            "question": QUESTIONS[8]["question"],

            "hint": QUESTIONS[8]["hint"],

            "core_memory": """
CORE MEMORY INDEX

01 → 4
02 → 1
03 → 6
04 → 2
05 → 7
06 → 3
07 → 5

---

ARCHIVE_01 ................. RESTORED
ARCHIVE_02 ................. RESTORED
ARCHIVE_03 ................. RESTORED
ARCHIVE_04 ................. RESTORED
ARCHIVE_05 ................. RESTORED
ARCHIVE_06 ................. RESTORED
ARCHIVE_07 ................. RESTORED

CORE MEMORY ................. CORRUPTED

---

DO NOT TRUST THE LABELS.
""",

            "station_audio": (
                "/questions/question-8/station-02.wav"
            ),

            "already_solved": already_solved,

            "points": POINTS[8],

            "next": 9,
        })


    # ========================================================
    # Q10 SPECIAL
    # ========================================================

    if number == 10:

        return jsonify({

        "success": True,

        "authenticated": True,

        "locked": False,

        "id": 10,

        "title": (
            "MIRROR // FINAL CONNECTION"
        ),

        "question": (
            QUESTIONS[10]["question"]
        ),

        "hint": (
            QUESTIONS[10]["hint"]
        ),

        # Safe puzzle ciphertext.
        # This is NOT the actual flag.
        "ciphertext": (
            "LAEJXHAL{ZTII_ESS_FHBVFYL_KGHGR}"
        ),

        "already_solved": already_solved,

        "points": POINTS[10],

        "next": None,

        "core": {

            "status": "UNSTABLE",

            "connection": "ACTIVE",

            "message": (
                "MIRROR CORE CONNECTION ESTABLISHED."
            ),
        },
    })


    # ========================================================
    # NORMAL QUESTIONS
    # ========================================================

    response_data = dict(question_data)

    response_data["success"] = True
    response_data["authenticated"] = True
    response_data["locked"] = False
    response_data["already_solved"] = already_solved

    response_data["points"] = POINTS.get(
        number,
        0,
    )

    response_data["next"] = get_next_question_id(
        number
    )

    # NEVER send flags to the frontend.

    return jsonify(response_data)


# ============================================================
# SUBMIT QUESTION
# ============================================================

@app.post("/api/questions/<int:question_id>/submit")
def submit_question(question_id):

    # ========================================================
    # LOGIN CHECK
    # ========================================================

    team = get_current_team()

    if team is None:

        return jsonify({
            "success": False,
            "correct": False,
            "authenticated": False,
            "message": (
                "AUTHENTICATION REQUIRED."
            ),
        }), 401


    # ========================================================
    # QUESTION CHECK
    # ========================================================

    if question_id not in QUESTIONS:

        return jsonify({
            "success": False,
            "correct": False,
            "message": (
                "QUESTION NOT FOUND."
            ),
        }), 404


    # ========================================================
    # LEVEL LOCK
    # ========================================================

    if not question_is_unlocked(
        team["id"],
        question_id,
    ):

        return jsonify({
            "success": False,
            "correct": False,
            "locked": True,
            "message": (
                "PREVIOUS LEVEL NOT CLEARED."
            ),
        }), 403


    # ========================================================
    # READ ANSWER
    # ========================================================

    data = request.get_json(
        silent=True
    )

    if not isinstance(data, dict):
        data = request.form.to_dict()

    answer = str(
        data.get(
            "answer",
            "",
        )
    ).strip()

    if not answer:

        return jsonify({
            "success": False,
            "correct": False,
            "message": "FLAG REQUIRED.",
        }), 400


    # ========================================================
    # FLAG CHECK
    # ========================================================

    expected = FLAGS.get(
        question_id,
        "",
    )

    if not expected:

        app.logger.error(
            "Question %s has no configured flag.",
            question_id,
        )

        return jsonify({
            "success": False,
            "correct": False,
            "message": (
                "QUESTION IS NOT CONFIGURED."
            ),
        }), 503


    correct = (
        answer.casefold()
        == expected.casefold()
    )


    # ========================================================
    # DATABASE
    # ========================================================

    db = get_db()

    try:

        # Save every submission.
        db.execute(
            """
            INSERT INTO submissions (
                team_id,
                question_id,
                submitted_flag,
                correct,
                submitted_at
            )
            VALUES (?, ?, ?, ?, ?)
            """,
            (
                team["id"],
                question_id,
                answer,
                int(correct),
                utc_now(),
            ),
        )


        # ====================================================
        # WRONG ANSWER
        # ====================================================

        if not correct:

            db.commit()

            return jsonify({
                "success": False,
                "correct": False,
                "message": (
                    "SIGNAL REJECTED."
                ),
            })


        # ====================================================
        # ALREADY SOLVED
        # ====================================================

        already_solved = db.execute(
            """
            SELECT id
            FROM solves
            WHERE team_id = ?
            AND question_id = ?
            """,
            (
                team["id"],
                question_id,
            ),
        ).fetchone()


        if already_solved:

            db.commit()

            return jsonify({

                "success": True,

                "correct": True,

                "already_solved": True,

                "message": (
                    "QUESTION ALREADY CLEARED."
                ),

                "points": 0,

                "next": (
                    get_next_question_id(
                        question_id
                    )
                ),
            })


        # ====================================================
        # AWARD POINTS
        # ====================================================

        points = POINTS.get(
            question_id,
            0,
        )

        db.execute(
            """
            INSERT INTO solves (
                team_id,
                question_id,
                points,
                solved_at
            )
            VALUES (?, ?, ?, ?)
            """,
            (
                team["id"],
                question_id,
                points,
                utc_now(),
            ),
        )


        # ====================================================
        # UPDATE TEAM
        # ====================================================

        next_current_level = (
            get_next_question_id(
                question_id
            )
            or question_id
        )

        db.execute(
            """
            UPDATE teams
            SET
                score = score + ?,
                current_level = MAX(
                    current_level,
                    ?
                )
            WHERE id = ?
            """,
            (
                points,
                next_current_level,
                team["id"],
            ),
        )

        db.commit()


    except Exception:

        db.rollback()

        app.logger.exception(
            "Error submitting question %s",
            question_id,
        )

        return jsonify({
            "success": False,
            "correct": False,
            "message": (
                "INTERNAL MISSION ERROR."
            ),
        }), 500


    finally:

        db.close()


    return jsonify({

        "success": True,

        "correct": True,

        "message": (
            "CORRECT FLAG. LEVEL CLEARED."
        ),

        "points": points,

        "next": (
            get_next_question_id(
                question_id
            )
        ),
    })


# ============================================================
# Q4 HIDDEN ENDPOINT
# ============================================================

@app.get("/CHECKSOURCE")
@app.get("/checksource")
def checksource():

    return """
STARDUST // RECOVERED SOURCE

53 54 41 52 44 55 53 54 20 2f 2f 20 53 54 41 52 44 55 53 54 7b 54 48 45 5f 4d 49 52 52 4f 52 5f 53 45 45 53 5f 59 4f 55 7d

RECOVERY COMPLETE.
"""


# ============================================================
# ERROR HANDLERS
# ============================================================

@app.errorhandler(404)
def not_found(error):

    if request.path.startswith("/api/"):

        return jsonify({
            "success": False,
            "error": "NOT_FOUND",
            "message": (
                "RESOURCE NOT FOUND."
            ),
        }), 404

    return (
        "STARDUST // RESOURCE NOT FOUND",
        404,
    )


@app.errorhandler(500)
def internal_error(error):

    if request.path.startswith("/api/"):

        return jsonify({
            "success": False,
            "error": "INTERNAL_ERROR",
            "message": (
                "INTERNAL MISSION ERROR."
            ),
        }), 500

    return (
        "STARDUST // INTERNAL MISSION ERROR",
        500,
    )


# ============================================================
# INITIALIZE DATABASE
# ============================================================

init_db()
seed_teams()


# ============================================================
# START SERVER
# ============================================================

if __name__ == "__main__":

    print(
        "[STARDUST] Flask backend starting..."
    )

    print(
        f"[STARDUST] Project directory: "
        f"{BASE_DIR}"
    )

    print(
        f"[STARDUST] Database: "
        f"{DATABASE}"
    )

    print()

    for question_id in QUESTION_ORDER:

        print(
            f"[STARDUST] Q{question_id} flag:",
            "configured"
            if FLAGS[question_id]
            else "MISSING",
        )

    print()

    print(
        "[STARDUST] Q6 endpoint:",
        "/questions/question-6/github-endpoint/"
    )

    print(
        "[STARDUST] Q7 station:",
        "/questions/question-7/station-1/"
    )

    print(
        "[STARDUST] Q7 analysis:",
        "/questions/question-7/analyze-delay.txt"
    )

    print(
        "[STARDUST] Q8 audio:",
        "/questions/question-8/station-02.wav"
    )

    print(
        "[STARDUST] Q10 page:",
        "/questions/question-10/"
    )

    print(
        "[STARDUST] Q10 API:",
        "/api/questions/10"
    )

    print()

    print(
        "[STARDUST] Server:",
        "http://127.0.0.1:8000"
    )

    app.run(
        host="0.0.0.0",
        port=int(
            os.getenv(
                "PORT",
                "8000",
            )
        ),
        debug=False,
        use_reloader=False,
    )
