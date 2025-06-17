export const dynamic = 'force-dynamic';
export const revalidate = 0;
import InfiniteNews from '@/components/InfiniteNews';
import { Client } from 'pg';
import { PG_DATABASE, PG_HOST, PG_PASSWORD, PG_USER } from '../config';

interface NewsItem {
	source: string;
	title?: string;
	text: string;
	original_text?: string;
	original_language?: string;
	tags?: string[];
	timestamp: number;
	media?: string[];
	region?: string[];
}

export default async function Home() {
	let news: NewsItem[] = [];
	const client = new Client({
		host: PG_HOST,
		user: PG_USER,
		password: PG_PASSWORD,
		database: PG_DATABASE,
	});

	try {
		await client.connect();
		const res = await client.query('SELECT * FROM news_items ORDER BY timestamp DESC LIMIT 25 OFFSET 0');
		news = res.rows.map((row) => ({
			source: row.source,
			timestamp: Number(row.timestamp),
			message_id: row.message_id,
			text: row.text,
			title: row.title,
			original_text: row.original_text,
			original_language: row.original_language,
			tags: row.tags,
			region: row.region,
			media: row.media,
		}));
	} catch (err) {
		console.error('Error fetching news:', err);
	} finally {
		await client.end();
	}

	return (
		<div className='grid grid-rows-[auto_1fr_20px] items-start  min-h-screen p-8 pb-20 gap-16 md:p-20 font-[family-name:var(--font-geist-mono)]'>
			<div className='max-w-[80vw] md:max-w-120'>
				<h1 className='text-xl md:text-3xl font-semibold'>OSINT News Aggregator</h1>
				<p>
					A collection of news from various Telegraph channels, translated to English, tagged, then published in a feed.
				</p>
				<p className='mt-4'>
					{news.length} pieces of news
				</p>
			</div>
			<InfiniteNews initialNews={news} />
		</div>
	);
}
