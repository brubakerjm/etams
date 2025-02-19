# Setting Up the Backend and Database for Docker Compose

## Overview
This guide details the steps to set up the **Spring Boot backend** and **Database** using Docker Compose. It ensures that the backend and database are properly containerized and can communicate.

---

## **1. Create the `docker-compose.yml` File**

Inside the root directory of the project, create or update `docker-compose.yml` with the following configuration:

```yaml

services:
  mysql:
    image: yobasystems/alpine-mariadb
    container_name: etams-mysql
    restart: always
    environment:
      MYSQL_DATABASE: etams
      MYSQL_USER: etamsapp
      MYSQL_PASSWORD: etamsapp
      MYSQL_ROOT_PASSWORD: password
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
      - ./db-init:/docker-entrypoint-initdb.d

  backend:
    build:
      context: ./back-end/etams
      dockerfile: Dockerfile
    container_name: etams-backend
    restart: always
    depends_on:
      - mysql
    environment:
      SPRING_DATASOURCE_URL: jdbc:mysql://mysql:3306/etams?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
      SPRING_DATASOURCE_USERNAME: etamsapp
      SPRING_DATASOURCE_PASSWORD: etamsapp
    ports:
      - "8080:8080"
    volumes:
      - ./back-end/etams/logs:/app/logs

volumes:
  mysql_data:
```

### **Explanation of Key Components:**
- **MySQL Service (`mysql`)**
    - Uses the latest MariaDB image.
    - Creates a database named `etams`.
    - Exposes MariaDB on port **3306**.
    - Mounts a volume to persist database data.
    - Mounts the `db-init` folder to execute initialization scripts automatically.
    - 

- **Backend Service (`backend`)**
    - Builds the Spring Boot backend from `./back-end/etams/Dockerfile`.
    - Maps port **8080** from the container to the host.
    - Uses **environment variables** for database connection.
    - Mounts a `logs` directory for log persistence.
    - **Depends on** MariaDB to ensure it starts first.

---

## **2. Create the MySQL Initialization Script**

Inside the `db-init/` folder (create it if it doesn’t exist), add a file named `init-db.sql` with the following content:

```sql
-- Notes:
-- 1. Default admin account:
--      Username: etamsapp
--      Password: etamsapp
-- 2. Default non-admin account:
--      Username: etamsuser
--      Password: etamsapp
-- 3. Password hash '$2b$12$someHashedPasswordHere' is not a real password hash
-- 4. Employee and Task data variety is such that it includes data that will trigger form validations so error messages can be observed, 
--      more diverse data to filter, generate reports for, etc.
--
--      Additionally, there are two sets of Employee and Tasks data. One set will have created_at and updated_at timestamps and the other set will not.
--      These datasets are provided in the event the dates are needed to be uniform or if the dates are needed to imitate an established database.
--      Default is data with created_at and updated_at data.

-- Drop database if it already exists
DROP DATABASE IF EXISTS `etams`;

-- Create a new database
CREATE DATABASE `etams`;
USE `etams`;

-- Drop and recreate the Employees table
DROP TABLE IF EXISTS `employees`;
CREATE TABLE `employees` (
    `employee_id` INT AUTO_INCREMENT PRIMARY KEY,
    `username` VARCHAR(50) NOT NULL UNIQUE,
    `password_hash` VARCHAR(255) NOT NULL,
    `first_name` VARCHAR(50) NOT NULL,
    `last_name` VARCHAR(50) NOT NULL,
    `email` VARCHAR(100) NOT NULL UNIQUE,
    `role` VARCHAR(50) NOT NULL,
    `admin` BOOLEAN NOT NULL DEFAULT FALSE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

-- Drop and recreate the Tasks table
DROP TABLE IF EXISTS `tasks`;
CREATE TABLE `tasks` (
    `task_id` INT AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(100) NOT NULL,
    `description` TEXT,
    `status` ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED', 'UNASSIGNED') DEFAULT 'UNASSIGNED',
    `deadline` DATE,
    `assigned_employee_id` INT,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`assigned_employee_id`) REFERENCES `employees`(`employee_id`) ON DELETE SET NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

-- Create a user for the ETAMS application
CREATE USER IF NOT EXISTS 'etamsapp'@'localhost' IDENTIFIED BY 'etamsapp';

-- Grant privileges to the ETAMS user
GRANT SELECT, INSERT, UPDATE, DELETE ON `etams`.* TO 'etamsapp'@'localhost';

-- Insert sample data into the Employees table
-- Default users
INSERT INTO `employees` (username, password_hash, first_name, last_name, email, role, admin) VALUES
('etamsapp', '$2b$12$5IFImeKu0AOi5F47OCMYXejrRPUqfB.gNjIORyn5LE4ASurALpecu', 'Admin', 'Default', 'admin.default@email.com', 'Admin', TRUE),
('etamsuser', '$2b$12$5IFImeKu0AOi5F47OCMYXejrRPUqfB.gNjIORyn5LE4ASurALpecu', 'User', 'Default', 'user.default@email.com', 'User', FALSE);

-- Data without created_at and updated_at data
-- INSERT INTO `Employees` (username, password_hash, first_name, last_name, email, role, admin) VALUES
-- ('johndoe1', '$2b$12$someHashedPasswordHere', 'John', 'Doe', 'john.doe1@example.com', 'Software Engineer', FALSE),
-- ('janedoe1', '$2b$12$someHashedPasswordHere', 'Jane', 'Doe', 'j.doe@company.net', 'Data Scientist', FALSE),
-- ('petersmith', '$2b$12$someHashedPasswordHere', 'Peter', 'Smith', 'peters@workmail.org', 'Web Developer', FALSE),
-- ('sarahjones', '$2b$12$someHashedPasswordHere', 'Sarah', 'Jones', 'sarah_j@domain.co', 'UI Designer', FALSE),
-- ('davidbrown', '$2b$12$someHashedPasswordHere', 'David', 'Brown', 'dbrown123@email.io', 'Project Manager', TRUE),
-- ('emilywilson', '$2b$12$someHashedPasswordHere', 'Emily', 'Wilson', 'emily.w@corp.info', 'QA Tester', FALSE),
-- ('michaelgarcia', '$2b$12$someHashedPasswordHere', 'Michael', 'Garcia', 'mgarcia@mail.me', 'Database Admin', FALSE),
-- ('lindadavies', '$2b$12$someHashedPasswordHere', 'Linda', 'Davies', 'linda.d@provider.biz', 'System Analyst', FALSE),
-- ('christopherreyes', '$2b$12$someHashedPasswordHere', 'Christopher', 'Reyes', 'c.reyes@service.tv', 'Network Engineer', FALSE),
-- ('angelawilson', '$2b$12$someHashedPasswordHere', 'Angela', 'Wilson', 'awilson456@inbox.online', 'Security Engineer', FALSE),
-- ('matthewtaylor', '$2b$12$someHashedPasswordHere', 'Matthew', 'Taylor', 'mtaylor@web.site', 'DevOps Engineer', FALSE),
-- ('ashleyanderson', '$2b$12$someHashedPasswordHere', 'Ashley', 'Anderson', 'a.anderson@net.com', 'Product Manager', TRUE),
-- ('joshuathomas', '$2b$12$someHashedPasswordHere', 'Joshua', 'Thomas', 'jthomas@mail.com', 'Sales Manager', FALSE),
-- ('brianhernandez', '$2b$12$someHashedPasswordHere', 'Brian', 'Hernandez', 'brianh@email.com', 'Marketing Specialist', FALSE),
-- ('kevinmoore', '$2b$12$someHashedPasswordHere', 'Kevin', 'Moore', 'kmoore@domain.com', 'Financial Analyst', FALSE),
-- ('jessicawhite', '$2b$12$someHashedPasswordHere', 'Jessica', 'White', 'jwhite@company.com', 'HR Generalist', FALSE),
-- ('ryanclark', '$2b$12$someHashedPasswordHere', 'Ryan', 'Clark', 'rclark@work.com', 'Legal Counsel', TRUE),
-- ('kaylalewis', '$2b$12$someHashedPasswordHere', 'Kayla', 'Lewis', 'klewis@mail.net', 'Business Analyst', FALSE),
-- ('tylerhall', '$2b$12$someHashedPasswordHere', 'Tyler', 'Hall', 'thall@domain.net', 'IT Support', FALSE),
-- ('meganallen', '$2b$12$someHashedPasswordHere', 'Megan', 'Allen', 'mallen@company.net', 'Administrative Assistant', FALSE),
-- ('justinwalker', '$2b$12$someHashedPasswordHere', 'Justin', 'Walker', 'jwalker@work.org', 'Software Architect', TRUE),
-- ('nicoleperez', '$2b$12$someHashedPasswordHere', 'Nicole', 'Perez', 'nperez@mail.io', 'UX Researcher', FALSE),
-- ('williamking', '$2b$12$someHashedPasswordHere', 'William', 'King', 'wking@domain.info', 'Data Analyst', FALSE),
-- ('angelastewart', '$2b$12$someHashedPasswordHere', 'Angela', 'Stewart', 'a.stewart@net.co', 'Technical Writer', FALSE),
-- ('anthonywood', '$2b$12$someHashedPasswordHere', 'Anthony', 'Wood', 'awood@company.co', 'Project Coordinator', FALSE),
-- ('elizabethbaker', '$2b$12$someHashedPasswordHere', 'Elizabeth', 'Baker', 'e.baker@work.tv', 'Office Manager', TRUE),
-- ('joshuacook', '$2b$12$someHashedPasswordHere', 'Joshua', 'Cook', 'jcook@mail.me', 'Sales Representative', FALSE),
-- ('rebeccaward', '$2b$12$someHashedPasswordHere', 'Rebecca', 'Ward', 'r.ward@provider.biz', 'Customer Service Rep', FALSE),
-- ('patrickbell', '$2b$12$someHashedPasswordHere', 'Patrick', 'Bell', 'pbell@service.online', 'Account Manager', FALSE),
-- ('kellymurphy', '$2b$12$someHashedPasswordHere', 'Kelly', 'Murphy', 'k.murphy@inbox.site', 'Marketing Coordinator', FALSE),
-- ('charlesrivera', '$2b$12$someHashedPasswordHere', 'Charles', 'Rivera', 'crivera@web.site', 'IT Manager', TRUE),
-- ('lauriegray', '$2b$12$someHashedPasswordHere', 'Laurie', 'Gray', 'lgray@net.com', 'HR Manager', FALSE),
-- ('josephwatson', '$2b$12$someHashedPasswordHere', 'Joseph', 'Watson', 'jwatson@mail.com', 'Finance Manager', FALSE),
-- ('margaretsanchez', '$2b$12$someHashedPasswordHere', 'Margaret', 'Sanchez', 'm.sanchez@domain.com', 'Operations Manager', TRUE),
-- ('stevenmorris', '$2b$12$someHashedPasswordHere', 'Steven', 'Morris', 'smorris@company.com', 'CEO', TRUE),
-- ('sandradavis', '$2b$12$someHashedPasswordHere', 'Sandra', 'Davis', 'sdavis@work.com', 'COO', TRUE),
-- ('timothyrodriguez', '$2b$12$someHashedPasswordHere', 'Timothy', 'Rodriguez', 'trodriguez@mail.net', 'CTO', TRUE),
-- ('anitawilson', '$2b$12$someHashedPasswordHere', 'Anita', 'Wilson', 'awilson@domain.net', 'CIO', TRUE),
-- ('richardmartinez', '$2b$12$someHashedPasswordHere', 'Richard', 'Martinez', 'rmartinez@company.net', 'CFO', TRUE);

-- Data with created_at and updated_at data
INSERT INTO `employees` (username, password_hash, first_name, last_name, email, role, admin, created_at, updated_at) VALUES
('alicesmith', '$2b$12$someHashedPasswordHere', 'Alice', 'Smith', 'alice.smith@example.com', 'Software Engineer', FALSE, '2023-05-10 10:22:33', '2024-11-15 14:05:12'),
('bobjohnson', '$2b$12$someHashedPasswordHere', 'Bob', 'Johnson', 'bob.johnson@example.com', 'Data Analyst', FALSE, '2022-08-15 15:45:01', '2024-03-20 09:12:45'),
('cwilliams', '$2b$12$someHashedPasswordHere', 'Charlie', 'Williams', 'charlie.williams@example.com', 'Web Developer', FALSE, '2024-01-22 08:30:56', '2024-12-05 17:22:10'),
('dbrown', '$2b$12$someHashedPasswordHere', 'David', 'Brown', 'david.brown@example.com', 'Project Manager', TRUE, '2023-09-05 12:10:44', '2024-07-18 11:34:28'),
('edavis_2', '$2b$12$someHashedPasswordHere', 'Emily', 'Davis', 'emily.davis@example.com', 'QA Tester', FALSE, '2022-11-20 17:55:32', '2024-05-02 16:08:51'),
('fgarcia1', '$2b$12$someHashedPasswordHere', 'Frank', 'Garcia', 'frank.garcia@example.com', 'UI/UX Designer', FALSE, '2024-03-12 11:05:21', '2025-01-10 10:55:17'),
('gracerodriguez', '$2b$12$someHashedPasswordHere', 'Grace', 'Rodriguez', 'grace.rodriguez@example.com', 'DevOps Engineer', FALSE, '2023-06-28 14:32:18', '2024-09-25 13:40:35'),
('wilsonh4', '$2b$12$someHashedPasswordHere', 'Henry', 'Wilson', 'henry.wilson@example.com', 'Database Administrator', FALSE, '2022-12-10 09:45:06', '2024-06-11 08:52:49'),
('isabellam3', '$2b$12$someHashedPasswordHere', 'Isabella', 'Martinez', 'isabella.martinez@example.com', 'System Analyst', FALSE, '2024-05-08 16:20:53', '2025-02-03 15:33:26'),
('jacktaylor4', '$2b$12$someHashedPasswordHere', 'Jack', 'Taylor', 'jack.taylor@example.com', 'Network Engineer', FALSE, '2023-10-18 10:58:41', '2024-10-30 14:15:08'),
('kathrineanderson', '$2b$12$someHashedPasswordHere', 'Katherine', 'Anderson', 'katherine.anderson@example.com', 'Security Engineer', FALSE, '2023-02-05 13:25:29', '2024-08-22 09:38:55'),
('liamthomas', '$2b$12$someHashedPasswordHere', 'Liam', 'Thomas', 'liam.thomas@example.com', 'Product Manager', TRUE, '2022-07-25 18:10:17', '2024-04-15 12:52:31'),
('miaher', '$2b$12$someHashedPasswordHere', 'Mia', 'Hernandez', 'mia.hernandez@example.com', 'Sales Manager', FALSE, '2024-09-17 07:45:40', '2025-01-28 17:08:24'),
('nmoore', '$2b$12$someHashedPasswordHere', 'Noah', 'Moore', 'noah.moore@example.com', 'Marketing Specialist', FALSE, '2023-11-02 12:32:58', '2024-11-20 11:18:39'),
('oliviamartin', '$2b$12$someHashedPasswordHere', 'Olivia', 'Martin', 'olivia.martin@example.com', 'Financial Analyst', FALSE, '2023-04-14 15:08:36', '2024-10-05 16:42:13'),
('peterj', '$2b$12$someHashedPasswordHere', 'Peter', 'Jackson', 'peter.jackson@example.com', 'HR Generalist', FALSE, '2022-09-30 10:55:24', '2024-05-29 10:20:47'),
('quinn3', '$2b$12$someHashedPasswordHere', 'Quinn', 'Thompson', 'quinn.thompson@example.com', 'Legal Counsel', TRUE, '2024-06-05 18:40:11', '2024-12-18 13:05:59'),
('ryanwhite', '$2b$12$someHashedPasswordHere', 'Ryan', 'White', 'ryan.white@example.com', 'Business Analyst', FALSE, '2023-12-22 09:12:03', '2025-01-08 08:38:20'),
('sophia_harris', '$2b$12$someHashedPasswordHere', 'Sophia', 'Harris', 'sophia.harris@example.com', 'IT Support', FALSE, '2023-03-08 11:48:50', '2024-09-11 15:22:37'),
('thomas.sanchez', '$2b$12$someHashedPasswordHere', 'Thomas', 'Sanchez', 'thomas.sanchez@example.com', 'Administrative Assistant', FALSE, '2022-08-01 14:25:38', '2024-04-25 14:58:02'),
('uclark54', '$2b$12$someHashedPasswordHere', 'Ursula', 'Clark', 'ursula.clark@example.com', 'Software Architect', TRUE, '2024-10-24 17:10:26', '2025-02-17 10:33:45'),
('vincentlewis', '$2b$12$someHashedPasswordHere', 'Vincent', 'Lewis', 'vincent.lewis@example.com', 'UX Researcher', FALSE, '2023-01-15 08:58:15', '2024-08-08 09:05:32'),
('wendy', '$2b$12$someHashedPasswordHere', 'Wendy', 'Robinson', 'wendy.robinson@example.com', 'Data Analyst', FALSE, '2022-06-10 13:35:03', '2024-03-05 13:20:18'),
('xwalker', '$2b$12$someHashedPasswordHere', 'Xavier', 'Walker', 'xavier.walker@example.com', 'Technical Writer', FALSE, '2024-08-29 10:02:51', '2025-01-21 16:55:06'),
('yarap', '$2b$12$someHashedPasswordHere', 'Yara', 'Perez', 'yara.perez@example.com', 'Project Coordinator', FALSE, '2023-09-21 14:40:39', '2024-10-10 10:38:25'),
('zhall3', '$2b$12$someHashedPasswordHere', 'Zachary', 'Hall', 'zachary.hall@example.com', 'Office Manager', TRUE, '2023-05-03 17:25:16', '2024-11-08 14:02:41'),
('abigailyoung', '$2b$12$someHashedPasswordHere', 'Abigail', 'Young', 'abigail.young@example.com', 'Sales Representative', FALSE, '2022-10-17 12:10:04', '2024-06-03 11:45:58'),
('benjammin', '$2b$12$someHashedPasswordHere', 'Benjamin', 'Allen', 'benjamin.allen@example.com', 'Customer Service Rep', FALSE, '2024-02-20 09:55:42', '2024-12-11 17:30:23'),
('okay_2', '$2b$12$someHashedPasswordHere', 'Catherine', 'King', 'catherine.king@example.com', 'Account Manager', FALSE, '2023-08-09 16:32:30', '2024-09-20 13:18:09'),
('danielwright', '$2b$12$someHashedPasswordHere', 'Daniel', 'Wright', 'daniel.wright@example.com', 'Marketing Coordinator', FALSE, '2023-01-28 11:08:18', '2024-07-25 10:52:45'),
('lukewalker', '$2b$12$someHashedPasswordHere', 'Emma', 'Scott', 'emma.scott@example.com', 'IT Manager', TRUE, '2022-07-05 15:45:56', '2024-04-01 16:28:32'),
('haplo', '$2b$12$someHashedPasswordHere', 'Frederick', 'Green', 'frederick.green@example.com', 'HR Manager', FALSE, '2024-04-12 13:20:44', '2024-10-28 12:05:19'),
('shire', '$2b$12$someHashedPasswordHere', 'Gabrielle', 'Adams', 'gabrielle.adams@example.com', 'Finance Manager', FALSE, '2023-10-01 08:58:32', '2024-11-13 08:32:07'),
('sidmeyers', '$2b$12$someHashedPasswordHere', 'Harry', 'Baker', 'harry.baker@example.com', 'Operations Manager', TRUE, '2023-03-20 14:35:20', '2024-09-05 15:10:54'),
('halo_2', '$2b$12$someHashedPasswordHere', 'Irene', 'Gonzalez', 'irene.gonzalez@example.com', 'CEO', TRUE, '2022-09-15 10:12:09', '2024-05-18 10:48:36'),
('jamesdean', '$2b$12$someHashedPasswordHere', 'James', 'Nelson', 'james.nelson@example.com', 'COO', TRUE, '2024-01-08 17:55:47', '2024-11-27 13:33:12'),
('useruser', '$2b$12$someHashedPasswordHere', 'Kelly', 'Carter', 'kelly.carter@example.com', 'CTO', TRUE, '2023-06-22 12:40:35', '2024-08-15 12:15:50'),
('gavindance', '$2b$12$someHashedPasswordHere', 'Louis', 'Mitchell', 'louis.mitchell@example.com', 'CIO', TRUE, '2022-11-05 09:25:23', '2024-07-02 16:00:38'),
('coheed', '$2b$12$someHashedPasswordHere', 'Mary', 'Perez', 'mary.perez@example.com', 'CFO', TRUE, '2024-05-21 16:10:11', '2025-01-15 11:45:26'),
('rushfan', '$2b$12$someHashedPasswordHere', 'Nathan', 'Roberts', 'nathan.roberts@example.com', 'Legal Advisor', TRUE, '2023-08-18 10:58:00', '2024-10-08 14:32:47');


-- Insert sample data into the Tasks table
-- Data with created_at and updated_at data
INSERT INTO `tasks` (title, description, status, deadline, assigned_employee_id, created_at, updated_at) VALUES
('Project Kickoff', 'Organize the initial kickoff meeting for the new project.', 'PENDING', '2025-01-30', 3, '2025-01-01 09:00:00', '2025-01-02 15:45:00'),
('Code Review', 'Review the latest merge request and suggest improvements.', 'IN_PROGRESS', '2025-02-05', 4, '2025-01-10 14:20:00', '2025-01-20 10:30:00'),
('Overdue Compliance Audit', 'Conduct security audit of system access logs.', 'IN_PROGRESS', '2024-12-15', 10, '2024-10-05 11:45:00', '2024-12-01 17:20:00'),
('Customer Feature Request', 'Implement user-requested dark mode functionality.', 'COMPLETED', '2025-01-20', 6, '2025-01-05 08:15:00', '2025-01-18 19:10:00'),
('Database Migration', 'Migrate customer data from legacy system to cloud.', 'UNASSIGNED', '2025-03-01', NULL, '2025-02-01 13:10:00', NULL),
('Cybersecurity Review', 'Analyze recent security threats.', 'IN_PROGRESS', '2025-03-15', 10, '2025-02-12 09:30:00', '2025-02-14 11:50:00'),
('Cloud Infrastructure Setup', 'Deploy AWS/GCP infrastructure.', 'IN_PROGRESS', '2025-06-10', 14, '2025-03-22 15:10:00', '2025-03-30 12:15:00'),
('Server Load Testing', 'Ensure performance scalability.', 'PENDING', '2025-05-15', 5, '1990-02-28 14:00:00', NULL),
('Penetration Testing', 'Run simulated cyberattacks.', 'IN_PROGRESS', '2022-10-30', 10, '2025-07-01 10:20:00', '2025-08-15 16:45:00'),
('UX Testing', 'Gather user feedback on UI updates.', 'PENDING', '2025-02-28', 7, '2025-01-15 09:00:00', NULL),
('Mobile App Feature Addition', 'Add offline mode.', 'IN_PROGRESS', '2025-04-18', 6, '2025-02-10 13:45:00', '2025-02-28 16:30:00'),
('Mobile App Crash Fix', 'Investigate recurring crashes.', 'PENDING', '2024-07-25', 6, '2025-05-05 08:25:00', NULL),
('Customer Survey Analysis', 'Analyze customer feedback.', 'UNASSIGNED', '2025-08-01', NULL, '2024-05-15 12:30:00', NULL),
('Employee Wellness Program', 'Create HR policy.', 'COMPLETED', '2025-01-10', 5, '2024-12-01 10:10:00', '2025-01-07 14:20:00'),
('Legal Compliance Training', 'Educate employees on compliance.', 'IN_PROGRESS', '2025-06-15', 15, '2025-03-25 11:50:00', '2025-04-02 09:40:00'),
('Internal HR Satisfaction Survey', 'Survey on employee satisfaction.', 'PENDING', '2025-09-05', 5, '2025-06-01 08:40:00', NULL),
('Prepare Annual Budget Report', 'Create financial projections.', 'PENDING', '2025-11-15', 12, '2012-07-15 14:20:00', NULL),
('Competitive Market Analysis', 'Research competitors.', 'COMPLETED', '2025-02-02', 12, '2025-01-05 09:30:00', '2025-01-28 12:45:00'),
('SEO Optimization', 'Improve website rankings.', 'IN_PROGRESS', '2025-07-15', 16, '2025-06-20 15:10:00', '2025-07-01 14:00:00'),
('Customer Retention Campaign', 'Develop retention strategies.', 'UNASSIGNED', '2025-12-01', NULL, '2025-09-01 11:10:00', NULL),
('Server Maintenance', 'Routine maintenance & updates.', 'PENDING', '2025-08-20', 14, '2025-06-10 08:30:00', NULL),
('Data Backup & Recovery Drill', 'Test backup systems.', 'COMPLETED', '2025-01-25', 10, '2025-01-05 07:45:00', '2025-01-25 10:10:00'),
('IT Equipment Procurement', 'Purchase new workstations.', 'COMPLETED', '2025-04-15', 18, '2025-02-25 10:50:00', '2025-04-01 17:20:00'),
('Legacy Overdue Task', 'Example of an old overdue task.', 'PENDING', '1995-07-07', 1, '1995-06-01 08:30:00', NULL),
('Test Payment Gateway', 'Ensure payment integration.', 'IN_PROGRESS', '2025-06-01', 4, '1999-04-20 09:50:00', '2025-05-10 13:30:00'),
('Final Deployment Testing', 'Confirm all test cases.', 'PENDING', '2022-06-30', 9, '2025-05-01 14:20:00', NULL),
('Update Privacy Policy', 'Revise privacy policies.', 'COMPLETED', '2025-01-31', 5, '2025-01-05 10:30:00', '2025-01-29 15:50:00'),
('Cloud Security Assessment', 'Audit cloud security.', 'PENDING', '2025-09-30', 10, '2025-07-01 14:45:00', NULL),
('Bug Fixes - Login Page', 'Resolve reported issues on the user login form.', 'IN_PROGRESS', '2025-03-05', 2, '2025-02-20 11:15:00', '2025-02-22 09:40:00'),
('Implement Two-Factor Authentication', 'Enhance security with 2FA.', 'PENDING', '2025-04-10', 10, '2025-03-15 16:20:00', NULL),
('Refactor User Module', 'Improve code maintainability and performance.', 'IN_PROGRESS', '2025-05-20', 3, '2025-04-01 08:55:00', '2025-04-10 14:35:00'),
('Database Optimization', 'Tune database queries for faster response times.', 'COMPLETED', '2025-03-15', 8, '2025-02-25 13:30:00', '2025-03-10 17:10:00'),
('API Documentation Update', 'Document new API endpoints and parameters.', 'PENDING', '2025-04-25', 7, '2025-04-15 10:05:00', NULL),
('Frontend Redesign', 'Implement new UI/UX designs for improved user experience.', 'IN_PROGRESS', '2025-06-05', 6, '2025-05-01 09:20:00', '2025-05-15 11:55:00'),
('Implement Search Functionality', 'Add robust search capabilities to the application.', 'PENDING', '2025-07-10', 2, '2025-06-15 14:40:00', NULL),
('Performance Testing', 'Conduct load and stress testing to identify bottlenecks.', 'COMPLETED', '2025-05-10', 8, '2025-04-20 17:05:00', '2025-05-05 10:25:00'),
('Security Audit - Application', 'Review application code for vulnerabilities.', 'IN_PROGRESS', '2025-06-20', 10, '2025-05-10 11:30:00', '2025-05-25 15:00:00'),
('Deploy to Production', 'Release the latest build to the production environment.', 'PENDING', '2025-07-20', 14, '2025-07-15 08:45:00', NULL),
('Create User Manual', 'Document application features and usage instructions.', 'COMPLETED', '2025-04-05', 7, '2025-03-20 15:50:00', '2025-04-01 12:15:00'),
('Train Support Team', 'Educate support staff on new features and troubleshooting.', 'PENDING', '2025-05-15', 7, '2025-05-01 10:20:00', NULL),
('Gather User Feedback', 'Collect user feedback on the latest release.', 'IN_PROGRESS', '2025-06-10', 6, '2025-05-25 14:00:00', '2025-06-01 09:30:00'),
('Address User Feedback', 'Implement changes based on user feedback.', 'PENDING', '2025-07-05', 2, '2025-06-15 17:30:00', NULL),
('Research New Technologies', 'Explore emerging technologies for future projects.', 'IN_PROGRESS', '2025-07-25', 1, '2025-07-01 11:40:00', '2025-07-15 16:10:00'),
('Attend Industry Conference', 'Stay up-to-date with industry trends and best practices.', 'COMPLETED', '2025-06-01', 1, '2025-05-10 09:15:00', '2025-06-01 18:20:00'),
('Write Blog Post', 'Share insights and knowledge with the community.', 'PENDING', '2025-07-15', 7, '2025-07-01 13:50:00', NULL),
('Create Presentation', 'Prepare a presentation for the next team meeting.', 'IN_PROGRESS', '2025-06-25', 1, '2025-06-20 10:35:00', '2025-06-22 15:25:00'),
('Review Project Proposals', 'Evaluate submitted project proposals and select the best ones.', 'PENDING', '2025-08-01', 1, '2025-07-20 16:00:00', NULL),
('Plan Team Building Activity', 'Organize a fun team building activity.', 'COMPLETED', '2025-07-05', 1, '2025-06-20 14:25:00', '2025-07-02 11:50:00'),
('Onboard New Employee', 'Prepare onboarding materials and train the new hire.', 'IN_PROGRESS', '2025-07-10', 7, '2025-07-01 09:55:00', '2025-07-05 17:15:00'),
('Conduct Performance Reviews', 'Evaluate employee performance and provide feedback.', 'PENDING', '2025-08-15', 1, '2025-08-01 11:20:00', NULL),
('Update Company Policies', 'Review and update existing company policies.', 'COMPLETED', '2025-07-20', 1, '2025-07-05 15:40:00', '2025-07-18 10:05:00'),
('Prepare Financial Report', 'Generate financial reports for the past quarter.', 'IN_PROGRESS', '2025-08-05', 12, '2025-07-20 10:10:00', '2025-07-25 14:55:00'),
('Analyze Sales Data', 'Identify sales trends and opportunities for improvement.', 'PENDING', '2025-08-20', 12, '2025-08-01 16:35:00', NULL),
('Develop Marketing Strategy', 'Create a marketing plan for the next product launch.', 'COMPLETED', '2025-07-15', 16, '2025-07-01 12:05:00', '2025-07-10 17:40:00'),
('Run Marketing Campaign', 'Execute the marketing plan and track its effectiveness.', 'IN_PROGRESS', '2025-08-10', 16, '2025-07-20 09:20:00', '2025-07-25 11:10:00'),
('Analyze Campaign Results', 'Evaluate the performance of the marketing campaign.', 'PENDING', '2025-08-25', 16, '2025-08-10 15:50:00', NULL);

-- Data without updated_at and created_at
-- INSERT INTO `Tasks` (title, description, status, deadline, assigned_employee_id) VALUES
-- ('Refactor Authentication System', 'Improve security and performance.', 'IN_PROGRESS', '2025-03-10', 3),
-- ('Deploy Kubernetes Cluster', 'Set up a scalable microservices architecture.', 'PENDING', '2025-05-15', 4),
-- ('Optimize Database Indexing', 'Improve query performance for large datasets.', 'PENDING', '2025-04-05', 6),
-- ('Fix API Rate Limiting Bug', 'Ensure proper request throttling.', 'COMPLETED', '2025-02-22', 5),
-- ('Upgrade Application Framework', 'Migrate codebase to the latest stable version.', 'UNASSIGNED', '2025-07-01', NULL),
-- ('Perform Security Penetration Test', 'Assess application vulnerabilities.', 'IN_PROGRESS', '2025-06-12', 8),
-- ('Enable Multi-Factor Authentication', 'Improve user account security.', 'PENDING', '2025-03-25', 9),
-- ('Patch Server Vulnerabilities', 'Apply security updates to production servers.', 'COMPLETED', '2025-01-31', 10),
-- ('Audit Network Firewall Rules', 'Ensure proper access controls.', 'UNASSIGNED', '2025-05-18', NULL),
-- ('Monitor for Unusual Login Attempts', 'Detect potential account breaches.', 'PENDING', '2025-08-10', 11),
-- ('Analyze User Behavior Trends', 'Identify key product engagement points.', 'PENDING', '2025-04-20', 12),
-- ('Create Data Backup Strategy', 'Ensure data redundancy and safety.', 'IN_PROGRESS', '2025-07-30', 13),
-- ('Design A/B Testing Experiments', 'Optimize landing page conversion rates.', 'PENDING', '2025-06-01', 14),
-- ('Develop Machine Learning Model', 'Build a recommendation system for users.', 'IN_PROGRESS', '2025-09-15', 15),
-- ('Migrate Business Intelligence Reports', 'Transition dashboards to a new platform.', 'COMPLETED', '2025-02-10', 16),
-- ('Redesign Onboarding Flow', 'Enhance new user experience.', 'IN_PROGRESS', '2025-04-15', 17),
-- ('Improve Mobile Accessibility', 'Ensure compliance with WCAG standards.', 'PENDING', '2025-05-22', 18),
-- ('Fix Navigation Bar UI Bug', 'Resolve inconsistent behavior.', 'COMPLETED', '2025-03-02', 19),
-- ('Create New Design System Components', 'Standardize UI elements.', 'UNASSIGNED', '2025-10-01', NULL),
-- ('Optimize Checkout Process', 'Reduce cart abandonment.', 'PENDING', '2025-07-12', 20),
-- ('Conduct Employee Performance Reviews', 'Assess team productivity.', 'PENDING', '2025-08-15', 21),
-- ('Review & Update Employee Handbook', 'Ensure compliance with new policies.', 'IN_PROGRESS', '2025-04-05', 22),
-- ('Plan Annual Company Retreat', 'Organize off-site team bonding.', 'COMPLETED', '2025-01-12', 23),
-- ('Implement Remote Work Guidelines', 'Define policies for flexible work.', 'PENDING', '2025-06-18', 24),
-- ('Recruitment Campaign Strategy', 'Develop hiring strategy for Q3.', 'IN_PROGRESS', '2025-08-30', 25),
-- ('Prepare Monthly Expense Report', 'Track company spending.', 'PENDING', '2025-02-28', 26),
-- ('Audit Payroll System', 'Ensure accurate salary distribution.', 'IN_PROGRESS', '1990-03-10', 27),
-- ('Optimize Subscription Pricing Model', 'Test new pricing tiers.', 'PENDING', '2012-06-22', 28),
-- ('Submit Tax Filings', 'Ensure compliance with government regulations.', 'COMPLETED', '2025-02-15', 29),
-- ('Forecast Revenue Growth', 'Analyze financial trends.', 'UNASSIGNED', '2025-09-05', NULL),
-- ('Update Patient Data Privacy Policy', 'Ensure HIPAA compliance.', 'PENDING', '2025-04-12', 30),
-- ('Conduct Clinical Trial Analysis', 'Assess new treatment effectiveness.', 'IN_PROGRESS', '2025-05-10', 31),
-- ('Schedule Medical Equipment Maintenance', 'Ensure proper functioning.', 'PENDING', '2025-07-20', 32),
-- ('Improve Hospital Appointment Booking System', 'Optimize scheduling workflow.', 'COMPLETED', '2025-03-18', 33),
-- ('Train Staff on Emergency Protocols', 'Ensure readiness for medical crises.', 'PENDING', '2021-08-05', 34),
-- ('Reduce Customer Support Response Time', 'Optimize ticket management.', 'PENDING', '2025-06-08', 35),
-- ('Implement Chatbot Support', 'Automate common customer inquiries.', 'IN_PROGRESS', '2025-05-30', 36),
-- ('Improve Help Center Documentation', 'Enhance knowledge base articles.', 'COMPLETED', '2004-02-20', 37),
-- ('Review Refund & Return Policies', 'Ensure customer satisfaction.', 'UNASSIGNED', '2025-10-10', NULL),
-- ('Launch Customer Loyalty Program', 'Reward returning customers.', 'PENDING', '2025-08-22', 38);

-- Confirm privileges
FLUSH PRIVILEGES;


```

To reset the database:
1. Stop the container
2. Remove the ```mysql_data``` volume
3. Start the container

OR

1. Access the container's bash:
```sh
docker exec -it etams-mysql bash
```
2. Execute database script
```shell
mariadb -u root -p<password> < /docker-entrypoint-initdb.d/init-db.sql
```


---

## **3. Create the Backend `Dockerfile`**

Inside `back-end/etams/`, create or update `Dockerfile`:

```dockerfile
# Stage 1: Build the Spring Boot application
FROM eclipse-temurin:21-jdk AS build

WORKDIR /app

# Copy only the necessary files for Maven to download dependencies
COPY pom.xml mvnw mvnw.cmd ./
COPY .mvn .mvn/

# Download dependencies (cached)
RUN ./mvnw dependency:go-offline -B

# Copy the source code.  COPY src/main/java and resources separately for better caching
COPY src/main/java src/main/java
COPY src/main/resources src/main/resources

# Package the application
RUN ./mvnw clean package -DskipTests

# Stage 2: Create the final image
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Copy the JAR file
COPY --from=build /app/target/*.jar app.jar

# Set environment variables (if needed)
# ENV SPRING_PROFILES_ACTIVE=production

EXPOSE 8080

# Use a shell script to run the JAR (for graceful shutdown)
COPY entrypoint.sh .
RUN chmod +x entrypoint.sh
ENTRYPOINT ["./entrypoint.sh"]
```

This ensures:
- **Java 21** is used.
- The project is **built inside the container** using Maven.
- The application is started using the compiled JAR file.

---

## **4. Run the Containers**

### **To start the backend and database:**
```sh
docker-compose up --build -d
```
This will:
- Pull the necessary images.
- Build the backend container.
- Start MariaDB and backend services.

### **To stop the containers:**
```sh
docker-compose down
```
This stops all containers without deleting volumes.

### **To stop and remove volumes (including database data):**
```sh
docker-compose down -v
```
This will remove all containers and delete MySQL data.

---

## **5. Verify Everything is Running**

### **Check Running Containers:**
```sh
docker ps
```
You should see `etams-backend` and `etams-mysql` running.

### **Check Backend Logs:**
```sh
docker logs etams-backend
```
This shows if the backend is running correctly.

### **Check MariaDB Logs:**
```sh
docker logs etams-mysql
```
This verifies if the database is initialized properly.

### **Connect to MariaDB in Docker:**
```sh
docker exec -it etams-mysql mariadb -u etamsapp -p
```
Enter the password `etamsapp` when prompted.

---

## **6. Testing API Endpoints**

Once the backend is running, test if it’s working:

```sh
curl -X GET http://localhost:8080/api/tasks
```
If authentication is required, use a **Bearer Token**:
```sh
curl -X GET http://localhost:8080/api/tasks \
  -H "Authorization: Bearer <your_jwt_token>"
```

---

## **7. Common Issues and Fixes**

### **1. Backend Fails to Start Due to Database Connection Issues**
- Ensure MariaDB is running:
  ```sh
  docker logs etams-mysql
  ```
- Restart all containers:
  ```sh
  docker-compose down -v && docker-compose up --build -d
  ```

### **2. Unable to Connect to MariaDB**
- Try manually connecting inside the container:
  ```sh
  docker exec -it etams-mysql mariadb -u root -p
  ```
- Ensure `SPRING_DATASOURCE_URL` in `docker-compose.yml` references **`etams-mysql`**, not `localhost`.

### **3. Changes to Backend Code Aren't Reflected**
- Rebuild the backend container:
  ```sh
  docker-compose up --build -d
  ```
- Verify the JAR file is being generated properly inside `target/`.

---

## **Conclusion**
Following this guide, you have:
1. **Set up MariaDB in Docker** with persistent data.
2. **Configured the Spring Boot backend** to run inside Docker.
3. **Enabled communication between backend and database**.
4. **Verified and tested the setup** using logs and API calls.

