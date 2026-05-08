from datetime import date
from typing import Optional

import cv2
import numpy as np
from fastapi import FastAPI, File, HTTPException, UploadFile

from attendance_service import all_attendance, daily_report, employee_report
from db import add_employee, get_all_employees, init_db
from face_service import get_single_face_encoding_from_frame


app = FastAPI(title="Face Attendance MVP")


@app.on_event("startup")
def startup() -> None:
    init_db()


@app.post("/employees/register")
async def register_employee(name: str, image: UploadFile = File(...)) -> dict:
    """
    React frontend uchun endpoint.
    Frontend kameradan olingan bitta rasmni multipart/form-data orqali yuboradi.
    """
    try:
        image_bytes = await image.read()
        np_array = np.frombuffer(image_bytes, np.uint8)
        frame = cv2.imdecode(np_array, cv2.IMREAD_COLOR)
        if frame is None:
            raise HTTPException(status_code=400, detail="Rasm o'qilmadi.")

        face_encoding = get_single_face_encoding_from_frame(frame)
        employee_id = add_employee(name, face_encoding)
        return {"id": employee_id, "name": name, "message": "Xodim ro'yxatdan o'tdi"}
    except HTTPException:
        raise
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@app.get("/employees")
def employees() -> list[dict]:
    return [{"id": row["id"], "name": row["name"]} for row in get_all_employees()]


@app.get("/attendance")
def attendance(employee_id: Optional[int] = None) -> list[dict]:
    if employee_id is not None:
        return employee_report(employee_id)
    return all_attendance()


@app.get("/attendance/today")
def attendance_today() -> list[dict]:
    return daily_report(date.today().isoformat())


@app.get("/attendance/report")
def attendance_report(date_text: Optional[str] = None, employee_id: Optional[int] = None) -> list[dict]:
    if employee_id is not None:
        return employee_report(employee_id)
    return daily_report(date_text)


@app.post("/recognize")
async def recognize_from_image(image: UploadFile = File(...)) -> dict:
    """
    Soddalashtirilgan tanish endpointi.
    Eslatma: kamera oqimi va real vaqt attendance yozish CLI'da bajariladi.
    """
    from face_service import recognize_face

    try:
        image_bytes = await image.read()
        np_array = np.frombuffer(image_bytes, np.uint8)
        frame = cv2.imdecode(np_array, cv2.IMREAD_COLOR)
        if frame is None:
            raise HTTPException(status_code=400, detail="Rasm o'qilmadi.")

        encoding = get_single_face_encoding_from_frame(frame)
        result = recognize_face(encoding)
        return {
            "employee_id": result.employee_id,
            "name": result.name,
            "distance": result.distance,
            "is_known": result.is_known,
        }
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
