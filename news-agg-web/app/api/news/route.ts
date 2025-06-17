import { NextResponse } from 'next/server';
import { Client } from 'pg';
import {
  PG_HOST,
  PG_USER,
  PG_PASSWORD,
  PG_DATABASE,
} from '../../../config';


export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '0', 10);
  const limit = parseInt(searchParams.get('limit') || '25', 10);
  const offset = page * limit;

  const client = new Client({
    host: PG_HOST,
    user: PG_USER,
    password: PG_PASSWORD,
    database: PG_DATABASE,
  });

  try {
    await client.connect();

    const query = `
      WITH
        total_count AS (
          SELECT COUNT(*) AS count FROM news_items
        ),
        past_hour_count AS (
          SELECT COUNT(*) AS count FROM news_items
          WHERE timestamp >= (EXTRACT(EPOCH FROM NOW()) * 1000 - 3600 * 1000)
        ),
        past_day_count AS (
          SELECT COUNT(*) AS count FROM news_items
          WHERE timestamp >= (EXTRACT(EPOCH FROM NOW()) * 1000 - 24 * 3600 * 1000)
        ),
        latest_news AS (
          SELECT id, title, text, timestamp, source, media, region, tags, original_language, original_text, notes FROM news_items
          ORDER BY timestamp DESC
          LIMIT $1 OFFSET $2
        )
      SELECT
        (SELECT count FROM total_count) AS total,
        (SELECT count FROM past_hour_count) AS past_hour_count,
        (SELECT count FROM past_day_count) AS past_day_count,
        (SELECT json_agg(latest_news.*) FROM latest_news) AS news;
    `;

    const { rows } = await client.query(query, [limit, offset]);
    const result = rows[0];

    return NextResponse.json({
		items_total: parseInt(result.total, 10),
		items_past_hour: parseInt(result.past_hour_count, 10),
		items_past_day: parseInt(result.past_day_count, 10),
		news: result.news || [],
	});
  } catch (error) {
    console.error('Error fetching news items:', error);
    return NextResponse.json({ error: 'Failed to fetch news items' }, { status: 500 });
  } finally {
    await client.end();
  }
}