-- ============================================================
-- e-Governance Grievance Redressal & Tracking System
-- Seed Data
-- ============================================================
-- NOTE: Passwords are hashed with PHP password_hash($pass, PASSWORD_DEFAULT)
--   admin123    → $2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi
--   officer123  → same hash pattern (change per user below)
--   citizen123  → same hash pattern
-- 
-- For simplicity all sample passwords use bcrypt of 'password123'
-- Real hash generated from: password_hash('password123', PASSWORD_DEFAULT)
-- Using a pre-generated hash: $2y$10$8imsViftvfW7GuP1q2FeheWpxSSKxTatiHYxUDFWy6HrOxKk4FxBP
-- ============================================================

USE egov_grievance;

-- Departments
INSERT INTO departments (id, name, description) VALUES
(1, 'Public Works Department', 'Responsible for roads, bridges, public buildings, and infrastructure maintenance.'),
(2, 'Water Supply & Sanitation', 'Manages drinking water supply, drainage, and sanitation facilities.'),
(3, 'Revenue Department', 'Handles land records, property registration, and revenue collection.'),
(4, 'Health & Family Welfare', 'Oversees public health services, hospitals, and welfare programs.'),
(5, 'Electricity Board', 'Manages power supply, grid maintenance, and new connections.');

-- Users
-- Admin: admin@egov.gov | password: password123
INSERT INTO users (id, name, email, password_hash, role, department_id) VALUES
(1, 'System Administrator', 'admin@egov.gov',
 '$2y$10$8imsViftvfW7GuP1q2FeheWpxSSKxTatiHYxUDFWy6HrOxKk4FxBP',
 'admin', NULL);

-- Officers: officer1@egov.gov | officer2@egov.gov | password: password123
INSERT INTO users (id, name, email, password_hash, role, department_id) VALUES
(2, 'Rajesh Kumar', 'officer.pwd@egov.gov',
 '$2y$10$8imsViftvfW7GuP1q2FeheWpxSSKxTatiHYxUDFWy6HrOxKk4FxBP',
 'officer', 1),
(3, 'Anita Sharma', 'officer.water@egov.gov',
 '$2y$10$8imsViftvfW7GuP1q2FeheWpxSSKxTatiHYxUDFWy6HrOxKk4FxBP',
 'officer', 2),
(4, 'Suresh Menon', 'officer.revenue@egov.gov',
 '$2y$10$8imsViftvfW7GuP1q2FeheWpxSSKxTatiHYxUDFWy6HrOxKk4FxBP',
 'officer', 3),
(8, 'Vikram Singh', 'officer.electricity@egov.gov',
 '$2y$10$8imsViftvfW7GuP1q2FeheWpxSSKxTatiHYxUDFWy6HrOxKk4FxBP',
 'officer', 5),
(10, 'Dr. Priya Sharma', 'officer.health@egov.gov',
 '$2y$10$8imsViftvfW7GuP1q2FeheWpxSSKxTatiHYxUDFWy6HrOxKk4FxBP',
 'officer', 4);

-- Citizens: citizen1@example.com etc | password: password123
INSERT INTO users (id, name, email, password_hash, role, department_id) VALUES
(5, 'Priya Nair', 'priya.nair@example.com',
 '$2y$10$8imsViftvfW7GuP1q2FeheWpxSSKxTatiHYxUDFWy6HrOxKk4FxBP',
 'citizen', NULL),
(6, 'Mohammed Farhan', 'farhan.m@example.com',
 '$2y$10$8imsViftvfW7GuP1q2FeheWpxSSKxTatiHYxUDFWy6HrOxKk4FxBP',
 'citizen', NULL),
(7, 'Kavya Reddy', 'kavya.reddy@example.com',
 '$2y$10$8imsViftvfW7GuP1q2FeheWpxSSKxTatiHYxUDFWy6HrOxKk4FxBP',
 'citizen', NULL);

-- Complaints (6+ in various statuses)
INSERT INTO complaints (id, citizen_id, department_id, title, description, status, priority, reference_number, created_at) VALUES
(1, 5, 1, 'Pothole on Main Street near Market',
 'There is a large pothole on Main Street near the central market that has caused several accidents. Immediate repair is requested.',
 'In Progress', 'High', 'GRV-20260001', '2026-01-05 09:30:00'),

(2, 5, 2, 'No water supply for 3 days',
 'Our locality (Ward 12, Sector B) has had no water supply for the past 3 days. Please investigate and restore supply.',
 'Resolved', 'High', 'GRV-20260002', '2026-01-10 11:00:00'),

(3, 6, 1, 'Street light malfunction on Gandhi Road',
 'Five street lights on Gandhi Road have been non-functional for two weeks causing safety concerns at night.',
 'Under Review', 'Medium', 'GRV-20260003', '2026-01-15 14:45:00'),

(4, 6, 3, 'Land record discrepancy for plot 142/B',
 'The revenue records for my plot (Survey No. 142/B, Village Nandapur) show an incorrect boundary. I request a resurvey and correction.',
 'Submitted', 'Medium', 'GRV-20260004', '2026-01-20 10:00:00'),

(5, 7, 2, 'Open drainage causing health hazard',
 'The drainage channel near School Road is open and overflowing with sewage, causing a serious health hazard for children.',
 'In Progress', 'High', 'GRV-20260005', '2026-02-01 08:30:00'),

(6, 7, 4, 'Primary Health Centre closed during working hours',
 'The PHC in our village (Rampur) was found closed during official working hours on multiple occasions. Staff availability is a concern.',
 'Submitted', 'Low', 'GRV-20260006', '2026-02-10 16:00:00'),

(7, 5, 5, 'Power outage lasting more than 12 hours',
 'Our area (Sector 5, Block C) has been experiencing daily power outages of 12+ hours. Transformer issue suspected.',
 'Rejected', 'Medium', 'GRV-20260007', '2026-02-15 13:00:00'),

(8, 6, 1, 'Road construction debris blocking footpath',
 'Construction material and debris from the ongoing road work has completely blocked the footpath on MG Road making it inaccessible.',
 'Resolved', 'Low', 'GRV-20260008', '2026-02-20 09:00:00');

-- Complaint Updates (history entries)
INSERT INTO complaint_updates (complaint_id, updated_by, old_status, new_status, remarks) VALUES
(1, 2, 'Submitted', 'Under Review',
 'Complaint received. Site inspection scheduled for this week.'),
(1, 2, 'Under Review', 'In Progress',
 'Pothole repair crew deployed. Work expected to complete within 3 days.'),

(2, 3, 'Submitted', 'Under Review',
 'Issue logged. Water treatment plant team notified.'),
(2, 3, 'Under Review', 'In Progress',
 'Pipe burst identified as root cause. Repair crew dispatched.'),
(2, 3, 'In Progress', 'Resolved',
 'Water supply restored. Burst pipe repaired and tested.'),

(3, 2, 'Submitted', 'Under Review',
 'Street light department has been informed. Assessment underway.'),

(5, 3, 'Submitted', 'Under Review',
 'Field team sent for inspection of drainage overflow.'),
(5, 3, 'Under Review', 'In Progress',
 'Drainage cleaning and minor repair work initiated.'),

(7, 2, 'Submitted', 'Rejected',
 'This complaint falls under the Electricity Board department jurisdiction, not Public Works. Please resubmit to the correct department.'),

(8, 2, 'Submitted', 'Under Review', 'Site visited. Contractor notified to clear debris.'),
(8, 2, 'Under Review', 'In Progress', 'Debris removal in progress.'),
(8, 2, 'In Progress', 'Resolved', 'Footpath fully cleared. Contractor penalized for obstruction.');
