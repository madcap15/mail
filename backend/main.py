# backend/main.py
import os
import time
from datetime import timedelta

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr
from sqlalchemy import create_engine, Column, Integer, String, ForeignKey, TIMESTAMP, func
from sqlalchemy.orm import sessionmaker, relationship, declarative_base
from sqlalchemy.exc import IntegrityError
from passlib.context import CryptContext

from auth import create_access_token, get_current_user, verify_password, get_password_hash

# --- Database Setup ---
DATABASE_URL = "postgresql://sogo:dev_sogo_pass@sogo-postgresql/sogo"
Base = declarative_base()
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
dovecot_pwd_context = CryptContext(schemes=["sha512_crypt"], deprecated="auto")

# --- SQLAlchemy Models ---
class Domain(Base):
    __tablename__ = "domains"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    users = relationship("User", back_populates="domain")

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    domain_id = Column(Integer, ForeignKey("domains.id"), nullable=False)
    domain = relationship("Domain", back_populates="users")

class Admin(Base):
    __tablename__ = "admins"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)

# --- Pydantic Models ---
class DomainCreate(BaseModel):
    domain_name: str

class DomainInfo(BaseModel):
    name: str
    class Config:
        orm_mode = True

class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserInfo(BaseModel):
    email: EmailStr
    class Config:
        orm_mode = True

class Token(BaseModel):
    access_token: str
    token_type: str

# --- FastAPI App Initialization ---
app = FastAPI()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.on_event("startup")
def on_startup():
    # Wait for the database to be ready
    retries = 10
    while retries > 0:
        try:
            engine.connect()
            print("Database connection successful.")
            break
        except Exception as e:
            print(f"Database not ready yet, retrying... ({retries} left)")
            retries -= 1
            time.sleep(3)
    
    Base.metadata.create_all(bind=engine)
    
    # Create initial domain and user if they don't exist
    db = SessionLocal()
    try:
        initial_domain_name = os.environ.get("SOGO_MAIL_DOMAIN", "example.com")
        domain = db.query(Domain).filter(Domain.name == initial_domain_name).first()
        if not domain:
            print(f"Creating initial domain: {initial_domain_name}")
            domain = Domain(name=initial_domain_name)
            db.add(domain)
            db.commit()
            db.refresh(domain)

        initial_user_email = f"admin@{initial_domain_name}"
        user = db.query(User).filter(User.email == initial_user_email).first()
        if not user:
            print(f"Creating initial mail user: {initial_user_email}")
            hashed_password = dovecot_pwd_context.hash("adminpass")
            user = User(email=initial_user_email, password=hashed_password, domain_id=domain.id)
            db.add(user)
            db.commit()
    finally:
        db.close()

# --- Endpoints ---
@app.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: SessionLocal = Depends(get_db)):
    admin = db.query(Admin).filter(Admin.username == form_data.username).first()
    if not admin or not verify_password(form_data.password, admin.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )
    access_token = create_access_token(data={"sub": admin.username})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/domains", response_model=list[DomainInfo])
def get_domains(current_user: dict = Depends(get_current_user), db: SessionLocal = Depends(get_db)):
    return db.query(Domain).all()

@app.post("/domains")
def create_domain(domain: DomainCreate, current_user: dict = Depends(get_current_user), db: SessionLocal = Depends(get_db)):
    db_domain = Domain(name=domain.domain_name)
    try:
        db.add(db_domain)
        db.commit()
        db.refresh(db_domain)
        return db_domain
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Domain already exists")

@app.get("/users", response_model=list[UserInfo])
def get_users(current_user: dict = Depends(get_current_user), db: SessionLocal = Depends(get_db)):
    return db.query(User).all()

@app.post("/users")
def create_user(user: UserCreate, current_user: dict = Depends(get_current_user), db: SessionLocal = Depends(get_db)):
    domain_name = user.email.split('@')[1]
    domain = db.query(Domain).filter(Domain.name == domain_name).first()
    if not domain:
        raise HTTPException(status_code=400, detail=f"Domain '{domain_name}' does not exist.")
    
    hashed_password = dovecot_pwd_context.hash(user.password)
    db_user = User(email=user.email, password=hashed_password, domain_id=domain.id)
    
    try:
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="User with this email already exists")
