-- Create the daily_challenges table if it doesn't exist
CREATE TABLE IF NOT EXISTS daily_challenges (
    date DATE PRIMARY KEY,
    question JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE daily_challenges ENABLE ROW LEVEL SECURITY;

-- Create policy to allow read access for everyone (anon and authenticated)
CREATE POLICY "Allow public read access" ON daily_challenges
    FOR SELECT USING (true);

-- Create policy to allow service role (server) to insert/update
CREATE POLICY "Allow service role full access" ON daily_challenges
    USING (true)
    WITH CHECK (true);
