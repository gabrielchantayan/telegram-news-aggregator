CREATE DATABASE osint_news;

CREATE TABLE news_items (
    id SERIAL PRIMARY KEY,
    source TEXT,
    timestamp BIGINT,
    message_id TEXT UNIQUE,
    text TEXT,
    title TEXT,
    original_text TEXT,
    original_language TEXT,
    tags TEXT[],       -- Array of text for multiple tags
    region TEXT[],     -- Array of text for multiple regions
    media JSONB        -- JSONB for flexibility (e.g., empty list or future media details)
);


CREATE TABLE reports (
    id SERIAL PRIMARY KEY,
    title TEXT,                          -- Title of the report
    report TEXT,                         -- Full text of the report
    tags TEXT[],                         -- Array of tags
    regions TEXT[],                      -- Array of regions
    created_at TIMESTAMPTZ DEFAULT NOW() -- Automatic timestamp
);