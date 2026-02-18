"""
Employee Schemas - Pydantic models for validation
"""

from pydantic import BaseModel, EmailStr, Field, ConfigDict


class EmployeeCreate(BaseModel):
    """Schema for creating a new employee"""

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "employee_id": "EMP001",
                "full_name": "John Doe",
                "email": "john.doe@company.com",
                "department": "Engineering",
            }
        }
    )

    employee_id: str = Field(
        ..., min_length=1, max_length=50, description="Unique employee ID"
    )
    full_name: str = Field(
        ..., min_length=1, max_length=100, description="Employee full name"
    )
    email: EmailStr = Field(..., description="Employee email address")
    department: str = Field(
        ..., min_length=1, max_length=100, description="Department name"
    )


class EmployeeResponse(BaseModel):
    """Schema for employee response"""

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "id": "65abc123def456",
                "employee_id": "EMP001",
                "full_name": "John Doe",
                "email": "john.doe@company.com",
                "department": "Engineering",
            }
        }
    )

    id: str
    employee_id: str
    full_name: str
    email: str
    department: str
