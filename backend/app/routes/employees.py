"""
Employee Routes - CRUD operations for employees
"""

from typing import List

from fastapi import APIRouter, HTTPException, status
from bson import ObjectId
from pymongo.errors import DuplicateKeyError

from ..database import get_database
from ..schemas.employee import EmployeeCreate, EmployeeResponse
from ..models.employee import employee_helper

router = APIRouter(prefix="/employees", tags=["Employees"])


@router.post("", response_model=EmployeeResponse, status_code=status.HTTP_201_CREATED)
async def create_employee(employee: EmployeeCreate):
    """Add a new employee"""
    db = get_database()

    employee_data = employee.model_dump()

    try:
        result = await db.employees.insert_one(employee_data)
        created_employee = await db.employees.find_one({"_id": result.inserted_id})
        return employee_helper(created_employee)
    except DuplicateKeyError as e:
        # Determine which field caused the duplicate
        error_str = str(e)
        if "employee_id" in error_str:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Employee with ID '{employee.employee_id}' already exists",
            )
        elif "email" in error_str:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Employee with email '{employee.email}' already exists",
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Employee with this ID or email already exists",
            )


@router.get("", response_model=List[EmployeeResponse])
async def list_employees():
    """Get all employees"""
    db = get_database()

    employees = []
    async for employee in db.employees.find():
        employees.append(employee_helper(employee))

    return employees


@router.get("/{employee_id}", response_model=EmployeeResponse)
async def get_employee(employee_id: str):
    """Get a specific employee by MongoDB ID or employee_id"""
    db = get_database()

    # Try to find by MongoDB ObjectId first
    if ObjectId.is_valid(employee_id):
        employee = await db.employees.find_one({"_id": ObjectId(employee_id)})
        if employee:
            return employee_helper(employee)

    # Try to find by employee_id field
    employee = await db.employees.find_one({"employee_id": employee_id})
    if employee:
        return employee_helper(employee)

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND, detail=f"Employee not found"
    )


@router.delete("/{employee_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_employee(employee_id: str):
    """Delete an employee by MongoDB ID or employee_id"""
    db = get_database()

    # Try to delete by MongoDB ObjectId first
    if ObjectId.is_valid(employee_id):
        # First, find the employee to get their employee_id field
        employee = await db.employees.find_one({"_id": ObjectId(employee_id)})
        if employee:
            emp_id = employee.get("employee_id")
            await db.employees.delete_one({"_id": ObjectId(employee_id)})
            # Delete associated attendance records using the employee_id field
            if emp_id:
                await db.attendance.delete_many({"employee_id": emp_id})
            return

    # Try to delete by employee_id field
    employee = await db.employees.find_one({"employee_id": employee_id})
    if employee:
        await db.employees.delete_one({"employee_id": employee_id})
        await db.attendance.delete_many({"employee_id": employee_id})
        return

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND, detail=f"Employee not found"
    )
