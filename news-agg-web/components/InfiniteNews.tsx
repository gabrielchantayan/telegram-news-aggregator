"use client";

import { useState, useRef, useEffect } from 'react';
import NewsCard from '@/components/news-card';

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

interface InfiniteNewsProps {
	initialNews: NewsItem[];
}

const InfiniteNews: React.FC<InfiniteNewsProps> = ({ initialNews }) => {
	const [items, setItems] = useState<NewsItem[]>(initialNews);
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
					fetchMoreNews();
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

	const fetchMoreNews = async () => {
		setLoading(true);
		try {
			const res = await fetch(`/api/news?page=${page + 1}&limit=25`);
			const newItems: NewsItem[] = await res.json();
			setItems((prevItems) => [...prevItems, ...newItems]);
			setPage((prevPage) => prevPage + 1);
			setHasMore(newItems.length === 25);
		} catch (error) {
			console.error('Error fetching more news:', error);
			setHasMore(false); // Stop trying to load more on error
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className='flex flex-col gap-16 md:gap-8'>
			{items.map((n, i) => (
				<NewsCard
					key={i}
					source={n.source}
					title={n.title}
					text={n.text}
					original_text={n.original_text}
					original_language={n.original_language}
					tags={n.tags}
					timestamp={n.timestamp}
					media={n.media}
					region={n.region}
				/>
			))}
			{loading && <div className='text-center'>Loading...</div>}
			{hasMore && <div ref={loaderRef} className='h-1' />}
		</div>
	);
};

export default InfiniteNews;