INSERT INTO events (title, city, date, price, available)
VALUES
  ('Festival Norte', 'Monterrey', NOW() + INTERVAL '10 days', 85.00, 500),
  ('Rock al Rio', 'Guadalajara', NOW() + INTERVAL '18 days', 120.00, 750),
  ('Electronica Viva', 'CDMX', NOW() + INTERVAL '25 days', 150.00, 600);
