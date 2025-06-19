-- SQL script to add a foreign key constraint between users and program_studi tables

-- First check if the constraint already exists and drop it if it does
SET @dbname = 'lapor_kampus';
SET @tablename = 'users';
SET @constraintname = 'fk_program_studi';

SELECT IF(
    EXISTS(
        SELECT * FROM information_schema.TABLE_CONSTRAINTS
        WHERE CONSTRAINT_SCHEMA = @dbname
        AND TABLE_NAME = @tablename
        AND CONSTRAINT_NAME = @constraintname
    ),
    CONCAT('ALTER TABLE ', @tablename, ' DROP FOREIGN KEY ', @constraintname, ';'),
    'SELECT 1'
) INTO @sqlstmt;

PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Now add the foreign key constraint
ALTER TABLE users
ADD CONSTRAINT fk_program_studi
FOREIGN KEY (program_studi_code) 
REFERENCES program_studi(code)
ON DELETE SET NULL
ON UPDATE CASCADE;

-- Grant all privileges on database to root user (adjust if needed)
GRANT ALL PRIVILEGES ON lapor_kampus.* TO 'root'@'localhost';
FLUSH PRIVILEGES;
