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

	// Fetch and cache bucketId
	try {
		const { data: { buckets } } = await b2.listBuckets({
			accountId: BACKBLAZE_KEY_ID,
			bucketName: BACKBLAZE_BUCKET_NAME
		});

		const bucket = buckets.find(b => b.bucketName === BACKBLAZE_BUCKET_NAME);
		if (bucket) {
			cachedBucketId = bucket.bucketId;
			console.log(`Backblaze B2 bucket ID cached: ${cachedBucketId}`);
		} else {
			throw new Error(`Bucket "${BACKBLAZE_BUCKET_NAME}" not found.`);
		}
	} catch (error) {
		console.error('Error fetching Backblaze B2 bucket ID:', error);
		throw error; // Re-throw to indicate initialization failure
	}
};

export const uploadFile = async (fileName: string, fileContent: Buffer, mime: string) => {
	if (!b2.accountId || !cachedBucketId) {
		await initializeB2();
	}

	if (!cachedBucketId) {
		throw new Error('Backblaze B2 bucket ID is not available. Initialization failed.');
	}

	const {
		data: {
			uploadUrl,
			authorizationToken
		}
	} = await b2.getUploadUrl({ bucketId: cachedBucketId });

	const {
		data
	} = await b2.uploadFile({
		uploadUrl,
		uploadAuthToken: authorizationToken,
		bucketId: cachedBucketId,
		fileName,
		data: fileContent,
		info: {
			'Content-Type': mime
		}
	});
	return data;
};

export const downloadFile = async (fileName: string) => {
	if (!b2.accountId) {
		await initializeB2();
	}

	const {
		data
	} = await b2.downloadFileByName({
		bucketName: BACKBLAZE_BUCKET_NAME,
		fileName,
		responseType: 'arraybuffer'
	});
	return Buffer.from(data);
};

export default b2;