from database import engine
from sqlalchemy import text

with engine.connect() as conn:
    try:
        conn.execute(text("ALTER TABLE paciente_profiles DROP COLUMN nombre_completo"))
        conn.execute(text("ALTER TABLE paciente_profiles ADD COLUMN nombre VARCHAR DEFAULT '' NOT NULL"))
        conn.execute(text("ALTER TABLE paciente_profiles ADD COLUMN apellido VARCHAR DEFAULT '' NOT NULL"))
        conn.commit()
        print("Columns updated successfully!")
    except Exception as e:
        print(f"Error: {e}")
