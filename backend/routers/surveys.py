from fastapi import APIRouter, HTTPException
import mysql.connector # Ensure mysql.connector is imported
from database import get_field_data_conn

router = APIRouter(prefix="/surveys", tags=["Surveys"])

@router.post("")
def create_survey(data: dict):
    try:
        conn = get_field_data_conn()
        cursor = conn.cursor()

        query = """
            INSERT INTO survey_data (
                block_id, survey_id, survey_lib_no, survey_name, survey_environ,
                survey_area, survey_area_km, sig_no, company, type_of_data,
                year_of_acquisition, survey_type, multi_block, multi_block_details, remarks
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """

        values = (
            data["block_id"], data["survey_id"], data["survey_lib_no"], data["survey_name"],
            data["survey_environ"], data["survey_area"], data["survey_area_km"],
            data["sig_no"], data["company"], data["type_of_data"], data["year_of_acquisition"],
            data["survey_type"], data["multi_block"], data["multi_block_details"], data["remarks"]
        )

        cursor.execute(query, values)
        conn.commit()
        return {"message": "Survey data inserted successfully"}

    except mysql.connector.Error as err: # Catch specific MySQL errors
        print(f"MySQL Database Error in create_survey: {err}")
        raise HTTPException(status_code=500, detail=f"Database error: {err}")
    except Exception as e:
        print(f"Unexpected error in create_survey: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

@router.get("/count")
def get_survey_count():
    try:
        conn = get_field_data_conn()
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM survey_data")
        count = cursor.fetchone()[0]
        return {"count": count}
    except mysql.connector.Error as err: # Catch specific MySQL errors
        print(f"MySQL Database Error in get_survey_count: {err}")
        raise HTTPException(status_code=500, detail=f"Database error: {err}")
    except Exception as e:
        print(f"Unexpected error in get_survey_count: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

@router.get("/ids")
def get_survey_ids():
    """
    Fetches a list of all existing survey_ids from the survey_data table.
    """
    conn = None
    cursor = None
    try:
        conn = get_field_data_conn()
        cursor = conn.cursor()
        # Select only the survey_id column
        cursor.execute("SELECT survey_id FROM survey_data ORDER BY survey_id")
        # Fetch all results and extract the survey_id from each tuple
        survey_ids = [row[0] for row in cursor.fetchall()]
        return {"survey_ids": survey_ids}
    except mysql.connector.Error as err:
        print(f"MySQL Database Error in get_survey_ids: {err}")
        raise HTTPException(status_code=500, detail=f"Database error: {err}")
    except Exception as e:
        print(f"Unexpected error in get_survey_ids: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
