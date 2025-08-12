from fastapi import APIRouter, HTTPException
from database import get_interpretation_data_conn

router = APIRouter(prefix="/interpretation-media", tags=["Interpretation Media"])

@router.post("")
def create_interpretation_media(data: dict):
    try:
        conn = get_interpretation_data_conn()
        cursor = conn.cursor()

        query = """
            INSERT INTO interpretation_media_data (
                integ_media_id, survey_id, integ_id, BarCode, MediaType, ContentsOfMedia,
                DataFormat, Rack, Shelf, Box, Remarks, floor_location, status, dam_status,
                org_cart_number, archival_media_id, transcrp_tape_yn, transcrp_yr,
                transcribed_by_wc, date_cat, catalog_by, original_copy
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
                    %s, %s, %s, %s, %s, %s, %s, %s)
        """

        values = (
            data["integ_media_id"], data["survey_id"], data["integ_id"], data["BarCode"],
            data["MediaType"], data["ContentsOfMedia"], data["DataFormat"], data["Rack"],
            data["Shelf"], data["Box"], data["Remarks"], data["floor_location"],
            data["status"], data["dam_status"], data["org_cart_number"],
            data["archival_media_id"], data["transcrp_tape_yn"], data["transcrp_yr"],
            data["transcribed_by_wc"], data["date_cat"], data["catalog_by"],
            data["original_copy"]
        )

        cursor.execute(query, values)
        conn.commit()
        return {"message": "Interpretation media data inserted successfully"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        cursor.close()
        conn.close()
