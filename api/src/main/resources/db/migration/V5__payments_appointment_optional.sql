-- Make appointment_id optional to allow standalone payments
ALTER TABLE payments ALTER COLUMN appointment_id DROP NOT NULL;
-- (Optional) If you want to allow payments not tied to an appointment without FK enforcement, comment/uncomment below:
-- ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_appointment_id_fkey;