import csv
from datetime import date, datetime
from pathlib import Path
from typing import Optional

from db import get_attendance, get_attendance_by_date, get_connection


def format_seconds(total_seconds: Optional[int]) -> str:
    if total_seconds is None:
        return "-"
    hours = total_seconds // 3600
    minutes = (total_seconds % 3600) // 60
    return f"{hours} soat {minutes} daqiqa"


def mark_attendance(employee_id: int) -> dict:
    """Bugungi check-in/check-out holatini yozadi."""
    now = datetime.now()
    today = date.today().isoformat()
    now_text = now.strftime("%H:%M:%S")

    with get_connection() as conn:
        row = conn.execute(
            "SELECT * FROM attendance WHERE employee_id = ? AND date = ?",
            (employee_id, today),
        ).fetchone()

        if row is None:
            conn.execute(
                """
                INSERT INTO attendance (employee_id, date, check_in)
                VALUES (?, ?, ?)
                """,
                (employee_id, today, now_text),
            )
            conn.commit()
            return {
                "status": "check_in",
                "message": "Check-in yozildi",
                "date": today,
                "check_in": now_text,
                "check_out": None,
                "total_seconds": None,
                "total_time": "-",
            }

        if row["check_out"] is None:
            check_in_dt = datetime.strptime(f"{today} {row['check_in']}", "%Y-%m-%d %H:%M:%S")
            total_seconds = int((now - check_in_dt).total_seconds())
            conn.execute(
                """
                UPDATE attendance
                SET check_out = ?, total_seconds = ?
                WHERE id = ?
                """,
                (now_text, total_seconds, row["id"]),
            )
            conn.commit()
            return {
                "status": "check_out",
                "message": "Check-out yozildi",
                "date": today,
                "check_in": row["check_in"],
                "check_out": now_text,
                "total_seconds": total_seconds,
                "total_time": format_seconds(total_seconds),
            }

        return {
            "status": "already_completed",
            "message": "Bugun allaqachon check-in va check-out qilingan",
            "date": today,
            "check_in": row["check_in"],
            "check_out": row["check_out"],
            "total_seconds": row["total_seconds"],
            "total_time": format_seconds(row["total_seconds"]),
        }


def rows_to_dicts(rows) -> list[dict]:
    result = []
    for row in rows:
        item = dict(row)
        item["total_time"] = format_seconds(item.get("total_seconds"))
        return_item = {
            "id": item["id"],
            "employee_id": item["employee_id"],
            "name": item["name"],
            "date": item["date"],
            "check_in": item["check_in"],
            "check_out": item["check_out"],
            "total_seconds": item["total_seconds"],
            "total_time": item["total_time"],
        }
        result.append(return_item)
    return result


def daily_report(date_text: Optional[str] = None) -> list[dict]:
    report_date = date_text or date.today().isoformat()
    return rows_to_dicts(get_attendance_by_date(report_date))


def employee_report(employee_id: int) -> list[dict]:
    return rows_to_dicts(get_attendance(employee_id))


def all_attendance() -> list[dict]:
    return rows_to_dicts(get_attendance())


def export_attendance_csv(output_path: str = "attendance_report.csv") -> Path:
    path = Path(output_path).resolve()
    rows = all_attendance()

    with path.open("w", newline="", encoding="utf-8") as file:
        writer = csv.DictWriter(
            file,
            fieldnames=[
                "id",
                "employee_id",
                "name",
                "date",
                "check_in",
                "check_out",
                "total_seconds",
                "total_time",
            ],
        )
        writer.writeheader()
        writer.writerows(rows)

    return path
