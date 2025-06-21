import { NextResponse } from 'next/server';
import { downloadFile } from '@/lib/backblaze';

const mimeTypes: { [key: string]: string } = {
	mp4: 'video/mp4',
	webm: 'video/webm',
	ogg: 'video/ogg',
	jpg: 'image/jpeg',
	jpeg: 'image/jpeg',
	png: 'image/png',
	gif: 'image/gif'
};

export async function GET(
	request: Request,
	{ params }: { params:Promise<{ id: string }> }
) {
	const { id } = await params;
	const range = request.headers.get('range');

	try {
		const fileExtension = id.split('.').pop();
		const contentType = fileExtension ? mimeTypes[fileExtension] || 'application/octet-stream' : 'application/octet-stream';

		const { buffer, contentLength } = await downloadFile(id, range || undefined);

		if (range && contentLength) {
			const parts = range.replace(/bytes=/, '').split('-');
			const start = parseInt(parts[0], 10);
			const end = parts[1] ? parseInt(parts[1], 10) : contentLength - 1;
			const chunksize = (end - start) + 1;

			const response = new NextResponse(buffer, {
				status: 206,
				headers: {
					'Content-Range': `bytes ${start}-${end}/${contentLength}`,
					'Accept-Ranges': 'bytes',
					'Content-Length': chunksize.toString(),
					'Content-Type': contentType,
				},
			});
			return response;
		} else {
			const response = new NextResponse(buffer, {
				status: 200,
				headers: {
					'Content-Type': contentType,
					'Content-Length': contentLength?.toString() || buffer.length.toString(),
				},
			});
			return response;
		}
	} catch (error) {
		console.error(`Error fetching media for ID ${id}:`, error);
		return NextResponse.json({ error: 'Failed to fetch media' }, { status: 500 });
	}
}
