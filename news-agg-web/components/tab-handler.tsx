'use client';

import { useState } from 'react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import InfiniteNews, { NewsItem } from './infinite-news';
import InfiniteReports, { ReportItem } from './infinite-reports';

export const TabHandler = ({ initialNews, initialReports }: { initialNews: NewsItem[], initialReports: ReportItem[] }) => {
	const [tab, set_tab] = useState('news');

	const handle_tab_change = (tab: string) => {
		if (tab === '' || tab === null) return;
		set_tab(tab);
	};

	return (
		<div className='flex flex-col items-start gap-4'>
			<ToggleGroup value={tab} onValueChange={handle_tab_change} type='single'>
				<ToggleGroupItem value='news'>News</ToggleGroupItem>
				<ToggleGroupItem value='hourly_reports'>Hourly Reports</ToggleGroupItem>
			</ToggleGroup>

			{tab === 'news' && <InfiniteNews initialNews={initialNews} />}
			{tab === 'hourly_reports' && <InfiniteReports initialReports={initialReports} />}
		</div>
	);
};
