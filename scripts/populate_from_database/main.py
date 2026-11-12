import uuid
from datetime import datetime
from zoneinfo import ZoneInfo

import boto3
from openpyxl import load_workbook

# Configuration
EXCEL_FILE = "data.xlsx"
TABLE_NAME = "alphadate-dev-alphabets"
REGION = "us-east-1"

GLOBAL_USER_ID = "_GLOBAL_ALPHABET_DATES"


def read_excel(file_path: str) -> list[dict]:
    """Read custom dates from Excel."""
    workbook = load_workbook(file_path, data_only=True)
    worksheet = workbook.active

    headers = {
        str(cell.value).strip(): index for index, cell in enumerate(worksheet[1])
    }

    required = ["Letras", "Nivel", "Lugar", "Descripcion"]

    missing = set(required) - headers.keys()
    if missing:
        raise ValueError(f"Missing Excel columns: {missing}")

    dates = []

    for row in worksheet.iter_rows(min_row=2, values_only=True):
        title = str(row[headers["Letras"]] or "").strip()
        level = str(row[headers["Nivel"]] or "").strip()
        place = str(row[headers["Lugar"]] or "").strip()
        description = str(row[headers["Descripcion"]] or "").strip()

        if not title:
            continue

        dates.append(
            {
                "title": title,
                "description": description,
                "tags": [tag for tag in [level, place] if tag],
            }
        )

    workbook.close()
    return dates


def populate_dynamodb():
    dynamodb = boto3.resource("dynamodb", region_name=REGION)
    table = dynamodb.Table(TABLE_NAME)

    dates = read_excel(EXCEL_FILE)

    now = datetime.now(ZoneInfo("America/Lima")).isoformat(timespec="seconds")

    for date in dates:
        item = {
            "userId": GLOBAL_USER_ID,
            "dateId": str(uuid.uuid4()),
            "creationDate": now,
            "updatedAt": now,
            "title": date["title"],
            "description": date["description"],
            "status": "PUBLISHED",
            "tags": date["tags"],
        }

        table.put_item(Item=item)

        print(f"[CREATED] {date['title']}")

    print(f"\nCompleted: {len(dates)} dates created.")


if __name__ == "__main__":
    populate_dynamodb()
