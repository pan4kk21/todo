from typing import Annotated

import uvicorn
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase, mapped_column, Mapped
from sqlmodel.ext.asyncio.session import AsyncSession

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

engine = create_async_engine('sqlite+aiosqlite:///tasks.db')

new_session = async_sessionmaker(engine, expire_on_commit=False)

async def get_session():
    async with new_session() as session:
        yield session

SessionDep = Annotated[AsyncSession, Depends(get_session)]


class Base(DeclarativeBase):
    pass


class TaskModel(Base):
    __tablename__ = "tasks"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str]
    description: Mapped[str | None] = None
    completed: Mapped[bool] = mapped_column(default=0)


@app.post("/setup_database")
async def setup_database():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    return {"ok": True}


class TaskAddSchema(BaseModel):
    title: str
    description: Annotated[str | None, Field(max_length=20)] = None
    completed: bool = 0


class TaskSchema(TaskAddSchema):
    id: int


@app.post("/tasks", tags=['tasks'], status_code=201)
async def create_task(task: TaskAddSchema, session: SessionDep):
    new_task = TaskModel(
        title=task.title,
        description=task.description,
        completed=task.completed
    )
    session.add(new_task)
    await session.commit()
    return {"ok": True}


@app.patch("/tasks/{task_id}", tags=['tasks'])
async def update_task(task_id: int, session: SessionDep):
    query = select(TaskModel).where(TaskModel.id == task_id)
    result = await session.execute(query)
    task: TaskModel = result.scalar_one_or_none()
    task.completed = True
    await session.commit()
    return {"ok": True}


@app.delete("/tasks/{task_id}", tags=['tasks'])
async def delete_task(task_id: int, session: SessionDep):
    query = delete(TaskModel).where(TaskModel.id == task_id)
    await session.execute(query)
    await session.commit()
    return {"ok": True}


@app.get("/tasks", tags=['tasks'], status_code=200)
async def get_tasks(session: SessionDep, test: str):
    query = select(TaskModel)
    result = await session.execute(query)
    return result.scalars().all()


if __name__ == "__main__":
    uvicorn.run("main:app", reload=True)
