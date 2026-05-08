from dataclasses import dataclass
from typing import Optional

import cv2
import face_recognition
import numpy as np

from db import decode_face_from_blob, get_all_employees


@dataclass
class RecognizedFace:
    employee_id: Optional[int]
    name: str
    distance: Optional[float]
    is_known: bool


def open_camera(camera_index: int = 0) -> cv2.VideoCapture:
    cap = cv2.VideoCapture(camera_index)
    if not cap.isOpened():
        raise RuntimeError("Kamera ochilmadi. Camera index yoki permission'ni tekshiring.")
    return cap


def get_single_face_encoding_from_frame(frame: np.ndarray) -> np.ndarray:
    """Frame ichida aynan bitta yuz bo'lsa encoding qaytaradi."""
    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    face_locations = face_recognition.face_locations(rgb_frame)

    if len(face_locations) == 0:
        raise ValueError("Yuz topilmadi. Kamera oldida aniq ko'rining.")
    if len(face_locations) > 1:
        raise ValueError("Bir nechta yuz topildi. Faqat bitta odam kamera oldida tursin.")

    encodings = face_recognition.face_encodings(rgb_frame, face_locations)
    if not encodings:
        raise ValueError("Yuz encoding olinmadi. Yorug'likni yaxshilang va qayta urinib ko'ring.")

    return encodings[0]


def capture_single_face_encoding(camera_index: int = 0) -> np.ndarray:
    """Kamerani ochadi, foydalanuvchi SPACE bosganda bitta yuz encoding'ini oladi."""
    cap = open_camera(camera_index)
    window_name = "Face registration - SPACE: capture, Q: exit"

    try:
        while True:
            ok, frame = cap.read()
            if not ok:
                raise RuntimeError("Kameradan frame o'qib bo'lmadi.")

            cv2.putText(
                frame,
                "SPACE - capture | Q - exit",
                (20, 35),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.8,
                (0, 255, 255),
                2,
            )
            cv2.imshow(window_name, frame)

            key = cv2.waitKey(1) & 0xFF
            if key == ord("q"):
                raise RuntimeError("Ro'yxatdan o'tkazish bekor qilindi.")
            if key == 32:
                return get_single_face_encoding_from_frame(frame)
    finally:
        cap.release()
        cv2.destroyAllWindows()


def load_known_faces() -> tuple[list[int], list[str], list[np.ndarray]]:
    employees = get_all_employees()
    ids: list[int] = []
    names: list[str] = []
    encodings: list[np.ndarray] = []

    for employee in employees:
        ids.append(int(employee["id"]))
        names.append(str(employee["name"]))
        encodings.append(decode_face_from_blob(employee["face_encoding"]))

    return ids, names, encodings


def recognize_face(face_encoding: np.ndarray, tolerance: float = 0.5) -> RecognizedFace:
    ids, names, known_encodings = load_known_faces()
    if not known_encodings:
        return RecognizedFace(None, "Noma'lum shaxs", None, False)

    distances = face_recognition.face_distance(known_encodings, face_encoding)
    best_index = int(np.argmin(distances))
    best_distance = float(distances[best_index])

    if best_distance <= tolerance:
        return RecognizedFace(ids[best_index], names[best_index], best_distance, True)

    return RecognizedFace(None, "Noma'lum shaxs", best_distance, False)
