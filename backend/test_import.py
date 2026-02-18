"""Test script to debug Pydantic issue"""

import sys
import traceback

try:
    from app.main import app

    print("SUCCESS: App imported successfully!")
except Exception as e:
    print(f"FAILED: {e}")
    traceback.print_exc()
