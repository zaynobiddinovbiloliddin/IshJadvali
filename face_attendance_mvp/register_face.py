import argparse

from db import add_employee, init_db
from face_service import capture_single_face_encoding


def main() -> None:
    parser = argparse.ArgumentParser(description="Xodim yuzini database'ga ro'yxatdan o'tkazish")
    parser.add_argument("--name", required=True, help="Xodim ismi")
    parser.add_argument("--camera", type=int, default=0, help="Kamera index, default: 0")
    args = parser.parse_args()

    try:
        init_db()
        face_encoding = capture_single_face_encoding(args.camera)
        employee_id = add_employee(args.name, face_encoding)
        print(f"OK: {args.name} ro'yxatdan o'tdi. Employee ID: {employee_id}")
    except Exception as exc:
        print(f"Xatolik: {exc}")


if __name__ == "__main__":
    main()
