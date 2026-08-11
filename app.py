from pathlib import Path
import os
import sqlite3
from datetime import datetime, timezone

from flask import (
    Flask,
    jsonify,
    request,
    send_from_directory,
    abort,
    session,
)

from werkzeug.security import (
    generate_password_hash,
    check_password_hash,
)


# ============================================================
# STARDUST // MIRROR PROTOCOL
# Flask Backend
# ============================================================

BASE_DIR = Path(__file__).resolve().parent
DATABASE = BASE_DIR / "stardust.db"

app = Flask(__name__, static_folder=None)

app.secret_key = os.getenv(
    "SECRET_KEY",
    "stardust-dev-secret-key",
)


# ============================================================
# DATABASE
# ============================================================

def get_db():
    db = sqlite3.connect(DATABASE)
    db.row_factory = sqlite3.Row

    # Enable foreign keys
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

    "TEAM01": "star01",
    "TEAM02": "dusk02",
    "TEAM03": "mirror03",
    "TEAM04": "echo04",
    "TEAM05": "signal05",
    "TEAM06": "archive06",
    "TEAM07": "orbit07",
    "TEAM08": "venn08",
    "TEAM09": "stardust09",
    "TEAM10": "protocol10",
    "TEAM11": "cosmos11",
    "TEAM12": "voyager12",
    "TEAM13": "nebula13",
    "TEAM14": "quantum14",
    "TEAM15": "recovery15",
    "TESET": "test123"
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
# ENVIRONMENT / FLAGS
# ============================================================

def load_env_file(path: Path):
    """
    Loads KEY=VALUE pairs from a .env file.

    Existing environment variables are NOT overwritten.
    """

    if not path.is_file():
        return

    for raw_line in path.read_text(
        encoding="utf-8"
    ).splitlines():

        line = raw_line.strip()

        if (
            not line
            or line.startswith("#")
            or "=" not in line
        ):
            continue

        key, value = line.split("=", 1)

        key = key.strip()

        value = (
            value
            .strip()
            .strip('"')
            .strip("'")
        )

        if key:
            os.environ.setdefault(
                key,
                value,
            )


# Load question-specific .env files
load_env_file(
    BASE_DIR
    / "questions"
    / "question-1"
    / ".env"
)

load_env_file(
    BASE_DIR
    / "questions"
    / "question-2"
    / ".env"
)

load_env_file(
    BASE_DIR
    / "questions"
    / "question-3"
    / ".env"
)
load_env_file(
    BASE_DIR
    / "questions"
    / "question-4"
    / ".env"
)

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
        "hint": "The crew's words are not as broken as they appear.",
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
},
}


# ============================================================
# FLAGS
# ============================================================

FLAGS = {
    1: os.getenv(
        "QUESTION_1_FLAG",
        "",
    ).strip(),

    2: os.getenv(
        "QUESTION_2_FLAG",
        "",
    ).strip(),

    3: os.getenv(
        "QUESTION_3_FLAG",
        "",
    ).strip(),
    4: os.getenv(
    "QUESTION_4_FLAG",
    "",
    ).strip()
}


# ============================================================
# POINTS
# ============================================================

POINTS = {
    1: 10,
    2: 20,
    3: 30,
    4: 40,
}


# ============================================================
# FILE SERVING
# ============================================================

def serve(relative_path: str):
    """
    Safely serves a file from the project directory.
    Hidden files/directories are never exposed.
    """

    path = BASE_DIR / relative_path

    # Prevent paths outside BASE_DIR
    try:
        path.relative_to(BASE_DIR)
    except ValueError:
        abort(404)

    if not path.is_file():
        abort(404)

    # Never expose hidden files/directories
    if any(
        part.startswith(".")
        for part in path.relative_to(BASE_DIR).parts
    ):
        abort(404)

    return send_from_directory(
        BASE_DIR,
        relative_path,
    )


def question_page(number: int):
    folder = (
        BASE_DIR
        / "questions"
        / f"question-{number}"
    )

    filename = f"question-{number}.html"

    if not (folder / filename).is_file():
        abort(404)

    return send_from_directory(
        folder,
        filename,
    )


# ============================================================
# PAGES
# ============================================================

@app.get("/")
def home():
    return serve("index.html")


@app.get("/questions")
@app.get("/questions/")
def questions():
    return serve(
        "questions/question-page.html"
    )


@app.get("/questions/question-<int:number>")
@app.get("/questions/question-<int:number>/")
def question(number: int):

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
        ORDER BY score DESC, team_name ASC
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
# SOLVE CHECK
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
# QUESTION API
# ============================================================

@app.get("/api/questions/<int:number>")
def question_api(number: int):

    question_data = QUESTIONS.get(number)

    if not question_data:
        abort(404)

    # IMPORTANT:
    # The flag is NEVER returned to the client.
    return jsonify(question_data)


# ============================================================
# SUBMIT QUESTION
# ============================================================

@app.post(
    "/api/questions/<int:question_id>/submit"
)
def submit_question(question_id: int):

    # --------------------------------------------------------
    # LOGIN CHECK
    # --------------------------------------------------------

    team = get_current_team()

    if team is None:

        return jsonify({
            "success": False,
            "correct": False,
            "message": (
                "AUTHENTICATION REQUIRED."
            ),
        }), 401

    # --------------------------------------------------------
    # QUESTION CHECK
    # --------------------------------------------------------

    if question_id not in QUESTIONS:

        return jsonify({
            "success": False,
            "correct": False,
            "message": (
                "QUESTION NOT FOUND."
            ),
        }), 404

    # --------------------------------------------------------
    # LEVEL LOCK
    # --------------------------------------------------------

    if question_id > 1:

        previous_solved = db_check_solved(
            team["id"],
            question_id - 1,
        )

        if not previous_solved:

            return jsonify({
                "success": False,
                "correct": False,
                "message": (
                    "PREVIOUS LEVEL NOT CLEARED."
                ),
            }), 403

    # --------------------------------------------------------
    # READ ANSWER
    # --------------------------------------------------------

    data = request.get_json(
        silent=True
    ) or {}

    answer = str(
        data.get("answer", "")
    ).strip()

    if not answer:

        return jsonify({
            "success": False,
            "correct": False,
            "message": "FLAG REQUIRED.",
        }), 400

    # --------------------------------------------------------
    # FLAG CHECK
    # --------------------------------------------------------

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

    # --------------------------------------------------------
    # OPEN DATABASE
    # --------------------------------------------------------

    db = get_db()

    try:

        # ----------------------------------------------------
        # SAVE SUBMISSION
        # ----------------------------------------------------

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

        # ----------------------------------------------------
        # WRONG ANSWER
        # ----------------------------------------------------

        if not correct:

            db.commit()

            return jsonify({
                "success": False,
                "correct": False,
                "message": (
                    "SIGNAL REJECTED."
                ),
            })

        # ----------------------------------------------------
        # ALREADY SOLVED?
        # ----------------------------------------------------

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

            next_level = (
                question_id + 1
                if question_id < len(QUESTIONS)
                else None
            )

            return jsonify({
                "success": True,
                "correct": True,
                "already_solved": True,
                "message": (
                    "QUESTION ALREADY CLEARED."
                ),
                "points": 0,
                "next": next_level,
            })

        # ----------------------------------------------------
        # AWARD POINTS
        # ----------------------------------------------------

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

        # ----------------------------------------------------
        # UPDATE TEAM
        # ----------------------------------------------------

        next_current_level = (
            question_id + 1
            if question_id < len(QUESTIONS)
            else question_id
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

        # ----------------------------------------------------
        # COMMIT EVERYTHING
        # ----------------------------------------------------

        db.commit()

    except Exception:
        db.rollback()
        app.logger.exception(
            "Error while submitting question %s",
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

    # --------------------------------------------------------
    # RESPONSE
    # --------------------------------------------------------

    next_level = (
        question_id + 1
        if question_id < len(QUESTIONS)
        else None
    )

    return jsonify({
        "success": True,
        "correct": True,
        "message": (
            "CORRECT FLAG. LEVEL CLEARED."
        ),
        "points": points,
        "next": next_level,
    })

# ============================================================
# CHECKSOURCE — Q4 HIDDEN ENDPOINT
# ============================================================

@app.get("/CHECKSOURCE")
def checksource():
    return """
    STARDUST // RECOVERED SOURCE

    53 54 41 52 44 55 53 54 20 2F 2F 20
    66 6C 61 67 7B 74 68 65 5F 6D 69 72
    72 6F 72 5F 73 65 65 73 5F 79 6F 75 7D

    RECOVERY COMPLETE.
    """
# ============================================================
# STATIC FILES
# ============================================================

@app.get("/<path:filename>")
def static_file(filename: str):

    # Never expose hidden files/directories
    if any(
        part.startswith(".")
        for part in Path(filename).parts
    ):
        abort(404)

    return serve(filename)


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
        "[STARDUST] Q1 flag:",
        "configured"
        if FLAGS[1]
        else "MISSING",
    )

    print(
        "[STARDUST] Q2 flag:",
        "configured"
        if FLAGS[2]
        else "MISSING",
    )

    print(
        "[STARDUST] Q3 flag:",
        "configured"
        if FLAGS[3]
        else "MISSING",
    )

    print(
        "[STARDUST] Database:",
        DATABASE,
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
@app.get("/api/recovery/1971")
@app.get("/api/recovery/1971")
def recovery_1971():
    recovery_file = (
        BASE_DIR
        / "questions"
        / "question-6"
        / "endpoint-clue"
        / "recovery.txt"
    )

    if not recovery_file.is_file():
        return jsonify({
            "success": False,
            "message": "RECOVERY NODE UNAVAILABLE."
        }), 404

    return recovery_file.read_text(
        encoding="utf-8"
    ), 200, {
        "Content-Type": "text/plain; charset=utf-8"
    }