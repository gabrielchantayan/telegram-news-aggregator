"use client";

import { useState, useRef, useEffect } from 'react';
import ReportCard from '@/components/report-card';

export interface ReportItem {
	id: number;
	title: string;
	report: string;
	tags: string[];
	regions: string[];
	created_at: string; // ISO timestamp
}

interface InfiniteReportsProps {
	initialReports: ReportItem[];
}

const InfiniteReports: React.FC<InfiniteReportsProps> = ({ initialReports }) => {
	const [items, setItems] = useState<ReportItem[]>(initialReports);
	const [page, setPage] = useState(0);
	const [loading, setLoading] = useState(false);
	const [hasMore, setHasMore] = useState(true);
	const loaderRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!loaderRef.current) return;

		const observer = new IntersectionObserver(
			(entries) => {
				const target = entries[0];
				if (target.isIntersecting && hasMore && !loading) {
					fetchMoreReports();
				}
			},
			{
				root: null,
				rootMargin: '20px',
				threshold: 1.0,
			}
		);

		if (loaderRef.current) {
			observer.observe(loaderRef.current);
		}

		return () => {
			if (loaderRef.current) {
				observer.unobserve(loaderRef.current);
			}
		};
	}, [hasMore, loading]);

	const fetchMoreReports = async () => {
		setLoading(true);
		try {
			const res = await fetch(`/api/reports?page=${page + 1}&limit=25`);
			const data = await res.json();
			const newItems: ReportItem[] = data.reports || [];
			setItems((prevItems) => [...prevItems, ...newItems]);
			setPage((prevPage) => prevPage + 1);
			setHasMore(newItems.length === 25);
		} catch (error) {
			console.error('Error fetching more reports:', error);
			setHasMore(false); // Stop trying to load more on error
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className='flex flex-col gap-16 md:gap-8'>
			{items.map((r, i) => (
				<ReportCard
					key={i}
					id={r.id}
					title={r.title}
					report={r.report}
					tags={r.tags}
					regions={r.regions}
					created_at={r.created_at}
				/>
			))}
			{loading && <div className='text-center'>Loading...</div>}
			{hasMore && <div ref={loaderRef} className='h-1' />}
		</div>
	);
};

export default InfiniteReports;