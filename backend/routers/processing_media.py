from fastapi import APIRouter, HTTPException
import mysql.connector # Ensure mysql.connector is imported
from database import get_field_data_conn, get_processing_data_conn # Keep both imports

router = APIRouter(prefix="/processing-media", tags=["Processing Media"])

@router.post("")
def create_processing_media(data: dict):
    try:
        conn = get_processing_data_conn() # Correctly uses processing_data_conn
        cursor = conn.cursor()

        query = """
            INSERT INTO processing_media_data (
                pro_serial_num, processing_id, processing_media_id, pre_post_identifier,
                cart_number, org_cart_number, line_name, file_seq_no, fcdp, lcdp, fsp,
                lsp, first_inline, last_inline, first_xline, last_xline, floor_location,
                box, rack, shelf, date_cat, data_type, data_format, catalog_by,
                media_type, original_copy, archival_media_id, remarks, qc_done_yes_no,
                qc_done_by, status, dam_status, transcrp_tape_yn, transcrp_yr,
                transcribed_by_wc
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
                    %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
                    %s, %s, %s, %s, %s, %s, %s, %s)
        """

        values = (
            data["pro_serial_num"], data["processing_id"], data["processing_media_id"],
            data["pre_post_identifier"], data["cart_number"], data["org_cart_number"],
            data["line_name"], data["file_seq_no"], data["fcdp"], data["lcdp"],
            data["fsp"], data["lsp"], data["first_inline"], data["last_inline"],
            data["first_xline"], data["last_xline"], data["floor_location"],
            data["box"], data["rack"], data["shelf"], data["date_cat"],
            data["data_type"], data["data_format"], data["catalog_by"],
            data["media_type"], data["original_copy"], data["archival_media_id"],
            data["remarks"], data["qc_done_yes_no"], data["qc_done_by"],
            data["status"], data["dam_status"], data["transcrp_tape_yn"],
            data["transcrp_yr"], data["transcribed_by_wc"]
        )

        cursor.execute(query, values)
        conn.commit()
        return {"message": "Processing media data inserted successfully"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        if cursor: # Added check for cursor existence
            cursor.close()
        if conn: # Added check for conn existence
            conn.close()

@router.get("/count")
async def get_processing_media_count():
    """
    Returns the total count of records in the 'processing_media_data' table.
    Connects to the 'processing_data' database.
    """
    conn = None # Initialize conn to None
    cursor = None # Initialize cursor to None
    try:
        # FIX: Changed to get_processing_data_conn() to match where data is inserted
        conn = get_processing_data_conn()
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM processing_media_data")
        count = cursor.fetchone()[0]
        return {"count": count}
    except mysql.connector.Error as err:
        print(f"Error in /processing-media/count: {err}")
        raise HTTPException(status_code=500, detail=f"Database error: {err}")
    except Exception as e:
        print(f"Unexpected error in /processing-media/count: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {e}")
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
