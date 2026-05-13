-- Add 'general' category to categories table

-- First check if categories table exists and its structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'categories';

-- Insert 'general' category if it doesn't exist
INSERT INTO categories (id, name)
VALUES ('general', 'General')
ON CONFLICT (id) DO NOTHING;

-- Also add other common categories that the form uses
INSERT INTO categories (id, name) VALUES
  ('electronics', 'Electronics'),
  ('keys', 'Keys'),
  ('wallets', 'Wallets'),
  ('bags', 'Bags'),
  ('phones', 'Phones'),
  ('jewelry', 'Jewelry'),
  ('documents', 'Documents'),
  ('clothing', 'Clothing'),
  ('accessories', 'Accessories'),
  ('other', 'Other')
ON CONFLICT (id) DO NOTHING;

-- Verify categories were added
SELECT * FROM categories ORDER BY name;
