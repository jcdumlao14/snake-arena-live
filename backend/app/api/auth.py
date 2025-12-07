from datetime import datetime, timedelta, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
import bcrypt
import uuid
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas import User, AuthCredentials, AuthResponse
from app.database import get_db
import app.crud as crud


router = APIRouter(prefix="/auth", tags=["Auth"])

# Configuration
SECRET_KEY = "supersecretkeyformockdev" # In production, use env var
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def verify_password(plain_password, hashed_password):
    # keys are stored as strings in mock db, bcrypt needs bytes
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def get_password_hash(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = await crud.get_user_by_username(db, username)
    if user is None:
        raise credentials_exception
    return user

@router.post("/login", response_model=AuthResponse)
async def login(credentials: AuthCredentials, db: AsyncSession = Depends(get_db)):
    user = await crud.get_user_by_email(db, credentials.email)
    if not user:
        # Check if maybe they sent username in email field (common pattern), but spec says email format.
        # Strict adherence to spec: check email.
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    stored_hash = await crud.get_password_hash(db, credentials.email)
    if not verify_password(credentials.password, stored_hash):
         raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return AuthResponse(user=user, token=access_token)

@router.post("/signup", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def signup(credentials: AuthCredentials, db: AsyncSession = Depends(get_db)):
    if not credentials.username:
        raise HTTPException(status_code=400, detail="Username required for signup")
        
    try:
        new_user = User(
            id=str(uuid.uuid4()),
            username=credentials.username,
            email=credentials.email,
            createdAt=datetime.now(timezone.utc)
        )
        hashed_pw = get_password_hash(credentials.password)
        await crud.create_user(db, new_user, hashed_pw)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": new_user.username}, expires_delta=access_token_expires
    )
    return AuthResponse(user=new_user, token=access_token)

@router.post("/logout")
async def logout(current_user: User = Depends(get_current_user)):
    # Stateless JWT logout is handled on client side usually by discarding token.
    return {"description": "Successfully logged out"}

@router.get("/me", response_model=User)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

