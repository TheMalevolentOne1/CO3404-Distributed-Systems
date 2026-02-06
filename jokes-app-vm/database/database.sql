CREATE DATABASE jokes_db;
USE jokes_db;

CREATE TABLE types (
    id INT PRIMARY KEY,
    type_name VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX id_type_name (type_name)
);

CREATE TABLE jokes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setup TEXT NOT NULL,
    punchline TEXT NOT NULL,
    type_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (type_id) REFERENCES types(id) ON DELETE CASCADE,
    INDEX id_type_id (type_id)
);

SELECT * FROM types JOIN jokes ON types.id = jokes.type_id;