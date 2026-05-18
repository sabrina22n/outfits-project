-- Add outfit_night_id column to travel_days
ALTER TABLE travel_days
ADD COLUMN IF NOT EXISTS outfit_night_id TEXT REFERENCES outfits(id) ON DELETE SET NULL;
