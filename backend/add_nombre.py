from database import engine
from sqlalchemy import text

with engine.connect() as conn:
    try:
        conn.execute(text("ALTER TABLE paciente_profiles ADD COLUMN nombre_completo VARCHAR DEFAULT '' NOT NULL"))
        conn.commit()
        print("Column added successfully!")
    except Exception as e:
        print(f"Error: {e}")
