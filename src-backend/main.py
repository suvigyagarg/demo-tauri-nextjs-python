# src-backend/main.py 
from sanic import Sanic
from sanic.response import json
from sqlalchemy import (
    create_engine,
    Table,
    Column,
    Integer,
    String,
    MetaData,
)
from sqlalchemy import insert, delete, select
from datetime import datetime
# from platformdirs import user_data_dir



engine = create_engine("sqlite:///./tasks.db", future=True)
metadata = MetaData()

task_table = Table(
    "tasks",
    metadata,
    Column("id", Integer, primary_key=True),
    Column("name", String, nullable=False),
    Column("created_at", String), ## we keep it as a string to avoid serialization pbs for demo purposes
)

metadata.create_all(engine)

app = Sanic("TauriPythonBackend")


@app.route("/")
async def index(request):
    return json({"message": "Hello world !"})



@app.get("/tasks")
async def tasks_get(request):
    with engine.begin() as conn:
        tasks_result = [dict(el) for el in conn.execute(select(task_table)).mappings()]
        return json(
            {
                "message": "Getting tasks for client",
                "data":  tasks_result,
            }
        )


@app.post("/tasks")
async def tasks_post(request):
    data = {
        "name": request.json.get("taskName", "no-name"),
        "created_at": request.json.get("createdAt"),
        "id": request.json.get("taskId"),
    }
    with engine.begin() as conn:
        conn.execute(insert(task_table).values(**data))
        print(f"Added task: {data['name']}")
    return json({"message": f"Created task name {data.get('name')}"})

@app.delete("/tasks")
async def tasks_delete(request):
    task_id = request.json.get("taskId", "no-id")
    with engine.begin() as conn:
        conn.execute(delete(task_table).where(task_table.c.id == task_id))
    return json({"message": f"Deleted task of id {task_id}"})


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=8000)