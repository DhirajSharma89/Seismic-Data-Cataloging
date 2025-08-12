from fastapi import APIRouter, HTTPException
import mysql.connector # Ensure mysql.connector is imported
from database import get_processing_data_conn

router = APIRouter(prefix="/processing", tags=["Processing"])

@router.post("")
def create_processing(data: dict):
    try:
        conn = get_processing_data_conn()
        cursor = conn.cursor()

        query = """
            INSERT INTO processing_data (
                survey_id, processing_id, version, data_processed_by, processing_year,
                processing_centre_name, received_from, date_of_receiving,
                processing_software, bin_size, sampling_interval, fold,
                record_length, multi_volume, multi_volume_details, reprocessing_done,
                proc_issued, proc_issue_date, proc_issue_details, processing_type,
                file_name, file_size, file_type, file_content, remarks
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
                    %s, %s, %s, %s, %s, %s, %s,
                    %s, %s, %s, %s, %s)
        """

        values = (
            data["survey_id"], data["processing_id"], data["version"], data["data_processed_by"],
            data["processing_year"], data["processing_centre_name"], data["received_from"],
            data["date_of_receiving"], data["processing_software"], data["bin_size"],
            data["sampling_interval"], data["fold"], data["record_length"],
            data["multi_volume"], data["multi_volume_details"], data["reprocessing_done"],
            data["proc_issued"], data["proc_issue_date"], data["proc_issue_details"],
            data["processing_type"], data["file_name"], data["file_size"],
            data["file_type"], data["file_content"], data["remarks"]
        )

        cursor.execute(query, values)
        conn.commit()
        return {"message": "Processing data inserted successfully"}

    except mysql.connector.Error as err: # Catch specific MySQL errors
        print(f"MySQL Database Error in create_processing: {err}")
        raise HTTPException(status_code=500, detail=f"Database error: {err}")
    except Exception as e:
        print(f"Unexpected error in create_processing: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

@router.get("/count") # This will be /processing/count due to the prefix
async def get_processing_count():
    """
    Returns the total count of records in the 'processing_data' table.
    Connects to the 'processing_data' database.
    """
    conn = None
    cursor = None
    try:
        conn = get_processing_data_conn()
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM processing_data") # Using your table name
        count = cursor.fetchone()[0]
        return {"count": count}
    except mysql.connector.Error as err:
        print(f"Error in /processing/count: {err}")
        raise HTTPException(status_code=500, detail=f"Database error: {err}")
    except Exception as e:
        print(f"Unexpected error in /processing/count: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {e}")
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

@router.get("/ids")
def get_processing_ids():
    """
    Fetches a list of all existing processing_ids from the processing_data table.
    Returns an empty list if no data is found, without raising an error.
    """
    conn = None
    cursor = None
    try:
        conn = get_processing_data_conn()
        cursor = conn.cursor()
        # Select only the processing_id column
        cursor.execute("SELECT processing_id FROM processing_data ORDER BY processing_id")
        # Fetch all results and extract the processing_id from each tuple
        processing_ids = [row[0] for row in cursor.fetchall()]
        return {"processing_ids": processing_ids} # Return an empty list if no rows are found
    except mysql.connector.Error as err:
        # Log the error but do not raise an HTTPException here.
        # This allows the frontend to receive an empty list or a specific error message
        # that it can handle gracefully (e.g., displaying "Failed to load IDs" if needed).
        # For now, we'll let the frontend handle the error if it gets a 500.
        # If the goal is to *always* return 200 OK with an empty list on no data,
        # then the try-except should be around the fetchall() and return [] on error.
        # However, a 500 indicates a deeper problem (e.g., table doesn't exist).
        print(f"MySQL Database Error in get_processing_ids: {err}")
        raise HTTPException(status_code=500, detail=f"Database error: {err}")
    except Exception as e:
        print(f"Unexpected error in get_processing_ids: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {e}")
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
