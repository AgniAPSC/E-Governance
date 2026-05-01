-- ============================================================
-- e-Governance Grievance Redressal & Tracking System
-- Database Schema
-- ============================================================

CREATE DATABASE IF NOT EXISTS egov_grievance
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE egov_grievance;

-- -----------------------------------------------
-- Table: departments
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS departments (
  id          INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  name        VARCHAR(150)    NOT NULL,
  description TEXT,
  is_active   TINYINT(1)      NOT NULL DEFAULT 1,
  created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_dept_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------
-- Table: users
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id              INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  name            VARCHAR(150)    NOT NULL,
  email           VARCHAR(200)    NOT NULL,
  password_hash   VARCHAR(255)    NOT NULL,
  role            ENUM('citizen','officer','admin') NOT NULL DEFAULT 'citizen',
  department_id   INT UNSIGNED    NULL DEFAULT NULL,
  is_active       TINYINT(1)      NOT NULL DEFAULT 1,
  created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_user_email (email),
  CONSTRAINT fk_user_department FOREIGN KEY (department_id)
    REFERENCES departments (id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------
-- Table: complaints
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS complaints (
  id               INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  citizen_id       INT UNSIGNED    NOT NULL,
  department_id    INT UNSIGNED    NOT NULL,
  title            VARCHAR(255)    NOT NULL,
  description      TEXT            NOT NULL,
  status           ENUM('Submitted','Under Review','In Progress','Resolved','Rejected')
                   NOT NULL DEFAULT 'Submitted',
  priority         ENUM('Low','Medium','High') NOT NULL DEFAULT 'Medium',
  reference_number VARCHAR(20)     NOT NULL,
  created_at       TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
                   ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_reference_number (reference_number),
  KEY idx_citizen   (citizen_id),
  KEY idx_dept      (department_id),
  KEY idx_status    (status),
  KEY idx_created   (created_at),
  CONSTRAINT fk_complaint_citizen    FOREIGN KEY (citizen_id)
    REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_complaint_department FOREIGN KEY (department_id)
    REFERENCES departments (id) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------
-- Table: complaint_updates
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS complaint_updates (
  id           INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  complaint_id INT UNSIGNED    NOT NULL,
  updated_by   INT UNSIGNED    NOT NULL,
  old_status   ENUM('Submitted','Under Review','In Progress','Resolved','Rejected') NULL,
  new_status   ENUM('Submitted','Under Review','In Progress','Resolved','Rejected') NULL,
  remarks      TEXT            NULL,
  created_at   TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_cu_complaint (complaint_id),
  CONSTRAINT fk_cu_complaint FOREIGN KEY (complaint_id)
    REFERENCES complaints (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_cu_user FOREIGN KEY (updated_by)
    REFERENCES users (id) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------
-- Table: user_tokens
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS user_tokens (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id    INT UNSIGNED NOT NULL,
  token      VARCHAR(64)  NOT NULL,
  expires_at TIMESTAMP    NOT NULL,
  created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_token   (token),
  KEY idx_ut_user       (user_id),
  CONSTRAINT fk_token_user FOREIGN KEY (user_id)
    REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
