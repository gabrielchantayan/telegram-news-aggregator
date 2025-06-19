export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { TabHandler } from '@/components/tab-handler';
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

// Define ReportItem interface
export interface ReportItem {
	id: number;
	title: string;
	report: string;
	tags: string[];
	regions: string[];
	created_at: string; // ISO timestamp
}

// Define ReportsApiResponse interface
interface ReportsApiResponse {
  reports: ReportItem[];
}

export default async function Home() {
	let news_res_json: NewsApiResponse = {
		items_total: 0,
		items_past_hour: 0,
		items_past_day: 0,
		news: []
	};

	let reports_res_json: ReportsApiResponse = { // Initialize reports_res
		reports: []
	};

	try {
		const headers_list = await headers();
		const host = headers_list.get('host');
		const protocol = process.env.NODE_ENV === 'development' ? 'http://' : 'https://';
		const base_url = process.env.NEXT_PUBLIC_BASE_URL || `${protocol}${host}`;
		
		// Fetch news and reports concurrently
		const news_promise = fetch(`${base_url}/api/news`);
		const reports_promise = fetch(`${base_url}/api/reports?page=0&limit=25`);

		const [news_res, reports_res] = await Promise.all([news_promise, reports_promise]);

		if (!news_res.ok) {
			throw new Error(`HTTP error! status: ${news_res.status}`);
		}
		news_res_json = await news_res.json();

		if (!reports_res.ok) {
			throw new Error(`HTTP error! status: ${reports_res.status}`);
		}
		reports_res_json = await reports_res.json();

	} catch (err) {
		console.error('Error fetching data:', err);
	}

	return (
		<div className='grid grid-rows-[auto_1fr_20px] items-start  min-h-screen p-8 pb-20 gap-8 md:p-20 font-[family-name:var(--font-geist-mono)]'>
			<div className='max-w-[80vw] md:max-w-120'>
				<h1 className='text-xl md:text-3xl font-semibold'>OSINT News Aggregator</h1>
				<p>
					A collection of news from various Telegraph channels, translated to English, tagged, then published in a feed.
				</p>
				<p className='mt-4'>{news_res_json.items_total} pieces of news</p>
				<p className='text-sm'>{news_res_json.items_past_hour} in the past hour</p>
				<p className='text-sm'>{news_res_json.items_past_day} in the past 24 hours</p>
			</div>
			<TabHandler initialNews={news_res_json.news} initialReports={reports_res_json.reports} />
		</div>
	);
}
