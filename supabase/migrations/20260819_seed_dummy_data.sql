-- ========================================================
-- PHYSIO DYNAMICS CLINIC SYSTEM - COMPREHENSIVE DUMMY DATA SEED
-- ========================================================

-- 1. Seed Patients
insert into public.patients (
  id, patient_code, first_name, last_name, date_of_birth, gender, phone, email, address, occupation, emergency_contact_name, emergency_contact_phone, referral_source, medical_history, allergies, notes
) values
  ('00000000-0000-0000-0000-000000000001', 'PD-2026-001', 'John', 'Mathew', '1988-04-12', 'Male', '+91 98765 43210', 'john.mathew@example.com', 'Panamaram Town, Wayanad', 'Software Engineer', 'Mary Mathew', '+91 98765 43211', 'Dr. Rajesh Nair', 'L4-L5 disc protrusion 2 years ago', 'None', 'Regular runner, left knee discomfort'),
  ('00000000-0000-0000-0000-000000000002', 'PD-2026-002', 'Deepak', 'Sharma', '1975-09-25', 'Male', '+91 98123 45678', 'deepak.sharma@example.com', 'Mananthavady, Wayanad', 'Bank Manager', 'Sunita Sharma', '+91 98123 45679', 'Self / Google Search', 'Hypertension (managed with medication)', 'Penicillin', 'Chronic lumbar spinal strain from long desk work'),
  ('00000000-0000-0000-0000-000000000003', 'PD-2026-003', 'Abid', 'Hussain', '1992-01-15', 'Male', '+91 97654 32109', 'abid.hussain@example.com', 'Kalpetta, Wayanad', 'High School Teacher', 'Fatima Hussain', '+91 97654 32110', 'Dr. Suresh Kumar', 'Cervical stiffness for 6 months', 'None', 'Complains of radiation pain to right arm'),
  ('00000000-0000-0000-0000-000000000004', 'PD-2026-004', 'Farhan', 'Ali', '1995-11-30', 'Male', '+91 96543 21098', 'farhan.ali@example.com', 'Sulthan Bathery, Wayanad', 'Football Coach', 'Zainab Ali', '+91 96543 21099', 'Sports Clinic Referral', 'Right shoulder impingement', 'NSAIDs', 'Pain on overhead abduction > 90 deg'),
  ('00000000-0000-0000-0000-000000000005', 'PD-2026-005', 'Rahul', 'Kumar', '1982-06-18', 'Male', '+91 95432 10987', 'rahul.kumar@example.com', 'Panamaram, Wayanad', 'Farmer', 'Priya Kumar', '+91 95432 10988', 'Friend Recommendation', 'Right knee osteophyte formation', 'Dust allergy', 'Difficulty in squatting and kneeling'),
  ('00000000-0000-0000-0000-000000000006', 'PD-2026-006', 'Sanjay', 'Patel', '1968-03-05', 'Male', '+91 94321 09876', 'sanjay.patel@example.com', 'Meppadi, Wayanad', 'Retired Businessman', 'Aarti Patel', '+91 94321 09877', 'Dr. Alex Rivera', 'Post stroke hemiparesis right side 8 months ago', 'None', 'Undergoing gait retraining and arm function rehab'),
  ('00000000-0000-0000-0000-000000000007', 'PD-2026-007', 'Rohan', 'Varma', '2001-08-22', 'Male', '+91 93210 98765', 'rohan.varma@example.com', 'Vythiri, Wayanad', 'College Student', 'Suresh Varma', '+91 93210 98766', 'Instagram Page', 'Postural kyphosis & neck strain', 'None', 'Long hours using laptop for studies'),
  ('00000000-0000-0000-0000-000000000008', 'PD-2026-008', 'Kavita', 'Menon', '1979-12-10', 'Female', '+91 92109 87654', 'kavita.menon@example.com', 'Kalpetta, Wayanad', 'Homemaker', 'Ramesh Menon', '+91 92109 87655', 'Dr. Sarah Chen', 'Adhesive capsulitis left shoulder (Frozen shoulder)', 'None', 'Severe night pain and restricted external rotation'),
  ('00000000-0000-0000-0000-000000000009', 'PD-2026-009', 'Ramesh', 'Babu', '1962-07-04', 'Male', '+91 91098 76543', 'ramesh.babu@example.com', 'Mananthavady, Wayanad', 'Retired Civil Engineer', 'Latha Babu', '+91 91098 76544', 'Ortho Surgeon Dr. George', 'Total Hip Replacement left 6 weeks post-op', 'None', 'Partial weight bearing with walker'),
  ('00000000-0000-0000-0000-000000000010', 'PD-2026-010', 'Waseem', 'Khan', '1990-05-14', 'Male', '+91 90987 65432', 'waseem.khan@example.com', 'Panamaram, Wayanad', 'Shop Owner', 'Nadia Khan', '+91 90987 65433', 'Walk-in', 'L5-S1 radiculopathy', 'None', 'Pain worsens on forward flexion')
on conflict (patient_code) do update set
  first_name = excluded.first_name,
  last_name = excluded.last_name,
  phone = excluded.phone,
  email = excluded.email;

-- 2. Seed Appointments
insert into public.appointments (
  patient_id, appointment_date, appointment_time, slot_number, status, notes
) values
  ('00000000-0000-0000-0000-000000000001', current_date, '08:00', 'Bed Slot 1 (Knee Rehab)', 'Completed', 'Completed ACL mobilization exercises'),
  ('00000000-0000-0000-0000-000000000002', current_date, '08:30', 'Bed Slot 2 (Lumbar Traction)', 'Completed', 'Applied lumbar traction 15kg for 30 mins'),
  ('00000000-0000-0000-0000-000000000003', current_date, '09:00', 'Bed Slot 1 (Cervical Spondylosis)', 'Confirmed', 'Cervical mobilization & postural correction'),
  ('00000000-0000-0000-0000-000000000004', current_date, '09:30', 'Bed Slot 2 (Shoulder Therapy)', 'Confirmed', 'Rotator cuff strengthening exercises'),
  ('00000000-0000-0000-0000-000000000005', current_date, '11:30', 'Initial Assessment', 'Scheduled', 'First consultation for acute knee pain'),
  ('00000000-0000-0000-0000-000000000006', current_date, '14:00', 'Bed Slot 1 (Post-Stroke Rehab)', 'Scheduled', 'Gait training & neuromuscular facilitation'),
  ('00000000-0000-0000-0000-000000000007', current_date, '15:30', 'Bed Slot 2 (Postural Correction)', 'Scheduled', 'Ergonomic training & thoracic extension'),
  ('00000000-0000-0000-0000-000000000008', current_date, '17:30', 'Bed Slot 1 (Frozen Shoulder)', 'Scheduled', 'Ultrasound therapy & passive ROM stretches'),
  ('00000000-0000-0000-0000-000000000009', current_date, '18:00', 'Bed Slot 2 (Hip Replacement Rehab)', 'Scheduled', 'Abductor strengthening & partial weight bearing walk');

-- 3. Seed Clinical Assessments
insert into public.assessments (
  patient_id, assessment_date, chief_complaint, history_of_present_illness, pain_scale, pain_location, posture_gait_notes, range_of_motion_notes, muscle_strength_notes, special_tests, diagnosis, treatment_plan
) values
  ('00000000-0000-0000-0000-000000000001', current_date - interval '10 days', 'Left knee stiffness and locking while jogging', 'Gradual onset 3 months ago after a local marathon. Worsened past 2 weeks.', 6, 'Anterior & Medial Left Knee Joint', 'Mild antalgic gait favoring right leg', 'Left knee flexion restricted to 110 deg (Normal 135 deg). Full extension.', 'Quadriceps 4/5, Hamstrings 4+/5', 'McMurray test negative, Lachman test negative', 'Patellofemoral Pain Syndrome & Mild Chondromalacia', '12 Sessions: IFT, Ultrasound, Quadriceps & VMO strengthening, Ice pack'),
  ('00000000-0000-0000-0000-000000000002', current_date - interval '14 days', 'Lower back pain radiating to left buttock', 'Pain starts after 2 hours of sitting at desk. Eases with lying down.', 7, 'Lumbar Spine (L4-L5)', 'Slight forward lean posture, tight hamstrings', 'Lumbar flexion limited to 40 deg with tenderness', 'Core abdominals 3+/5, Gluteus maximus 4/5', 'SLR positive at 55 deg left side', 'L4-L5 Lumbar Disc Protrusion with Mild Sciatica', '15 Sessions: Lumbar traction, Core stabilization, McKenzie extensions'),
  ('00000000-0000-0000-0000-000000000008', current_date - interval '20 days', 'Severe left shoulder stiffness and inability to comb hair', 'Inability to reach behind back or lift arm overhead for 4 months.', 8, 'Left Glenohumeral Joint & Trapezius', 'Elevated left shoulder girdle during active movement', 'Abduction 70 deg, External rotation 15 deg, Flexion 90 deg', 'Rotator cuff strength 3+/5 due to pain inhibition', 'Hawkins-Kennedy positive, Drop arm negative', 'Stage 2 Adhesive Capsulitis (Frozen Shoulder Left)', '18 Sessions: Moist heat, Glenohumeral joint mobilization, Pulley & Wand exercises');

-- 4. Seed Invoices & Payments
insert into public.invoices (
  id, patient_id, invoice_number, invoice_date, due_date, total_amount, paid_amount, balance_amount, status, notes
) values
  ('00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000001', 'INV-2026-001', current_date - interval '7 days', current_date, 4800.00, 4800.00, 0.00, 'Paid', '12 Sessions Package Payment'),
  ('00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000002', 'INV-2026-002', current_date - interval '5 days', current_date + interval '5 days', 6000.00, 3000.00, 3000.00, 'Partial', '15 Sessions Package (50% Deposit Paid)'),
  ('00000000-0000-0000-0000-000000000103', '00000000-0000-0000-0000-000000000008', 'INV-2026-003', current_date - interval '2 days', current_date + interval '10 days', 7200.00, 0.00, 7200.00, 'Unpaid', '18 Sessions Frozen Shoulder Rehab Package');

insert into public.payments (
  patient_id, invoice_id, payment_date, amount, payment_method, reference_number, notes
) values
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000101', current_date - interval '7 days', 4800.00, 'UPI', 'UPI-987654321001', 'Full package payment via Google Pay'),
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000102', current_date - interval '5 days', 3000.00, 'Cash', 'CASH-REC-002', 'Advance cash payment');
