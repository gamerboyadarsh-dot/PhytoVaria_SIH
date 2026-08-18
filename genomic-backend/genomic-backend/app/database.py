"""
Database setup using SQLModel (SQLAlchemy + Pydantic combined).
Using SQLite for now — switch DATABASE_URL to a Postgres URL later
(e.g. "postgresql://user:pass@host/dbname") with zero other code changes.
"""
from sqlmodel import SQLModel, create_engine, Session

DATABASE_URL = "sqlite:///./genomic_app.db"

# check_same_thread=False is only needed for SQLite
engine = create_engine(DATABASE_URL, echo=True, connect_args={"check_same_thread": False})


def create_db_and_tables():
    """Call this once on app startup to create all tables from models.py"""
    SQLModel.metadata.create_all(engine)


def get_session():
    """FastAPI dependency — yields a DB session per request"""
    with Session(engine) as session:
        yield session
