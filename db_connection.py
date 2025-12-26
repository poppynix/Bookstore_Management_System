from dotenv import load_dotenv
import mysql.connector
import os

load_dotenv()  

def get_db_connection():
    try:
        connection = mysql.connector.connect(
            host="mysql-340ee5fd-alex-063.f.aivencloud.com",
            port="27371",
            user="avnadmin",
            password= os.getenv("DB_PASSWORD"),
            database="defaultdb",
            ssl_ca=os.path.join(os.path.dirname(__file__), 'ca.pem'),
            ssl_verify_cert=True
        )
        return connection
    except mysql.connector.Error as err:
        print(f"Error: {err}")
        return None

if __name__ == "__main__":
    conn = get_db_connection()
    if conn:
        print("Successfully connected to the Cloud Bookstore DB!")
        conn.close()