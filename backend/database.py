import mysql.connector

def get_field_data_conn():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="bitchImbacK@69",
        database="field_data"
    )

def get_processing_data_conn():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="bitchImbacK@69",
        database="processing_data"
    )

def get_interpretation_data_conn():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="bitchImbacK@69",
        database="interpretation_data"
    )
