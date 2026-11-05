CREATE DATABASE IF NOT EXISTS pet_care_db;
USE pet_care_db;

CREATE TABLE IF NOT EXISTS owners (
    owner_id INT AUTO_INCREMENT PRIMARY KEY,
    owner_name VARCHAR(100) NOT NULL,
    phone VARCHAR(15),
    email VARCHAR(100),
    address VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS pets (
    pet_id INT AUTO_INCREMENT PRIMARY KEY,
    pet_name VARCHAR(100) NOT NULL,
    species VARCHAR(50),
    breed VARCHAR(50),
    age INT,
    owner_id INT,
    FOREIGN KEY (owner_id) REFERENCES owners(owner_id)
);

CREATE TABLE IF NOT EXISTS appointments (
    appointment_id INT AUTO_INCREMENT PRIMARY KEY,
    pet_id INT,
    appointment_date DATE,
    appointment_time TIME,
    reason VARCHAR(255),
    status VARCHAR(50),
    FOREIGN KEY (pet_id) REFERENCES pets(pet_id)
);

CREATE TABLE IF NOT EXISTS medical_records (
    record_id INT AUTO_INCREMENT PRIMARY KEY,
    pet_id INT,
    diagnosis VARCHAR(255),
    treatment VARCHAR(255),
    medication VARCHAR(255),
    record_date DATE,
    FOREIGN KEY (pet_id) REFERENCES pets(pet_id)
);