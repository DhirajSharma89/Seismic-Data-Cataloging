from fastapi import APIRouter, HTTPException
from database import get_field_data_conn

router = APIRouter(prefix="/acquisition-media", tags=["Acquisition Media"])

@router.post("")
def create_acquisition_media(data: dict):
    try:
        conn = get_field_data_conn()
        cursor = conn.cursor()

        query = """
            INSERT INTO acquisition_media_data (
                acq_serial_num, acquisition_id, acquisition_media_id, cart_number, line_name,
                org_cart_number, fsp, lsp, ff, lf, rack, box, shelf, date_cat, media_type,
                data_type, data_format, original_copy, archival_media_id, catalog_by,
                remarks, qc_done_yes_no, qc_done_by, status, dam_status,
                transcrp_tape_yn, transcrp_yr, transcribed_by_wc, copex_status
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
                    %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
                    %s, %s, %s, %s)
        """

        values = (
            data["acq_serial_num"], data["acquisition_id"], data["acquisition_media_id"], data["cart_number"],
            data["line_name"], data["org_cart_number"], data["fsp"], data["lsp"],
            data["ff"], data["lf"], data["rack"], data["box"], data["shelf"],
            data["date_cat"], data["media_type"], data["data_type"], data["data_format"],
            data["original_copy"], data["archival_media_id"], data["catalog_by"],
            data["remarks"], data["qc_done_yes_no"], data["qc_done_by"], data["status"],
            data["dam_status"], data["transcrp_tape_yn"], data["transcrp_yr"],
            data["transcribed_by_wc"], data["copex_status"]
        )

        cursor.execute(query, values)
        conn.commit()
        return {"message": "Acquisition media data inserted successfully"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        cursor.close()
        conn.close()
