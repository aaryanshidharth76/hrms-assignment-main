"""
Attendance Schemas - Pydantic models for validation
"""

from enum import Enum
from datetime import date as DateType
from pydantic import BaseModel, Field, ConfigDict


class AttendanceStatus(str, Enum):
    """Attendance status enum"""

    PRESENT = "Present"
    ABSENT = "Absent"


class AttendanceCreate(BaseModel):
    """Schema for marking attendance"""

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "employee_id": "EMP001",
                "date": "2026-01-24",
                "status": "Present",
            }
        }
    )

    employee_id: str = Field(..., min_length=1, description="Employee ID")
    date: DateType = Field(..., description="Attendance date")
    status: AttendanceStatus = Field(..., description="Attendance status")


class AttendanceResponse(BaseModel):
    """Schema for attendance response"""

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "id": "65abc123def456",
                "employee_id": "EMP001",
                "date": "2026-01-24",
                "status": "Present",
            }
        }
    )

    id: str
    employee_id: str
    date: str
    status: str
