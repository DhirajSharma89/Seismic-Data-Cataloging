from fastapi import APIRouter, HTTPException
import mysql.connector # Ensure mysql.connector is imported
from database import get_field_data_conn

router = APIRouter(prefix="/acquisition", tags=["Acquisition"])

@router.post("")
def create_acquisition(data: dict):
    try:
        conn = get_field_data_conn()
        cursor = conn.cursor()

        query = """
            INSERT INTO acquisition_data (
                survey_id, acquisition_id, data_acq_by, record_length, samp_rate,
                no_of_channel, type_of_shooting, source_type, shot_interval,
                shot_line_interval, group_interval, data_received_from,
                date_of_received, receival_interval, receiver_line_interval,
                floor_location, acq_bin_size, acq_issued, acq_issue_date,
                acq_issue_details, file_name, file_size, file_type,
                file_content, remarks, copex_status
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
                    %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """

        values = (
            data["survey_id"], data["acquisition_id"], data["data_acq_by"], data["record_length"],
            data["samp_rate"], data["no_of_channel"], data["type_of_shooting"], data["source_type"],
            data["shot_interval"], data["shot_line_interval"], data["group_interval"],
            data["data_received_from"], data["date_of_received"], data["receival_interval"],
            data["receiver_line_interval"], data["floor_location"], data["acq_bin_size"],
            data["acq_issued"], data["acq_issue_date"], data["acq_issue_details"],
            data["file_name"], data["file_size"], data["file_type"], data["file_content"],
            data["remarks"], data["copex_status"]
        )

        cursor.execute(query, values)
        conn.commit()
        return {"message": "Acquisition data inserted successfully"}

    except mysql.connector.Error as err: # Catch specific MySQL errors
        print(f"MySQL Database Error in create_acquisition: {err}")
        raise HTTPException(status_code=500, detail=f"Database error: {err}")
    except Exception as e:
        print(f"Unexpected error in create_acquisition: {e}")
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        if cursor: # Ensure cursor exists before closing
            cursor.close()
        if conn: # Ensure conn exists before closing
            conn.close()

@router.get("/count") # This will be /acquisition/count due to the prefix
async def get_acquisition_count():
    """
    Returns the total count of records in the 'acquisition_data' table.
    Connects to the 'field_data' database.
    """
    conn = None
    cursor = None
    try:
        conn = get_field_data_conn()
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM acquisition_data") # Using your table name
        count = cursor.fetchone()[0]
        return {"count": count}
    except mysql.connector.Error as err:
        print(f"Error in /acquisition/count: {err}")
        raise HTTPException(status_code=500, detail=f"Database error: {err}")
    except Exception as e:
        print(f"Unexpected error in /acquisition/count: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

@router.get("/ids")
def get_acquisition_ids():
    """
    Fetches a list of all existing acquisition_ids from the acquisition_data table.
    """
    conn = None
    cursor = None
    try:
        conn = get_field_data_conn()
        cursor = conn.cursor()
        # Select only the acquisition_id column
        cursor.execute("SELECT acquisition_id FROM acquisition_data ORDER BY acquisition_id")
        # Fetch all results and extract the acquisition_id from each tuple
        acquisition_ids = [row[0] for row in cursor.fetchall()]
        return {"acquisition_ids": acquisition_ids}
    except mysql.connector.Error as err:
        print(f"MySQL Database Error in get_acquisition_ids: {err}")
        raise HTTPException(status_code=500, detail=f"Database error: {err}")
    except Exception as e:
        print(f"Unexpected error in get_acquisition_ids: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
