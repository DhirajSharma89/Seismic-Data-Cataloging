from fastapi import APIRouter, HTTPException
import mysql.connector # Import mysql.connector
from database import get_field_data_conn

router = APIRouter(prefix="/blocks", tags=["Blocks"])

@router.post("")
def create_block(data: dict):
    try:
        conn = get_field_data_conn()
        cursor = conn.cursor()

        query = """
            INSERT INTO block_data (
                block_id, block_name, basin_name, block_type, environment, off_type,
                block_status, area, effective_date, block_duration, relinquish_date,
                admin_basin, operator, current_phase, original_area, current_phase_area,
                file_name
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """

        values = (
            data["block_id"], data["block_name"], data["basin_name"], data["block_type"],
            data["environment"], data["off_type"], data["block_status"], data["area"],
            data["effective_date"], data["block_duration"], data["relinquish_date"],
            data["admin_basin"], data["operator"], data["current_phase"],
            data["original_area"], data["current_phase_area"], data["file_name"]
        )

        cursor.execute(query, values)
        conn.commit()
        return {"message": "Block data inserted successfully"}

    except mysql.connector.Error as err: # Catch specific MySQL errors
        print(f"MySQL Database Error in create_block: {err}")
        raise HTTPException(status_code=500, detail=f"Database error: {err}")
    except Exception as e:
        print(f"Unexpected error in create_block: {e}")
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        if cursor: # Ensure cursor is closed only if it was opened
            cursor.close()
        if conn: # Ensure connection is closed only if it was opened
            conn.close()

@router.get("/count")
def get_block_count():
    try:
        conn = get_field_data_conn()
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM block_data")
        count = cursor.fetchone()[0]
        return {"count": count}
    except mysql.connector.Error as err: # Catch specific MySQL errors
        print(f"MySQL Database Error in get_block_count: {err}")
        raise HTTPException(status_code=500, detail=f"Database error: {err}")
    except Exception as e:
        print(f"Unexpected error in get_block_count: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

@router.get("/ids")
def get_block_ids():
    """
    Fetches a list of all existing block_ids from the block_data table.
    """
    conn = None
    cursor = None
    try:
        conn = get_field_data_conn()
        cursor = conn.cursor()
        # Select only the block_id column
        cursor.execute("SELECT block_id FROM block_data ORDER BY block_id")
        # Fetch all results and extract the block_id from each tuple
        block_ids = [row[0] for row in cursor.fetchall()]
        return {"block_ids": block_ids}
    except mysql.connector.Error as err:
        print(f"MySQL Database Error in get_block_ids: {err}")
        raise HTTPException(status_code=500, detail=f"Database error: {err}")
    except Exception as e:
        print(f"Unexpected error in get_block_ids: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
