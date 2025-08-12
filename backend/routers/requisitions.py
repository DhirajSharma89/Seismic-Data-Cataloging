import mysql.connector
from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import json
from datetime import date, datetime

# Import your database connection utility
from database import get_field_data_conn # Assuming your database.py is in the backend root

router = APIRouter(
    prefix="/requisitions",
    tags=["requisitions"],
)

# Pydantic models for request and response validation
class DataType(BaseModel):
    slNo: int
    typeOfData: str
    slNoRequired: str
    dataObserver: str
    projectObjective: str
    remarks: str

class SlNoData(BaseModel):
    slNo: int
    description: str
    mobileNo: str
    designation: str

class RequisitionFormCreate(BaseModel):
    subject: str
    dateOfRequisition: Optional[date] = None
    projectDistrict: Optional[str] = None
    sheet: Optional[str] = None
    remark: Optional[str] = None
    dataTypes: List[DataType]
    slNoData: List[SlNoData]
    preparedBySignature: Optional[str] = None
    preparedByDesignation: Optional[str] = None
    groupCoordinatorSignature: Optional[str] = None
    groupCoordinatorDesignation: Optional[str] = None
    # No status field here, it's set by the backend on creation/approval

class RequisitionFormResponse(RequisitionFormCreate):
    id: int
    requester_user_id: Optional[str] = None
    current_approval_status: str
    l2_approver_id: Optional[str] = None
    l2_approval_date: Optional[str] = None # Changed to str for consistency with isoformat()
    l2_comments: Optional[str] = None
    l3_approver_id: Optional[str] = None
    l3_approval_date: Optional[str] = None # Changed to str for consistency with isoformat()
    l3_comments: Optional[str] = None
    created_at: str # Changed to str for consistency with isoformat()

class ApprovalRequest(BaseModel):
    approver_id: str
    comments: Optional[str] = None

@router.get("/", response_model=List[RequisitionFormResponse])
async def get_all_requisitions(
    user_role: str = Query(..., description="Role of the requesting user"),
    user_id: str = Query(..., description="ID of the requesting user")
):
    """
    Fetches requisition forms based on the user's role and approval status.
    """
    conn = None
    cursor = None
    try:
        conn = get_field_data_conn()
        cursor = conn.cursor(dictionary=True) # Return results as dictionaries

        query = "SELECT * FROM requisition_forms WHERE 1=1"
        params = []

        if user_role == "admin":
            # Admin sees all forms
            pass
        elif user_role == "data_entry":
            # Data Entry (L1) sees all forms they submitted
            query += " AND requester_user_id = %s"
            params.append(user_id)
        elif user_role == "read_only_l2":
            # Level 2 sees forms pending their approval, and those they have approved/declined
            query += " AND (current_approval_status = 'Pending_L2_Approval' OR l2_approver_id = %s)"
            params.append(user_id)
        elif user_role == "read_only_l3":
            # Level 3 sees forms approved by L2, and those they have approved/declined
            query += " AND (current_approval_status = 'L2_Approved' OR l3_approver_id = %s)"
            params.append(user_id)
        elif user_role == "read_only_l1":
            # Read-Only Level 1 sees only forms they submitted, regardless of final status
            query += " AND requester_user_id = %s"
            params.append(user_id)
        else:
            # For any other roles, return nothing or only fully approved ones
            # This case might need refinement based on exact requirements for unmapped roles
            query += " AND current_approval_status = 'L3_Approved'" # Default for unknown roles

        query += " ORDER BY created_at DESC"
        cursor.execute(query, params)
        requisitions = cursor.fetchall()

        # Deserialize JSON fields and format dates
        for req in requisitions:
            req['dataTypes'] = json.loads(req['data_types_json']) if req.get('data_types_json') else []
            req['slNoData'] = json.loads(req['sl_no_data_json']) if req.get('sl_no_data_json') else []

            # Format datetime objects to ISO strings for JSON serialization
            req['dateOfRequisition'] = req['date_of_requisition'].isoformat() if req.get('date_of_requisition') else None
            req['l2_approval_date'] = req['l2_approval_date'].isoformat() if req.get('l2_approval_date') else None
            req['l3_approval_date'] = req['l3_approval_date'].isoformat() if req.get('l3_approval_date') else None
            req['created_at'] = req['created_at'].isoformat() if req.get('created_at') else None

            # Map SQL column names to frontend camelCase
            req['projectDistrict'] = req.pop('project_district')
            req['preparedBySignature'] = req.pop('prepared_by_signature')
            req['preparedByDesignation'] = req.pop('prepared_by_designation')
            req['groupCoordinatorSignature'] = req.pop('group_coordinator_signature')
            req['groupCoordinatorDesignation'] = req.pop('group_coordinator_designation')
            req['requester_user_id'] = req.pop('requester_user_id')
            req['current_approval_status'] = req.pop('current_approval_status')
            req['l2_approver_id'] = req.pop('l2_approver_id')
            req['l2_comments'] = req.pop('l2_comments')
            req['l3_approver_id'] = req.pop('l3_approver_id')
            req['l3_comments'] = req.pop('l3_comments')

            # Remove raw JSON fields
            req.pop('data_types_json', None)
            req.pop('sl_no_data_json', None)

        return requisitions
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=f"Database error: {err}")
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

# NEW: Endpoint to get a single requisition by ID
@router.get("/{requisition_id}", response_model=RequisitionFormResponse)
async def get_requisition_by_id(requisition_id: int):
    """
    Fetches a single requisition form by its ID.
    """
    conn = None
    cursor = None
    try:
        conn = get_field_data_conn()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM requisition_forms WHERE id = %s", (requisition_id,))
        requisition = cursor.fetchone()

        if not requisition:
            raise HTTPException(status_code=404, detail="Requisition form not found.")

        # Deserialize JSON fields and format dates
        requisition['dataTypes'] = json.loads(requisition['data_types_json']) if requisition.get('data_types_json') else []
        requisition['slNoData'] = json.loads(requisition['sl_no_data_json']) if requisition.get('sl_no_data_json') else []

        # Format datetime objects to ISO strings for JSON serialization
        requisition['dateOfRequisition'] = requisition['date_of_requisition'].isoformat() if requisition.get('date_of_requisition') else None
        requisition['l2_approval_date'] = requisition['l2_approval_date'].isoformat() if requisition.get('l2_approval_date') else None
        requisition['l3_approval_date'] = requisition['l3_approval_date'].isoformat() if requisition.get('l3_approval_date') else None
        requisition['created_at'] = requisition['created_at'].isoformat() if requisition.get('created_at') else None

        # Map SQL column names to frontend camelCase
        requisition['projectDistrict'] = requisition.pop('project_district')
        requisition['preparedBySignature'] = requisition.pop('prepared_by_signature')
        requisition['preparedByDesignation'] = requisition.pop('prepared_by_designation')
        requisition['groupCoordinatorSignature'] = requisition.pop('group_coordinator_signature')
        requisition['groupCoordinatorDesignation'] = requisition.pop('group_coordinator_designation')
        requisition['requester_user_id'] = requisition.pop('requester_user_id')
        requisition['current_approval_status'] = requisition.pop('current_approval_status')
        requisition['l2_approver_id'] = requisition.pop('l2_approver_id')
        requisition['l2_comments'] = requisition.pop('l2_comments')
        requisition['l3_approver_id'] = requisition.pop('l3_approver_id')
        requisition['l3_comments'] = requisition.pop('l3_comments')

        # Remove raw JSON fields
        requisition.pop('data_types_json', None)
        requisition.pop('sl_no_data_json', None)

        return requisition
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=f"Database error: {err}")
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

@router.post("/", response_model=RequisitionFormResponse, status_code=201)
async def create_requisition(requisition: RequisitionFormCreate, requester_id: str = Query(..., description="ID of the user creating the requisition")):
    """
    Creates a new requisition form with initial status 'Pending_L2_Approval'.
    Only Admin and Data Entry roles should call this.
    """
    conn = None
    cursor = None
    try:
        conn = get_field_data_conn()
        cursor = conn.cursor(dictionary=True) # Return results as dictionaries

        data_types_json_str = json.dumps([dt.dict() for dt in requisition.dataTypes])
        sl_no_data_json_str = json.dumps([sld.dict() for sld in requisition.slNoData])

        query = """
        INSERT INTO requisition_forms (
            subject, date_of_requisition, project_district, sheet, remark,
            data_types_json, sl_no_data_json,
            prepared_by_signature, prepared_by_designation,
            group_coordinator_signature, group_coordinator_designation,
            requester_user_id, current_approval_status
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        values = (
            requisition.subject,
            requisition.dateOfRequisition,
            requisition.projectDistrict,
            requisition.sheet,
            requisition.remark,
            data_types_json_str,
            sl_no_data_json_str,
            requisition.preparedBySignature,
            requisition.preparedByDesignation,
            requisition.groupCoordinatorSignature,
            requisition.groupCoordinatorDesignation,
            requester_id, # Store the requester's ID
            "Pending_L2_Approval" # Initial status
        )
        cursor.execute(query, values)
        conn.commit()

        requisition_id = cursor.lastrowid
        # Fetch the newly created record as a dictionary
        cursor.execute(
            "SELECT * FROM requisition_forms WHERE id = %s", (requisition_id,)
        )
        new_requisition = cursor.fetchone() # This will be a dictionary now

        if new_requisition:
            # Format datetime objects to ISO strings for JSON serialization
            new_requisition['dateOfRequisition'] = new_requisition['date_of_requisition'].isoformat() if new_requisition.get('date_of_requisition') else None
            new_requisition['l2_approval_date'] = new_requisition['l2_approval_date'].isoformat() if new_requisition.get('l2_approval_date') else None
            new_requisition['l3_approval_date'] = new_requisition['l3_approval_date'].isoformat() if new_requisition.get('l3_approval_date') else None
            new_requisition['created_at'] = new_requisition['created_at'].isoformat() if new_requisition.get('created_at') else None

            # Deserialize JSON fields
            new_requisition['dataTypes'] = json.loads(new_requisition['data_types_json']) if new_requisition.get('data_types_json') else []
            new_requisition['slNoData'] = json.loads(new_requisition['sl_no_data_json']) if new_requisition.get('sl_no_data_json') else []

            # Map SQL column names to frontend camelCase from the dictionary
            new_requisition['projectDistrict'] = new_requisition.pop('project_district')
            new_requisition['preparedBySignature'] = new_requisition.pop('prepared_by_signature')
            new_requisition['preparedByDesignation'] = new_requisition.pop('prepared_by_designation')
            new_requisition['groupCoordinatorSignature'] = new_requisition.pop('group_coordinator_signature')
            new_requisition['groupCoordinatorDesignation'] = new_requisition.pop('group_coordinator_designation')
            new_requisition['requester_user_id'] = new_requisition.pop('requester_user_id')
            new_requisition['current_approval_status'] = new_requisition.pop('current_approval_status')
            new_requisition['l2_approver_id'] = new_requisition.pop('l2_approver_id')
            new_requisition['l2_comments'] = new_requisition.pop('l2_comments')
            new_requisition['l3_approver_id'] = new_requisition.pop('l3_approver_id')
            new_requisition['l3_comments'] = new_requisition.pop('l3_comments')

            # Remove raw JSON fields
            new_requisition.pop('data_types_json', None)
            new_requisition.pop('sl_no_data_json', None)

            return new_requisition
        else:
            raise HTTPException(status_code=500, detail="Failed to retrieve created requisition.")

    except mysql.connector.Error as err:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {err}")
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {e}")
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

@router.patch("/{requisition_id}/approve_l2", response_model=RequisitionFormResponse)
async def approve_requisition_l2(
    requisition_id: int,
    approval_data: ApprovalRequest,
    user_role: str = Query(..., description="Role of the approving user"),
    user_id: str = Query(..., description="ID of the approving user")
):
    """
    Approves a requisition at Level 2.
    Requires 'read_only_l2' role.
    """
    if user_role != "read_only_l2" and user_role != "admin": # Admin can also approve L2
        raise HTTPException(status_code=403, detail="Not authorized to perform Level 2 approval.")

    conn = None
    cursor = None
    try:
        conn = get_field_data_conn()
        cursor = conn.cursor(dictionary=True) # Return results as dictionaries

        # Check current status
        cursor.execute("SELECT current_approval_status FROM requisition_forms WHERE id = %s", (requisition_id,))
        current_status_row = cursor.fetchone()
        if not current_status_row:
            raise HTTPException(status_code=404, detail="Requisition form not found.")
        if current_status_row['current_approval_status'] != "Pending_L2_Approval":
            raise HTTPException(status_code=400, detail=f"Requisition is not pending Level 2 approval. Current status: {current_status_row['current_approval_status']}")

        query = """
        UPDATE requisition_forms
        SET current_approval_status = 'L2_Approved',
            l2_approver_id = %s,
            l2_approval_date = %s,
            l2_comments = %s
        WHERE id = %s
        """
        values = (user_id, datetime.now(), approval_data.comments, requisition_id)
        cursor.execute(query, values)
        conn.commit()

        # Fetch updated record as a dictionary
        cursor.execute(
            "SELECT * FROM requisition_forms WHERE id = %s", (requisition_id,)
        )
        updated_requisition = cursor.fetchone()

        if updated_requisition:
            # Format datetime objects to ISO strings for JSON serialization
            updated_requisition['dateOfRequisition'] = updated_requisition['date_of_requisition'].isoformat() if updated_requisition.get('date_of_requisition') else None
            updated_requisition['l2_approval_date'] = updated_requisition['l2_approval_date'].isoformat() if updated_requisition.get('l2_approval_date') else None
            updated_requisition['l3_approval_date'] = updated_requisition['l3_approval_date'].isoformat() if updated_requisition.get('l3_approval_date') else None
            updated_requisition['created_at'] = updated_requisition['created_at'].isoformat() if updated_requisition.get('created_at') else None

            # Deserialize JSON fields
            updated_requisition['dataTypes'] = json.loads(updated_requisition['data_types_json']) if updated_requisition.get('data_types_json') else []
            updated_requisition['slNoData'] = json.loads(updated_requisition['sl_no_data_json']) if updated_requisition.get('sl_no_data_json') else []

            # Map SQL column names to frontend camelCase
            updated_requisition['projectDistrict'] = updated_requisition.pop('project_district')
            updated_requisition['preparedBySignature'] = updated_requisition.pop('prepared_by_signature')
            updated_requisition['preparedByDesignation'] = updated_requisition.pop('prepared_by_designation')
            updated_requisition['groupCoordinatorSignature'] = updated_requisition.pop('group_coordinator_signature')
            updated_requisition['groupCoordinatorDesignation'] = updated_requisition.pop('group_coordinator_designation')
            updated_requisition['requester_user_id'] = updated_requisition.pop('requester_user_id')
            updated_requisition['current_approval_status'] = updated_requisition.pop('current_approval_status')
            updated_requisition['l2_approver_id'] = updated_requisition.pop('l2_approver_id')
            updated_requisition['l2_comments'] = updated_requisition.pop('l2_comments')
            updated_requisition['l3_approver_id'] = updated_requisition.pop('l3_approver_id')
            updated_requisition['l3_comments'] = updated_requisition.pop('l3_comments')

            # Remove raw JSON fields
            updated_requisition.pop('data_types_json', None)
            updated_requisition.pop('sl_no_data_json', None)

            return updated_requisition
        else:
            raise HTTPException(status_code=500, detail="Failed to retrieve updated requisition.")

    except mysql.connector.Error as err:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {err}")
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {e}")
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

@router.patch("/{requisition_id}/decline_l2", response_model=RequisitionFormResponse)
async def decline_requisition_l2(
    requisition_id: int,
    approval_data: ApprovalRequest,
    user_role: str = Query(..., description="Role of the declining user"),
    user_id: str = Query(..., description="ID of the declining user")
):
    """
    Declines a requisition at Level 2.
    Requires 'read_only_l2' role.
    """
    if user_role != "read_only_l2" and user_role != "admin": # Admin can also decline L2
        raise HTTPException(status_code=403, detail="Not authorized to perform Level 2 decline.")

    conn = None
    cursor = None
    try:
        conn = get_field_data_conn()
        cursor = conn.cursor(dictionary=True) # Return results as dictionaries

        cursor.execute("SELECT current_approval_status FROM requisition_forms WHERE id = %s", (requisition_id,))
        current_status_row = cursor.fetchone()
        if not current_status_row:
            raise HTTPException(status_code=404, detail="Requisition form not found.")
        if current_status_row['current_approval_status'] != "Pending_L2_Approval":
            raise HTTPException(status_code=400, detail=f"Requisition is not pending Level 2 approval. Current status: {current_status_row['current_approval_status']}")

        query = """
        UPDATE requisition_forms
        SET current_approval_status = 'L2_Declined',
            l2_approver_id = %s,
            l2_approval_date = %s,
            l2_comments = %s
        WHERE id = %s
        """
        values = (user_id, datetime.now(), approval_data.comments, requisition_id)
        cursor.execute(query, values)
        conn.commit()

        # Fetch updated record as a dictionary
        cursor.execute(
            "SELECT * FROM requisition_forms WHERE id = %s", (requisition_id,)
        )
        updated_requisition = cursor.fetchone()

        if updated_requisition:
            # Format datetime objects to ISO strings for JSON serialization
            updated_requisition['dateOfRequisition'] = updated_requisition['date_of_requisition'].isoformat() if updated_requisition.get('date_of_requisition') else None
            updated_requisition['l2_approval_date'] = updated_requisition['l2_approval_date'].isoformat() if updated_requisition.get('l2_approval_date') else None
            updated_requisition['l3_approval_date'] = updated_requisition['l3_approval_date'].isoformat() if updated_requisition.get('l3_approval_date') else None
            updated_requisition['created_at'] = updated_requisition['created_at'].isoformat() if updated_requisition.get('created_at') else None

            # Deserialize JSON fields
            updated_requisition['dataTypes'] = json.loads(updated_requisition['data_types_json']) if updated_requisition.get('data_types_json') else []
            updated_requisition['slNoData'] = json.loads(updated_requisition['sl_no_data_json']) if updated_requisition.get('sl_no_data_json') else []

            # Map SQL column names to frontend camelCase
            updated_requisition['projectDistrict'] = updated_requisition.pop('project_district')
            updated_requisition['preparedBySignature'] = updated_requisition.pop('prepared_by_signature')
            updated_requisition['preparedByDesignation'] = updated_requisition.pop('prepared_by_designation')
            updated_requisition['groupCoordinatorSignature'] = updated_requisition.pop('group_coordinator_signature')
            updated_requisition['groupCoordinatorDesignation'] = updated_requisition.pop('group_coordinator_designation')
            updated_requisition['requester_user_id'] = updated_requisition.pop('requester_user_id')
            updated_requisition['current_approval_status'] = updated_requisition.pop('current_approval_status')
            updated_requisition['l2_approver_id'] = updated_requisition.pop('l2_approver_id')
            updated_requisition['l2_comments'] = updated_requisition.pop('l2_comments')
            updated_requisition['l3_approver_id'] = updated_requisition.pop('l3_approver_id')
            updated_requisition['l3_comments'] = updated_requisition.pop('l3_comments')

            # Remove raw JSON fields
            updated_requisition.pop('data_types_json', None)
            updated_requisition.pop('sl_no_data_json', None)

            return updated_requisition
        else:
            raise HTTPException(status_code=500, detail="Failed to retrieve updated requisition.")

    except mysql.connector.Error as err:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {err}")
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {e}")
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


@router.patch("/{requisition_id}/approve_l3", response_model=RequisitionFormResponse)
async def approve_requisition_l3(
    requisition_id: int,
    approval_data: ApprovalRequest,
    user_role: str = Query(..., description="Role of the approving user"),
    user_id: str = Query(..., description="ID of the approving user")
):
    """
    Approves a requisition at Level 3 (GMS).
    Requires 'read_only_l3' role.
    """
    if user_role != "read_only_l3" and user_role != "admin": # Admin can also approve L3
        raise HTTPException(status_code=403, detail="Not authorized to perform Level 3 approval.")

    conn = None
    cursor = None
    try:
        conn = get_field_data_conn()
        cursor = conn.cursor(dictionary=True) # Return results as dictionaries

        cursor.execute("SELECT current_approval_status FROM requisition_forms WHERE id = %s", (requisition_id,))
        current_status_row = cursor.fetchone()
        if not current_status_row:
            raise HTTPException(status_code=404, detail="Requisition form not found.")
        if current_status_row['current_approval_status'] != "L2_Approved":
            raise HTTPException(status_code=400, detail=f"Requisition is not pending Level 3 approval. Current status: {current_status_row['current_approval_status']}")

        query = """
        UPDATE requisition_forms
        SET current_approval_status = 'L3_Approved',
            l3_approver_id = %s,
            l3_approval_date = %s,
            l3_comments = %s
        WHERE id = %s
        """
        values = (user_id, datetime.now(), approval_data.comments, requisition_id)
        cursor.execute(query, values)
        conn.commit()

        # Fetch updated record as a dictionary
        cursor.execute(
            "SELECT * FROM requisition_forms WHERE id = %s", (requisition_id,)
        )
        updated_requisition = cursor.fetchone()

        if updated_requisition:
            # Format datetime objects to ISO strings for JSON serialization
            updated_requisition['dateOfRequisition'] = updated_requisition['date_of_requisition'].isoformat() if updated_requisition.get('date_of_requisition') else None
            updated_requisition['l2_approval_date'] = updated_requisition['l2_approval_date'].isoformat() if updated_requisition.get('l2_approval_date') else None
            updated_requisition['l3_approval_date'] = updated_requisition['l3_approval_date'].isoformat() if updated_requisition.get('l3_approval_date') else None
            updated_requisition['created_at'] = updated_requisition['created_at'].isoformat() if updated_requisition.get('created_at') else None

            # Deserialize JSON fields
            updated_requisition['dataTypes'] = json.loads(updated_requisition['data_types_json']) if updated_requisition.get('data_types_json') else []
            updated_requisition['slNoData'] = json.loads(updated_requisition['sl_no_data_json']) if updated_requisition.get('sl_no_data_json') else []

            # Map SQL column names to frontend camelCase
            updated_requisition['projectDistrict'] = updated_requisition.pop('project_district')
            updated_requisition['preparedBySignature'] = updated_requisition.pop('prepared_by_signature')
            updated_requisition['preparedByDesignation'] = updated_requisition.pop('prepared_by_designation')
            updated_requisition['groupCoordinatorSignature'] = updated_requisition.pop('group_coordinator_signature')
            updated_requisition['groupCoordinatorDesignation'] = updated_requisition.pop('group_coordinator_designation')
            updated_requisition['requester_user_id'] = updated_requisition.pop('requester_user_id')
            updated_requisition['current_approval_status'] = updated_requisition.pop('current_approval_status')
            updated_requisition['l2_approver_id'] = updated_requisition.pop('l2_approver_id')
            updated_requisition['l2_comments'] = updated_requisition.pop('l2_comments')
            updated_requisition['l3_approver_id'] = updated_requisition.pop('l3_approver_id')
            updated_requisition['l3_comments'] = updated_requisition.pop('l3_comments')

            # Remove raw JSON fields
            updated_requisition.pop('data_types_json', None)
            updated_requisition.pop('sl_no_data_json', None)

            return updated_requisition
        else:
            raise HTTPException(status_code=500, detail="Failed to retrieve updated requisition.")

    except mysql.connector.Error as err:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {err}")
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {e}")
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


@router.patch("/{requisition_id}/decline_l3", response_model=RequisitionFormResponse)
async def decline_requisition_l3(
    requisition_id: int,
    approval_data: ApprovalRequest,
    user_role: str = Query(..., description="Role of the declining user"),
    user_id: str = Query(..., description="ID of the declining user")
):
    """
    Declines a requisition at Level 3 (GMS).
    Requires 'read_only_l3' role.
    """
    if user_role != "read_only_l3" and user_role != "admin": # Admin can also decline L3
        raise HTTPException(status_code=403, detail="Not authorized to perform Level 3 decline.")

    conn = None
    cursor = None
    try:
        conn = get_field_data_conn()
        cursor = conn.cursor(dictionary=True) # Return results as dictionaries

        cursor.execute("SELECT current_approval_status FROM requisition_forms WHERE id = %s", (requisition_id,))
        current_status_row = cursor.fetchone()
        if not current_status_row:
            raise HTTPException(status_code=404, detail="Requisition form not found.")
        if current_status_row['current_approval_status'] != "L2_Approved":
            raise HTTPException(status_code=400, detail=f"Requisition is not pending Level 3 approval. Current status: {current_status_row['current_approval_status']}")

        query = """
        UPDATE requisition_forms
        SET current_approval_status = 'L3_Declined',
            l3_approver_id = %s,
            l3_approval_date = %s,
            l3_comments = %s
        WHERE id = %s
        """
        values = (user_id, datetime.now(), approval_data.comments, requisition_id)
        cursor.execute(query, values)
        conn.commit()

        # Fetch updated record as a dictionary
        cursor.execute(
            "SELECT * FROM requisition_forms WHERE id = %s", (requisition_id,)
        )
        updated_requisition = cursor.fetchone()

        if updated_requisition:
            # Format datetime objects to ISO strings for JSON serialization
            updated_requisition['dateOfRequisition'] = updated_requisition['date_of_requisition'].isoformat() if updated_requisition.get('date_of_requisition') else None
            updated_requisition['l2_approval_date'] = updated_requisition['l2_approval_date'].isoformat() if updated_requisition.get('l2_approval_date') else None
            updated_requisition['l3_approval_date'] = updated_requisition['l3_approval_date'].isoformat() if updated_requisition.get('l3_approval_date') else None
            updated_requisition['created_at'] = updated_requisition['created_at'].isoformat() if updated_requisition.get('created_at') else None

            # Deserialize JSON fields
            updated_requisition['dataTypes'] = json.loads(updated_requisition['data_types_json']) if updated_requisition.get('data_types_json') else []
            updated_requisition['slNoData'] = json.loads(updated_requisition['sl_no_data_json']) if updated_requisition.get('sl_no_data_json') else []

            # Map SQL column names to frontend camelCase
            updated_requisition['projectDistrict'] = updated_requisition.pop('project_district')
            updated_requisition['preparedBySignature'] = updated_requisition.pop('prepared_by_signature')
            updated_requisition['preparedByDesignation'] = updated_requisition.pop('prepared_by_designation')
            updated_requisition['groupCoordinatorSignature'] = updated_requisition.pop('group_coordinator_signature')
            updated_requisition['groupCoordinatorDesignation'] = updated_requisition.pop('group_coordinator_designation')
            updated_requisition['requester_user_id'] = updated_requisition.pop('requester_user_id')
            updated_requisition['current_approval_status'] = updated_requisition.pop('current_approval_status')
            updated_requisition['l2_approver_id'] = updated_requisition.pop('l2_approver_id')
            updated_requisition['l2_comments'] = updated_requisition.pop('l2_comments')
            updated_requisition['l3_approver_id'] = updated_requisition.pop('l3_approver_id')
            updated_requisition['l3_comments'] = updated_requisition.pop('l3_comments')

            # Remove raw JSON fields
            updated_requisition.pop('data_types_json', None)
            updated_requisition.pop('sl_no_data_json', None)

            return updated_requisition
        else:
            raise HTTPException(status_code=500, detail="Failed to retrieve updated requisition.")

    except mysql.connector.Error as err:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {err}")
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {e}")
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
