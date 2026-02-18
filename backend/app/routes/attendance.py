"""
Attendance Routes - Mark and view attendance
"""

from typing import List

from fastapi import APIRouter, HTTPException, status
from pymongo.errors import DuplicateKeyError
from datetime import date

from ..database import get_database
from ..schemas.attendance import AttendanceCreate, AttendanceResponse
from ..models.attendance import attendance_helper

router = APIRouter(prefix="/attendance", tags=["Attendance"])


@router.post("", response_model=AttendanceResponse, status_code=status.HTTP_201_CREATED)
async def mark_attendance(attendance: AttendanceCreate):
    """Mark attendance for an employee"""
    db = get_database()

    # Verify employee exists
    employee = await db.employees.find_one({"employee_id": attendance.employee_id})
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employee with ID '{attendance.employee_id}' not found",
        )

    attendance_data = {
        "employee_id": attendance.employee_id,
        "date": attendance.date.isoformat(),
        "status": attendance.status.value,
    }

    try:
        result = await db.attendance.insert_one(attendance_data)
        created_attendance = await db.attendance.find_one({"_id": result.inserted_id})
        return attendance_helper(created_attendance)
    except DuplicateKeyError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Attendance already marked for employee '{attendance.employee_id}' on {attendance.date}",
        )


@router.get("/{employee_id}", response_model=List[AttendanceResponse])
async def get_attendance_history(employee_id: str):
    """Get attendance history for an employee"""
    db = get_database()

    # Verify employee exists
    employee = await db.employees.find_one({"employee_id": employee_id})
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employee with ID '{employee_id}' not found",
        )

    attendance_records = []
    async for record in db.attendance.find({"employee_id": employee_id}).sort(
        "date", -1
    ):
        attendance_records.append(attendance_helper(record))

    return attendance_records


@router.get("/today/summary")
async def get_today_summary():
    """Get today's attendance summary"""
    db = get_database()

    today = date.today().isoformat()

    # Count total employees
    total_employees = await db.employees.count_documents({})

    # Get all existing employee IDs
    existing_employee_ids = []
    async for emp in db.employees.find({}, {"employee_id": 1}):
        existing_employee_ids.append(emp["employee_id"])

    # Count present today (only for existing employees)
    present_today = await db.attendance.count_documents(
        {
            "date": today,
            "status": "Present",
            "employee_id": {"$in": existing_employee_ids},
        }
    )

    # Count absent today (only for existing employees)
    absent_today = await db.attendance.count_documents(
        {
            "date": today,
            "status": "Absent",
            "employee_id": {"$in": existing_employee_ids},
        }
    )

    return {
        "date": today,
        "total_employees": total_employees,
        "present_today": present_today,
        "absent_today": absent_today,
        "not_marked": max(0, total_employees - present_today - absent_today),
    }
