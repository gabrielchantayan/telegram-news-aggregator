'use client';
import { useState } from "react"
import { Badge } from "./ui/badge"


const NewsCard = ({
    source,
    title,
    text,
    original_text,
    original_language,
    tags,
    timestamp
}: {
    source: string,
    title?: string,
    text: string,
    original_text?: string,
    original_language?: string,
    tags: string[],
    timestamp: number
}) => {

    const [showing_translation, show_translation] = useState(false)

    const date = new Date(timestamp)
    const formatted_date = date.toLocaleDateString('en-US');

    const formatted_time = date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
    })

    return (
		<div className='flex flex-row gap-4'>
			<div className='text-sm w-20 flex flex-col items-end'>
				<p>{formatted_date}</p>
				<p>{formatted_time}</p>
			</div>
			<div className='flex flex-col w-150'>
				<p className='text-sm text-accent'>{source}</p>
				{title && <p className='text-lg font-semibold'>{title}</p>}
				<p className='text my-2 whitespace-pre-wrap'>{text}</p>
				{original_language && (
					<p className='text-sm text-accent-foreground mt-2 cursor-pointer'>
						<button onClick={() => show_translation(!showing_translation)}>
							Original Language: {original_language} ({showing_translation ? 'Hide' : 'Show'})
						</button>
					</p>
				)}
				{original_language && showing_translation && (
					<p className='text-sm mt-1 text-accent-foreground whitespace-pre-wrap'>{original_text}</p>
				)}
				<div className='flex flex-row gap-2 mt-2'>
					{tags.map((tag) => (
						<Badge key={tag}>{tag}</Badge>
					))}
				</div>
			</div>
		</div>
	);
}

export default NewsCard