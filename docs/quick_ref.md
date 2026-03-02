# Stop the running server
# Press Ctrl+C in the terminal where it's running

# Or find and kill by port
lsof -i :8000
kill -9 <PID>

# Start the server again (from project root)
cd IgranSense_MVP
source .venv/bin/activate
cd backend/souhail-edge-sim
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000

# Create
python3 -m venv .venv

# Activate
source .venv/bin/activate

# Deactivate
deactivate

# Install packages
pip install fastapi uvicorn
pip install -r requirements.txt

from fastapi import FastAPI

app = FastAPI()

# GET endpoint
@app.get("/items")
def get_items():
    return [{"id": 1, "name": "item1"}]

# GET with path parameter
@app.get("/items/{item_id}")
def get_item(item_id: int):
    return {"id": item_id}

# GET with query parameter
@app.get("/search")
def search(q: str = None, limit: int = 10):
    return {"query": q, "limit": limit}

# POST endpoint
@app.post("/items")
def create_item(item: dict):
    return item

# Using curl
curl http://localhost:8000/fields
curl http://localhost:8000/fields/1
curl http://localhost:8000/alerts?severity=critical

# Using httpie (more readable)
pip install httpie
http GET localhost:8000/fields
http GET localhost:8000/alerts severity==critical

# Interactive docs
# Open browser: http://localhost:8000/docs

# Lists
items = [1, 2, 3]
items.append(4)
filtered = [x for x in items if x > 2]

# Dictionaries
data = {"key": "value", "count": 10}
data["new_key"] = "new_value"
data.get("missing", "default")

# Functions
def calculate(a: int, b: int = 0) -> int:
    return a + b

# F-strings
name = "sensor"
print(f"Name: {name}, ID: {123}")

# Error handling
try:
    result = risky_operation()
except Exception as e:
    print(f"Error: {e}")

