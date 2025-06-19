'use client';
import { useState } from 'react';
import { Badge } from './ui/badge';
import Image from 'next/image';

/**
 * Renders a news card component displaying news item details.
 * 
 * @param {Object} props - The properties object.
 * @param {string} props.source - The source of the news item.
 * @param {string} [props.title] - The title of the news item, if available.
 * @param {string} props.text - The main text of the news item.
 * @param {string} [props.original_text] - The original text of the news item, if translated.
 * @param {string} [props.original_language] - The original language of the news item, if translated.
 * @param {string[]} [props.tags] - An array of tags associated with the news item.
 * @param {number} props.timestamp - The timestamp of when the news item was published.
 * @param {string[]} [props.media] - An array of media items related to the news item.
 * @param {string[]} [props.region] - An array of regions associated with the news item.
 */
const NewsCard = ({
	source,
	title,
	text,
	original_text,
	original_language,
	tags,
	timestamp,
	media,
	region,
	notes
}: {
	source: string;
	title?: string;
	text: string;
	original_text?: string;
	original_language?: string;
	tags?: string[];
	timestamp: number;
	media?: string[];
	region?: string[];
	notes?: string
}) => {
	const [showing_translation, show_translation] = useState(false);

	const date = new Date(timestamp);
	const formatted_date = date.toLocaleDateString('en-US');

	const formatted_time = date.toLocaleTimeString('en-US', {
		hour: 'numeric',
		minute: 'numeric',
		hour12: true,
	});

	return (
		<div className='flex flex-col md:flex-row md:gap-4'>
			<div className='text-sm md:w-20 gap-2 md:gap-0 flex flex-row md:flex-col items-start md:items-end'>
				<p>{formatted_date}</p>
				<p>{formatted_time}</p>
			</div>
			<div className='flex flex-col w-[80vw] md:w-150'>
				<p className='text-sm text-accent'>{source}</p>
				{title && <p className='text-lg font-semibold'>{title}</p>}
				<p className='text-sm md:text-base mt-1 md:mt-0 mb-2 whitespace-pre-wrap'>{text}</p>
				<div className='flex flex-col mt-2'>
					{notes && (
						<div className='flex flex-col md:flex-row gap-1 text-foreground/80 mt-1 items-start text-sm'>
							<p className='font-semibold'>NOTE:</p>
							<p>{notes}</p>
						</div>
					)}

					{media && media.length > 0 && (
						<div className='flex flex-row gap-1 text-accent-foreground mt-1 items-center'>
							<svg
								data-testid='geist-icon'
								height='12'
								strokeLinejoin='round'
								viewBox='0 0 16 16'
								width='12'>
								<path
									fillRule='evenodd'
									clipRule='evenodd'
									d='M10.8591 1.70735C10.3257 1.70735 9.81417 1.91925 9.437 2.29643L3.19455 8.53886C2.56246 9.17095 2.20735 10.0282 2.20735 10.9222C2.20735 11.8161 2.56246 12.6734 3.19455 13.3055C3.82665 13.9376 4.68395 14.2927 5.57786 14.2927C6.47178 14.2927 7.32908 13.9376 7.96117 13.3055L14.2036 7.06304L14.7038 6.56287L15.7041 7.56321L15.204 8.06337L8.96151 14.3058C8.06411 15.2032 6.84698 15.7074 5.57786 15.7074C4.30875 15.7074 3.09162 15.2032 2.19422 14.3058C1.29682 13.4084 0.792664 12.1913 0.792664 10.9222C0.792664 9.65305 1.29682 8.43592 2.19422 7.53852L8.43666 1.29609C9.07914 0.653606 9.95054 0.292664 10.8591 0.292664C11.7678 0.292664 12.6392 0.653606 13.2816 1.29609C13.9241 1.93857 14.2851 2.80997 14.2851 3.71857C14.2851 4.62718 13.9241 5.49858 13.2816 6.14106L13.2814 6.14133L7.0324 12.3835C7.03231 12.3836 7.03222 12.3837 7.03213 12.3838C6.64459 12.7712 6.11905 12.9888 5.57107 12.9888C5.02297 12.9888 4.49731 12.7711 4.10974 12.3835C3.72217 11.9959 3.50444 11.4703 3.50444 10.9222C3.50444 10.3741 3.72217 9.8484 4.10974 9.46084L4.11004 9.46054L9.877 3.70039L10.3775 3.20051L11.3772 4.20144L10.8767 4.70131L5.11008 10.4612C5.11005 10.4612 5.11003 10.4612 5.11 10.4613C4.98779 10.5835 4.91913 10.7493 4.91913 10.9222C4.91913 11.0951 4.98782 11.2609 5.11008 11.3832C5.23234 11.5054 5.39817 11.5741 5.57107 11.5741C5.74398 11.5741 5.9098 11.5054 6.03206 11.3832L6.03233 11.3829L12.2813 5.14072C12.2814 5.14063 12.2815 5.14054 12.2816 5.14045C12.6586 4.7633 12.8704 4.25185 12.8704 3.71857C12.8704 3.18516 12.6585 2.6736 12.2813 2.29643C11.9041 1.91925 11.3926 1.70735 10.8591 1.70735Z'
									fill='currentColor'></path>
							</svg>
							<p className='text-xs whitespace-pre-wrap'>{media.length} piece of media attached</p>
						</div>
					)}

					{media && (
						<div className='flex flex-col items-center justify-center gap-4 mb-2'>
							{media &&
								media.map((id, index) => {
									const url = `/api/media/${id}`;
									return (
										<div key={index} className='relative w-full h-auto'>
											{id.endsWith('.mp4') || id.endsWith('.webm') || id.endsWith('.ogg') ? (
												<p className='text-sm'>Video attachments not yet supported</p>
											) : (
												// <video controls src={url} className='max-w-full max-h-[80vh]' />
												<Image
													src={url}
													alt={`Media ${index + 1}`}
													layout='responsive'
													width={500}
													height={300}
													objectFit='contain'
													className='max-w-full max-h-[80vh] mt-2'
												/>
											)}
										</div>
									);
								})}
						</div>
					)}

					{original_language && (
						<p className='text-sm text-accent-foreground cursor-pointer hover:text-accent'>
							<button className='cursor-pointer' onClick={() => show_translation(!showing_translation)}>
								Original Language: {original_language} ({showing_translation ? 'Hide' : 'Show'})
							</button>
						</p>
					)}

					{original_language && showing_translation && (
						<p className='text-sm mt-1 text-accent-foreground whitespace-pre-wrap'>{original_text}</p>
					)}
					{tags && (
						<div className='flex flex-row flex-wrap gap-2 mt-2 items-center'>
							<svg
								data-testid='geist-icon'
								height='16'
								strokeLinejoin='round'
								viewBox='0 0 16 16'
								width='16'>
								<path
									fillRule='evenodd'
									clipRule='evenodd'
									d='M1.5 1.5H6.34315C7.00619 1.5 7.64207 1.76339 8.11091 2.23223L13.8787 8L8 13.8787L2.23223 8.11091C1.76339 7.64207 1.5 7.00619 1.5 6.34315V1.5ZM16 8L14.9393 6.93934L9.17157 1.17157C8.42143 0.421427 7.40401 0 6.34315 0H1.5H0V1.5V6.34315C0 7.40401 0.421426 8.42143 1.17157 9.17157L6.93934 14.9393L8 16L9.06066 14.9393L14.9393 9.06066L16 8ZM4.5 5.25C4.91421 5.25 5.25 4.91421 5.25 4.5C5.25 4.08579 4.91421 3.75 4.5 3.75C4.08579 3.75 3.75 4.08579 3.75 4.5C3.75 4.91421 4.08579 5.25 4.5 5.25Z'
									fill='currentColor'></path>
							</svg>
							{tags.map((tag) => (
								<Badge key={tag}>{tag}</Badge>
							))}
						</div>
					)}
					{region && (
						<div className='flex flex-row flex-wrap gap-2 mt-2 items-center'>
							<svg
								data-testid='geist-icon'
								height='16'
								strokeLinejoin='round'
								viewBox='0 0 16 16'
								width='16'>
								<path
									fillRule='evenodd'
									clipRule='evenodd'
									d='M10.268 14.0934C11.9051 13.4838 13.2303 12.2333 13.9384 10.6469C13.1192 10.7941 12.2138 10.9111 11.2469 10.9925C11.0336 12.2005 10.695 13.2621 10.268 14.0934ZM8 16C12.4183 16 16 12.4183 16 8C16 3.58172 12.4183 0 8 0C3.58172 0 0 3.58172 0 8C0 12.4183 3.58172 16 8 16ZM8.48347 14.4823C8.32384 14.494 8.16262 14.5 8 14.5C7.83738 14.5 7.67616 14.494 7.51654 14.4823C7.5132 14.4791 7.50984 14.4759 7.50647 14.4726C7.2415 14.2165 6.94578 13.7854 6.67032 13.1558C6.41594 12.5744 6.19979 11.8714 6.04101 11.0778C6.67605 11.1088 7.33104 11.125 8 11.125C8.66896 11.125 9.32395 11.1088 9.95899 11.0778C9.80021 11.8714 9.58406 12.5744 9.32968 13.1558C9.05422 13.7854 8.7585 14.2165 8.49353 14.4726C8.49016 14.4759 8.4868 14.4791 8.48347 14.4823ZM11.4187 9.72246C12.5137 9.62096 13.5116 9.47245 14.3724 9.28806C14.4561 8.87172 14.5 8.44099 14.5 8C14.5 7.55901 14.4561 7.12828 14.3724 6.71194C13.5116 6.52755 12.5137 6.37904 11.4187 6.27753C11.4719 6.83232 11.5 7.40867 11.5 8C11.5 8.59133 11.4719 9.16768 11.4187 9.72246ZM10.1525 6.18401C10.2157 6.75982 10.25 7.36805 10.25 8C10.25 8.63195 10.2157 9.24018 10.1525 9.81598C9.46123 9.85455 8.7409 9.875 8 9.875C7.25909 9.875 6.53877 9.85455 5.84749 9.81598C5.7843 9.24018 5.75 8.63195 5.75 8C5.75 7.36805 5.7843 6.75982 5.84749 6.18401C6.53877 6.14545 7.25909 6.125 8 6.125C8.74091 6.125 9.46123 6.14545 10.1525 6.18401ZM11.2469 5.00748C12.2138 5.08891 13.1191 5.20593 13.9384 5.35306C13.2303 3.7667 11.9051 2.51622 10.268 1.90662C10.695 2.73788 11.0336 3.79953 11.2469 5.00748ZM8.48347 1.51771C8.4868 1.52089 8.49016 1.52411 8.49353 1.52737C8.7585 1.78353 9.05422 2.21456 9.32968 2.84417C9.58406 3.42562 9.80021 4.12856 9.95899 4.92219C9.32395 4.89118 8.66896 4.875 8 4.875C7.33104 4.875 6.67605 4.89118 6.04101 4.92219C6.19978 4.12856 6.41594 3.42562 6.67032 2.84417C6.94578 2.21456 7.2415 1.78353 7.50647 1.52737C7.50984 1.52411 7.51319 1.52089 7.51653 1.51771C7.67615 1.50597 7.83738 1.5 8 1.5C8.16262 1.5 8.32384 1.50597 8.48347 1.51771ZM5.73202 1.90663C4.0949 2.51622 2.76975 3.7667 2.06159 5.35306C2.88085 5.20593 3.78617 5.08891 4.75309 5.00748C4.96639 3.79953 5.30497 2.73788 5.73202 1.90663ZM4.58133 6.27753C3.48633 6.37904 2.48837 6.52755 1.62761 6.71194C1.54392 7.12828 1.5 7.55901 1.5 8C1.5 8.44099 1.54392 8.87172 1.62761 9.28806C2.48837 9.47245 3.48633 9.62096 4.58133 9.72246C4.52807 9.16768 4.5 8.59133 4.5 8C4.5 7.40867 4.52807 6.83232 4.58133 6.27753ZM4.75309 10.9925C3.78617 10.9111 2.88085 10.7941 2.06159 10.6469C2.76975 12.2333 4.0949 13.4838 5.73202 14.0934C5.30497 13.2621 4.96639 12.2005 4.75309 10.9925Z'
									fill='currentColor'></path>
							</svg>
							{region.map((region) => (
								<Badge key={region}>{region}</Badge>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
};


export default NewsCard;
