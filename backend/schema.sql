CREATE DATABASE IF NOT EXISTS reboot_db;
USE reboot_db;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    age INT,
    phone VARCHAR(20),
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('professional', 'youth', 'freelancer', 'non-tech', 'part-time', 'admin') DEFAULT 'youth',
    skill_type ENUM('tech', 'non-tech'),
    skill_name VARCHAR(255),
    bio TEXT,
    previous_experience TEXT,
    profile_picture VARCHAR(255),
    google_id VARCHAR(255),
    auth_provider VARCHAR(50) DEFAULT 'local',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Startups table
CREATE TABLE IF NOT EXISTS startups (
    id INT AUTO_INCREMENT PRIMARY KEY,
    team_name VARCHAR(255) NOT NULL,
    project_name VARCHAR(255) NOT NULL,
    required_skill VARCHAR(255),
    vacancy_count INT DEFAULT 0,
    created_by INT,
    allow_public_join BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Team Members table
CREATE TABLE IF NOT EXISTS team_members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    startup_id INT,
    user_id INT,
    role ENUM('leader', 'member') DEFAULT 'member',
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (startup_id) REFERENCES startups(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    startup_id INT,
    assigned_to INT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status ENUM('pending', 'inprogress', 'completed') DEFAULT 'pending',
    approved_by_leader BOOLEAN DEFAULT FALSE,
    deadline DATETIME,
    completion_percentage INT DEFAULT 0,
    proof_url TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    tools TEXT, -- JSON string of tool IDs or names
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (startup_id) REFERENCES startups(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
);

-- Task Assignments for multiple members
CREATE TABLE IF NOT EXISTS task_members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INT,
    user_id INT,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Job Posts table
CREATE TABLE IF NOT EXISTS job_posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category VARCHAR(255),
    job_title VARCHAR(255) NOT NULL,
    client_name VARCHAR(255),
    contact_details TEXT,
    source VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Part Time Jobs table
CREATE TABLE IF NOT EXISTS part_time_jobs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    work_name VARCHAR(255) NOT NULL,
    contact VARCHAR(255),
    location VARCHAR(255),
    payment VARCHAR(255),
    vacancy INT DEFAULT 1,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Followers table
CREATE TABLE IF NOT EXISTS followers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    follower_id INT,
    following_id INT,
    status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    type VARCHAR(50),
    message TEXT,
    read_status BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
-- Milestones table
CREATE TABLE IF NOT EXISTS milestones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    startup_id INT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    achieved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (startup_id) REFERENCES startups(id) ON DELETE CASCADE
);

-- Recommended Tools table
CREATE TABLE IF NOT EXISTS tools (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100), -- 'Design', 'Development', 'Marketing', etc.
    skill_match VARCHAR(255), -- Skill it pairs with
    suggestion TEXT,
    url VARCHAR(255),
    download_url TEXT,
    source_name VARCHAR(255)
);

ALTER TABLE tasks ADD COLUMN assigned_by INT;

-- Team Messages table for Chat
CREATE TABLE IF NOT EXISTS team_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    startup_id INT,
    sender_id INT,
    message TEXT,
    type VARCHAR(20) DEFAULT 'text', -- 'text', 'image', 'document', 'file'
    file_url VARCHAR(255),
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (startup_id) REFERENCES startups(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Private Messages Table
CREATE TABLE IF NOT EXISTS private_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id INT,
    receiver_id INT,
    message TEXT,
    type VARCHAR(20) DEFAULT 'text',
    file_url VARCHAR(255),
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
);
