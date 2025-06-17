import { NextResponse } from 'next/server';
import { Client } from 'pg';
import {
  PG_HOST,
  PG_USER,
  PG_PASSWORD,
  PG_DATABASE,
} from '../../../config';

interface NewsItem {
  id: string;
  title: string;
  content: string;
  timestamp: string;
  source: string;
  url: string;
}

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
      SELECT * FROM news_items
      ORDER BY timestamp DESC
      LIMIT $1 OFFSET $2
    `;
    const { rows } = await client.query(query, [limit, offset]);
    return NextResponse.json(rows as NewsItem[]);
  } catch (error) {
    console.error('Error fetching news items:', error);
    return NextResponse.json({ error: 'Failed to fetch news items' }, { status: 500 });
  } finally {
    await client.end();
  }
}