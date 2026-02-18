"""
Employee Model - MongoDB document structure
"""


def employee_helper(employee) -> dict:
    """Convert MongoDB employee document to dict"""
    return {
        "id": str(employee["_id"]),
        "employee_id": employee["employee_id"],
        "full_name": employee["full_name"],
        "email": employee["email"],
        "department": employee["department"],
    }
