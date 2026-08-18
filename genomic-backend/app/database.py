"""
Database setup using SQLModel (SQLAlchemy + Pydantic combined).
DATABASE_URL can be overridden via environment variable for production (PostgreSQL).
"""
import os
from sqlmodel import SQLModel, create_engine, Session

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./phytovaria.db")

# check_same_thread=False is only needed for SQLite
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(
    DATABASE_URL,
    echo=os.getenv("DB_ECHO", "false").lower() == "true",
    connect_args=connect_args,
)


def create_db_and_tables():
    """Call once on app startup to create all tables defined in models.py"""
    SQLModel.metadata.create_all(engine)


def get_session():
    """FastAPI dependency — yields a DB session per request"""
    with Session(engine) as session:
        yield session
