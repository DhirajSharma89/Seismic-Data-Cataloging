from fastapi import APIRouter, HTTPException
import mysql.connector # Ensure mysql.connector is imported
from database import get_interpretation_data_conn

router = APIRouter(prefix="/interpretation", tags=["Interpretation"])

@router.post("")
def create_interpretation(data: dict):
    conn = None
    cursor = None
    try:
        conn = get_interpretation_data_conn()
        cursor = conn.cursor()

        query = """
            INSERT INTO interpretation_data (
                myindex, version, projTitle, sbasin, blockName, blockType, mygroup,
                objective, inputDataType, appSwUsed, interpretationYear, interpreter,
                mediaDetails, backupDetails, file, lkm, sqm, submittedOn, SubmittedBy,
                receivedOn, receivedBy, survey_id, multi_volume, multi_volume_details,
                TypeOfData
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
                    %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """

        values = (
            data["myindex"], data["version"], data["projTitle"], data["sbasin"],
            data["blockName"], data["blockType"], data["mygroup"], data["objective"],
            data["inputDataType"], data["appSwUsed"], data["interpretationYear"],
            data["interpreter"], data["mediaDetails"], data["backupDetails"],
            data["file"], data["lkm"], data["sqm"], data["submittedOn"],
            data["submittedBy"], data["receivedOn"], data["receivedBy"],
            data["survey_id"], data["multi_volume"], data["multi_volume_details"],
            data["TypeOfData"]
        )

        cursor.execute(query, values)
        conn.commit()
        return {"message": "Interpretation data inserted successfully"}

    except mysql.connector.Error as err:
        # This will catch database-specific errors and print them clearly
        print(f"MySQL Database Error in create_interpretation: {err}")
        raise HTTPException(status_code=500, detail=f"Database error: {err}")
    except KeyError as ke:
        # This will catch if a required key is missing from the incoming data
        print(f"Missing data key in create_interpretation: {ke}")
        raise HTTPException(status_code=400, detail=f"Missing data: {ke}. Please provide all required fields.")
    except Exception as e:
        # Catch any other unexpected errors
        print(f"Unexpected error in create_interpretation: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {e}")

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

@router.get("/count") # This will be /interpretation/count due to the prefix
async def get_interpretation_count():
    """
    Returns the total count of records in the 'interpretation_data' table.
    Connects to the 'interpretation_data' database.
    """
    conn = None
    cursor = None
    try:
        conn = get_interpretation_data_conn()
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM interpretation_data") # Using your table name
        count = cursor.fetchone()[0]
        return {"count": count}
    except mysql.connector.Error as err:
        print(f"Error in /interpretation/count: {err}")
        raise HTTPException(status_code=500, detail=f"Database error: {err}")
    except Exception as e:
        print(f"Unexpected error in /interpretation/count: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {e}")
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

@router.get("/ids")
def get_interpretation_ids():
    """
    Fetches a list of all existing interpretation_ids from the interpretation_data table.
    Returns an empty list if no data is found, or if the table does not exist,
    without raising a 500 Internal Server Error.
    """
    conn = None
    cursor = None
    try:
        conn = get_interpretation_data_conn()
        cursor = conn.cursor()
        # Select only the interpretation_id column
        cursor.execute("SELECT interpretation_id FROM interpretation_data ORDER BY interpretation_id")
        # Fetch all results and extract the interpretation_id from each tuple
        interpretation_ids = [row[0] for row in cursor.fetchall()]
        return {"interpretation_ids": interpretation_ids} # This will return [] if no rows are found
    except mysql.connector.Error as err: # Broaden to catch any mysql.connector.Error
        # Log the error for debugging purposes
        print(f"MySQL Database Error in get_interpretation_ids: {err}. Returning empty list gracefully.")
        # Return an empty list to the frontend instead of raising a 500 error
        return {"interpretation_ids": []}
    except Exception as e:
        # This catches any other unexpected Python errors
        print(f"Unexpected error in get_interpretation_ids: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {e}")
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
