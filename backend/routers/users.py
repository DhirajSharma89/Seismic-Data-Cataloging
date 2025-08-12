from fastapi import APIRouter, HTTPException, status
from passlib.context import CryptContext
import mysql.connector
from database import get_field_data_conn # Assuming users table is in field_data

router = APIRouter(prefix="/users", tags=["Users"])

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

@router.post("/signup", status_code=status.HTTP_201_CREATED)
async def signup_user(user_data: dict):
    """
    Registers a new user with name, ID (CPF No.), password, and user type.
    Hashes the password before storing.
    """
    name = user_data.get("name")
    cpf_no = user_data.get("cpf_no") # Correctly receive 'cpf_no' from frontend
    password = user_data.get("password")
    user_type = user_data.get("user_type") # Correctly receive 'user_type' from frontend

    if not all([name, cpf_no, password, user_type]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="All fields (name, ID, password, user type) are required."
        )

    # UPDATED: User types to match frontend and requisition logic
    allowed_user_types = ["admin", "data_entry", "read_only_l1", "read_only_l2", "read_only_l3"]
    if user_type not in allowed_user_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid user type provided. Allowed types: {', '.join(allowed_user_types)}"
        )

    hashed_password = get_password_hash(password)

    conn = None
    cursor = None
    try:
        conn = get_field_data_conn() # Connect to the database where 'users' table is
        cursor = conn.cursor()

        # Check if CPF No. already exists
        cursor.execute("SELECT COUNT(*) FROM users WHERE cpf_no = %s", (cpf_no,))
        if cursor.fetchone()[0] > 0:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="User with this ID (CPF No.) already exists."
            )

        query = """
            INSERT INTO users (name, cpf_no, password_hash, user_type)
            VALUES (%s, %s, %s, %s)
        """
        values = (name, cpf_no, hashed_password, user_type)

        cursor.execute(query, values)
        conn.commit()
        return {"message": "User registered successfully!"}

    except mysql.connector.Error as err:
        print(f"MySQL Database Error in signup_user: {err}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database error: {err}")
    except Exception as e:
        print(f"Unexpected error in signup_user: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Internal server error: {e}")
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

@router.post("/login")
async def login_user(user_data: dict):
    """
    Authenticates a user based on ID (CPF No.) and password.
    Returns user type, name, and ID (CPF No.) on successful login.
    """
    cpf_no = user_data.get("cpf_no") # Correctly receive 'cpf_no' from frontend
    password = user_data.get("password")

    if not all([cpf_no, password]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="ID (CPF No.) and password are required."
        )

    conn = None
    cursor = None
    try:
        conn = get_field_data_conn() # Connect to the database where 'users' table is
        cursor = conn.cursor(dictionary=True) # Return rows as dictionaries

        cursor.execute("SELECT * FROM users WHERE cpf_no = %s", (cpf_no,))
        user = cursor.fetchone()

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect ID or password."
            )

        if not verify_password(password, user["password_hash"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect ID or password."
            )

        # Successful login: Return user type, name, and ID (cpf_no)
        return {
            "message": "Login successful!",
            "user_type": user["user_type"],
            "name": user["name"],
            "id": user["cpf_no"] # NEW: Return cpf_no as 'id'
        }

    except mysql.connector.Error as err:
        print(f"MySQL Database Error in login_user: {err}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database error: {err}")
    except Exception as e:
        print(f"Unexpected error in login_user: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Internal server error: {e}")
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
