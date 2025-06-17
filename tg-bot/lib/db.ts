import { Client } from 'pg';
import { PG_HOST, PG_USER, PG_PASSWORD, PG_DATABASE } from '@/config';

const client = new Client({
    host: PG_HOST,
    user: PG_USER,
    password: PG_PASSWORD,
    database: PG_DATABASE,
});

client.connect();

export async function insert_news_item(item: { source: string | number | null; timestamp: number; message_id: string; text: string; title?: string | null; original_text?: string | null; original_language?: string | null; tags: string[]; region: string[]; media: string[] }) {
    try {
        const query = `
            INSERT INTO news_items(source, timestamp, message_id, text, title, original_text, original_language, tags, region, media)
            VALUES($1, $2, $3, $4, $5, $6, $7, $8::text[], $9::text[], $10::jsonb)
            ON CONFLICT (message_id) DO NOTHING;
        `;
        const values = [
            item.source,
            item.timestamp,
            item.message_id,
            item.text,
            item.title || null,
            item.original_text || null,
            item.original_language || null,
            item.tags,
            item.region,
            JSON.stringify(item.media),
        ];
        await client.query(query, values);
    } catch (error) {
        console.error('Error inserting news item:', error);
        throw error;
    }
}