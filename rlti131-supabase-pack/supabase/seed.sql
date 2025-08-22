
insert into public.patients (id, name, mrn, status, therapy, scheduled_at, notes) values
('A102','Anjali Verma','MRN-0001','Pre-therapy','I-131','2025-08-23T09:30:00+05:30','Needs TSH report'),
('B221','Rohit Mehra','MRN-0002','Therapy Day','I-131','2025-08-23T11:00:00+05:30',null),
('C044','Fatima Khan','MRN-0003','Post-therapy','I-131','2025-08-23T15:00:00+05:30','Post-care call pending'),
('D310','Sanjay Patel','MRN-0004','Follow-up','I-131','2025-08-24T10:15:00+05:30',null),
('E155','Meera Joshi','MRN-0005','Pre-therapy','I-131','2025-08-24T12:00:00+05:30',null)
on conflict (id) do nothing;
