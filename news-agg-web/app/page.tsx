export const dynamic = 'force-dynamic';
export const revalidate = 0;
import InfiniteNews from '@/components/InfiniteNews';
import { headers } from 'next/headers';

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

interface NewsApiResponse {
  items_total: number;
  items_past_hour: number;
  items_past_day: number;
  news: NewsItem[];
}

export default async function Home() {
	let news_res: NewsApiResponse = {
		items_total: 0,
		items_past_hour: 0,
		items_past_day: 0,
		news: []
	};

	try {
		const headersList = await headers();
		const host = headersList.get('host');
		const protocol = process.env.NODE_ENV === 'development' ? 'http://' : 'https://';
		const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${protocol}${host}`;
		const res = await fetch(`${baseUrl}/api/news`);
		if (!res.ok) {
			throw new Error(`HTTP error! status: ${res.status}`);
		}
		news_res = await res.json();
	} catch (err) {
		console.error('Error fetching news:', err);
	}

	return (
		<div className='grid grid-rows-[auto_1fr_20px] items-start  min-h-screen p-8 pb-20 gap-16 md:p-20 font-[family-name:var(--font-geist-mono)]'>
			<div className='max-w-[80vw] md:max-w-120'>
				<h1 className='text-xl md:text-3xl font-semibold'>OSINT News Aggregator</h1>
				<p>
					A collection of news from various Telegraph channels, translated to English, tagged, then published in a feed.
				</p>
				<p className='mt-4'>{news_res.items_total} pieces of news</p>
				<p className='text-sm'>{news_res.items_past_hour} in the past hour</p>
				<p className='text-sm'>{news_res.items_past_day} in the past 24 hours</p>
			</div>
			<InfiniteNews initialNews={news_res.news} />
		</div>
	);
}
