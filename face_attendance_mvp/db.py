import sqlite3
from pathlib import Path
from typing import Optional

import numpy as np


BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "attendance.db"


def get_connection() -> sqlite3.Connection:
    """SQLite connection qaytaradi va rows'ni dict kabi o'qishga sozlaydi."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    """Kerakli jadvallarni yaratadi."""
    with get_connection() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS employees (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                face_encoding BLOB NOT NULL
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS attendance (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                employee_id INTEGER NOT NULL,
                date TEXT NOT NULL,
                check_in TEXT NOT NULL,
                check_out TEXT,
                total_seconds INTEGER,
                FOREIGN KEY (employee_id) REFERENCES employees (id),
                UNIQUE(employee_id, date)
            )
            """
        )
        conn.commit()


def encode_face_to_blob(face_encoding: np.ndarray) -> bytes:
    """Face encoding'ni rasm emas, faqat raqamli vektor sifatida saqlaymiz."""
    return face_encoding.astype(np.float64).tobytes()


def decode_face_from_blob(blob: bytes) -> np.ndarray:
    return np.frombuffer(blob, dtype=np.float64)


def add_employee(name: str, face_encoding: np.ndarray) -> int:
    with get_connection() as conn:
        cursor = conn.execute(
            "INSERT INTO employees (name, face_encoding) VALUES (?, ?)",
            (name.strip(), encode_face_to_blob(face_encoding)),
        )
        conn.commit()
        return int(cursor.lastrowid)


def get_all_employees() -> list[sqlite3.Row]:
    with get_connection() as conn:
        return conn.execute("SELECT id, name, face_encoding FROM employees ORDER BY name").fetchall()


def get_employee(employee_id: int) -> Optional[sqlite3.Row]:
    with get_connection() as conn:
        return conn.execute(
            "SELECT id, name, face_encoding FROM employees WHERE id = ?",
            (employee_id,),
        ).fetchone()


def get_attendance_by_date(date_text: str) -> list[sqlite3.Row]:
    with get_connection() as conn:
        return conn.execute(
            """
            SELECT a.id, a.employee_id, e.name, a.date, a.check_in, a.check_out, a.total_seconds
            FROM attendance a
            JOIN employees e ON e.id = a.employee_id
            WHERE a.date = ?
            ORDER BY a.check_in
            """,
            (date_text,),
        ).fetchall()


def get_attendance(employee_id: Optional[int] = None) -> list[sqlite3.Row]:
    query = """
        SELECT a.id, a.employee_id, e.name, a.date, a.check_in, a.check_out, a.total_seconds
        FROM attendance a
        JOIN employees e ON e.id = a.employee_id
    """
    params: tuple[object, ...] = ()
    if employee_id is not None:
        query += " WHERE a.employee_id = ?"
        params = (employee_id,)
    query += " ORDER BY a.date DESC, a.check_in DESC"

    with get_connection() as conn:
        return conn.execute(query, params).fetchall()
