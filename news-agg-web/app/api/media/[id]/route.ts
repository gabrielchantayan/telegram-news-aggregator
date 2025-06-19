import { NextResponse } from 'next/server';
import { downloadFile } from '@/lib/backblaze';

export async function GET(
	request: Request,
	{ params }: { params: Promise<{ id: string }> }
) {
	const { id } = await params;

	try {
		const fileBuffer = await downloadFile(id);
		const response = new NextResponse(fileBuffer);
		// You might need to set the correct Content-Type based on the file extension
		// For simplicity, we're assuming common image/video types or letting the browser infer
		response.headers.set('Content-Type', 'application/octet-stream'); // Default, override if known
		return response;
	} catch (error) {
		console.error(`Error fetching media for ID ${id}:`, error);
		return NextResponse.json({ error: 'Failed to fetch media' }, { status: 500 });
	}
}
