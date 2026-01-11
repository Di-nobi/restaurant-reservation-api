CREATE DATABASE IF NOT EXISTS restaurants;

CREATE USER IF NOT EXISTS 'user'@'localhost'
IDENTIFIED BY 'Password$2026';

GRANT ALL PRIVILEGES
ON restaurants.*
TO 'user'@'localhost';

FLUSH PRIVILEGES;
