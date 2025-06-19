import { NextResponse } from 'next/server';
import { Client } from 'pg';
import {
  PG_HOST,
  PG_USER,
  PG_PASSWORD,
  PG_DATABASE,
} from '@/config';

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
      SELECT id, title, report, tags, regions, created_at
      FROM reports
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2;
    `;

    const { rows } = await client.query(query, [limit, offset]);

    return NextResponse.json({
      reports: rows || [],
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 });
  } finally {
    await client.end();
  }
}