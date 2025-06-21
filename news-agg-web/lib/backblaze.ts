import B2 from 'backblaze-b2';
import {
	BACKBLAZE_BUCKET_NAME,
	BACKBLAZE_KEY_ID,
	BACKBLAZE_APPLICATION_KEY
} from '@/config';

const b2 = new B2({
	applicationKeyId: BACKBLAZE_KEY_ID,
	applicationKey: BACKBLAZE_APPLICATION_KEY
});

let cachedBucketId: string | null = null;

export const initializeB2 = async () => {
	await b2.authorize();
	console.log('Backblaze B2 client authorized successfully.');

	try {
		const { data: { buckets } } = await b2.listBuckets();

		const bucket = buckets.find((b: { bucketName: string; bucketId: string }) => b.bucketName === BACKBLAZE_BUCKET_NAME);
		if (bucket) {
			cachedBucketId = bucket.bucketId;
			console.log(`Backblaze B2 bucket ID cached: ${cachedBucketId}`);
		} else {
			throw new Error(`Bucket "${BACKBLAZE_BUCKET_NAME}" not found.`);
		}
	} catch (error) {
		console.error('Error fetching Backblaze B2 bucket ID:', error);
		throw error;
	}
};

export interface DownloadFileByNameOptions {
	bucketName: string;
	fileName: string;
	responseType: 'arraybuffer';
	range?: string;
}

export const downloadFile = async (fileName: string, range?: string) => {
	if (!cachedBucketId) {
		await initializeB2();
	}

	const options: DownloadFileByNameOptions = {
		bucketName: BACKBLAZE_BUCKET_NAME,
		fileName,
		responseType: 'arraybuffer'
	};

	if (range) {
		options.range = range;
	}

	const { data, headers } = await b2.downloadFileByName(options);
	return {
		buffer: Buffer.from(data),
		contentLength: headers['content-length'],
		contentType: headers['content-type']
	};
};