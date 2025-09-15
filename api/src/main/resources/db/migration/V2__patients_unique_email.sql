ALTER TABLE patients
    ADD CONSTRAINT uq_patients_email UNIQUE (email);
