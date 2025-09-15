CREATE TABLE roles (
    name VARCHAR(30) PRIMARY KEY
);

INSERT INTO roles (name) VALUES ('ADMIN'), ('THERAPIST');

CREATE TABLE users (
    id UUID PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(30) NOT NULL REFERENCES roles(name),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE patients (
    id UUID PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(120),
    phone VARCHAR(30),
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TYPE appointment_status AS ENUM ('SCHEDULED','CONFIRMED','CANCELLED','DONE');

CREATE TABLE appointments (
    id UUID PRIMARY KEY,
    therapist_id UUID NOT NULL REFERENCES users(id),
    patient_id UUID NOT NULL REFERENCES patients(id),
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'SCHEDULED',
    location VARCHAR(120),
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TYPE payment_status AS ENUM ('PENDING','PAID','LATE');

CREATE TABLE payments (
    id UUID PRIMARY KEY,
    appointment_id UUID NOT NULL REFERENCES appointments(id),
    amount NUMERIC(10,2) NOT NULL,
    method VARCHAR(30),
    status payment_status NOT NULL DEFAULT 'PENDING',
    due_date DATE,
    paid_at TIMESTAMP
);

CREATE TABLE clinical_records (
    id UUID PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES patients(id),
    therapist_id UUID NOT NULL REFERENCES users(id),
    notes TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE notification_logs (
    id UUID PRIMARY KEY,
    channel VARCHAR(20) NOT NULL, -- EMAIL | WHATSAPP
    to_address VARCHAR(120) NOT NULL,
    subject VARCHAR(160),
    body TEXT,
    error TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP NOT NULL DEFAULT now()
);
