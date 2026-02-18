"""
Attendance Model - MongoDB document structure
"""


def attendance_helper(attendance) -> dict:
    """Convert MongoDB attendance document to dict"""
    return {
        "id": str(attendance["_id"]),
        "employee_id": attendance["employee_id"],
        "date": attendance["date"],
        "status": attendance["status"],
    }
