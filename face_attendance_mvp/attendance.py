import argparse
import time

import cv2
import face_recognition

from attendance_service import daily_report, employee_report, export_attendance_csv, mark_attendance
from db import init_db
from face_service import load_known_faces, open_camera


def print_report(rows: list[dict]) -> None:
    if not rows:
        print("Ma'lumot topilmadi.")
        return

    for row in rows:
        print(
            f"{row['date']} | {row['name']} | IN: {row['check_in']} | "
            f"OUT: {row['check_out'] or '-'} | {row['total_time']}"
        )


def run_camera_attendance(camera_index: int = 0, tolerance: float = 0.5, cooldown_seconds: int = 8) -> None:
    ids, names, known_encodings = load_known_faces()
    if not known_encodings:
        print("Database'da xodim yo'q. Avval register_face.py orqali xodim qo'shing.")
        return

    cap = open_camera(camera_index)
    last_marked_at: dict[int, float] = {}
    window_name = "Face Attendance - Q: exit"

    try:
        while True:
            ok, frame = cap.read()
            if not ok:
                print("Kameradan frame o'qib bo'lmadi.")
                break

            # Tezlik uchun frame kichraytiriladi, keyin koordinatalar qayta kattalashtiriladi.
            small_frame = cv2.resize(frame, (0, 0), fx=0.25, fy=0.25)
            rgb_small_frame = cv2.cvtColor(small_frame, cv2.COLOR_BGR2RGB)

            face_locations = face_recognition.face_locations(rgb_small_frame)
            face_encodings = face_recognition.face_encodings(rgb_small_frame, face_locations)

            for face_location, face_encoding in zip(face_locations, face_encodings):
                matches = face_recognition.compare_faces(known_encodings, face_encoding, tolerance=tolerance)
                name = "Noma'lum shaxs"
                label_color = (0, 0, 255)

                if True in matches:
                    distances = face_recognition.face_distance(known_encodings, face_encoding)
                    best_index = int(distances.argmin())

                    if matches[best_index]:
                        employee_id = ids[best_index]
                        name = names[best_index]
                        label_color = (0, 180, 0)

                        now = time.time()
                        last_time = last_marked_at.get(employee_id, 0)
                        if now - last_time >= cooldown_seconds:
                            result = mark_attendance(employee_id)
                            last_marked_at[employee_id] = now
                            print(f"{name}: {result['message']} | {result['total_time']}")

                top, right, bottom, left = [value * 4 for value in face_location]
                cv2.rectangle(frame, (left, top), (right, bottom), label_color, 2)
                cv2.rectangle(frame, (left, bottom - 35), (right, bottom), label_color, cv2.FILLED)
                cv2.putText(
                    frame,
                    name,
                    (left + 6, bottom - 8),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.7,
                    (255, 255, 255),
                    2,
                )

            cv2.imshow(window_name, frame)
            if cv2.waitKey(1) & 0xFF == ord("q"):
                break
    except Exception as exc:
        print(f"Xatolik: {exc}")
    finally:
        cap.release()
        cv2.destroyAllWindows()


def main() -> None:
    parser = argparse.ArgumentParser(description="Face ID attendance tizimi")
    parser.add_argument("--camera", type=int, default=0, help="Kamera index, default: 0")
    parser.add_argument("--tolerance", type=float, default=0.5, help="Yuz moslik chegarasi, default: 0.5")
    parser.add_argument("--daily-report", help="Kunlik hisobot sanasi: YYYY-MM-DD")
    parser.add_argument("--employee-report", type=int, help="Xodim ID bo'yicha hisobot")
    parser.add_argument("--export-csv", nargs="?", const="attendance_report.csv", help="CSV export fayl nomi")
    args = parser.parse_args()

    try:
        init_db()

        if args.daily_report:
            print_report(daily_report(args.daily_report))
            return

        if args.employee_report:
            print_report(employee_report(args.employee_report))
            return

        if args.export_csv:
            path = export_attendance_csv(args.export_csv)
            print(f"CSV tayyor: {path}")
            return

        run_camera_attendance(args.camera, args.tolerance)
    except Exception as exc:
        print(f"Xatolik: {exc}")


if __name__ == "__main__":
    main()
