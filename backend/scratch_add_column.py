from database import engine
from sqlalchemy import text

with engine.connect() as conn:
    try:
        conn.execute(text("ALTER TABLE psicologo_profiles ADD COLUMN moneda VARCHAR DEFAULT 'CLP' NOT NULL"))
        conn.commit()
        print("Column added successfully!")
    except Exception as e:
        print(f"Error: {e}")
