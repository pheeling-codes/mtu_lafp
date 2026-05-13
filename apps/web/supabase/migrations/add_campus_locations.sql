-- Add campus locations to locations table

-- First, create locations table if it doesn't exist
CREATE TABLE IF NOT EXISTS locations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL
);

-- Insert campus locations
INSERT INTO locations (id, name) VALUES
  ('library', 'University Main Library'),
  ('cafeteria', 'Student Center Cafeteria'),
  ('science-building', 'Science Building'),
  ('gym', 'Campus Gym'),
  ('parking-lot-a', 'Parking Lot A'),
  ('student-union', 'Student Union'),
  ('engineering-hall', 'Engineering Hall'),
  ('arts-center', 'Arts Center'),
  ('dormitory', 'Dormitory Complex'),
  ('bookstore', 'Campus Bookstore'),
  ('health-center', 'Health Center'),
  ('admin-building', 'Administration Building')
ON CONFLICT (id) DO NOTHING;

-- Verify locations were added
SELECT * FROM locations ORDER BY name;
