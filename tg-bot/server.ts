import input from 'input';
import { TelegramClient } from 'telegram';
import { NewMessage } from 'telegram/events';
import { StringSession } from 'telegram/sessions';
import channels from '@/channels';
import { CHATGPT_API_KEY, TELEGRAM_API_HASH, TELEGRAM_API_ID, TELEGRAM_STRING_SESSION } from '@/config';
import OpenAI from 'openai';
import { message } from '@/lib/openai-message';
import { initializeB2, uploadFile } from '@/lib/backblaze';
import { v4 as uuidv4 } from 'uuid';

const apiId = TELEGRAM_API_ID;
const apiHash = TELEGRAM_API_HASH;
const stringSession = new StringSession(TELEGRAM_STRING_SESSION);

(async () => {

	const telegram_client = new TelegramClient(stringSession, apiId, apiHash, {
		connectionRetries: 5,
	});
	const openai_client = new OpenAI({
		apiKey: CHATGPT_API_KEY, // This is the default and can be omitted
	});

	await telegram_client.start({
		phoneNumber: async () => await input.text('Please enter your number: '),
		password: async () => await input.text('Please enter your password: '),
		phoneCode: async () => await input.text('Please enter the code you received: '),
		onError: (err) => console.log(err),
	});
	console.log('You should now be connected.');

	// console.log(telegram_client.session.save());

	await initializeB2();

	await telegram_client.sendMessage('me', { message: `Logged into news aggregator bot at ${Date.now().toString()}` });

	telegram_client.addEventHandler(async (event: any) => {
		if ((!event.message.message || event.message.message.trim() === '') && event.message.media) {
			return;
		}
		const chatId = event.chatId ? event.chatId.toString().replace('-100', '') : null;
		const channel = channels.find((c) => c.id === chatId || c.username === event.chat?.username);
		const source = channel?.title || event.chat?.title || event.chatId
		console.log(
			`New message from [${source}]:`,
			event.message.message
		);
		const openai_res = await message(openai_client, event.message.message);

		if (openai_res) {

			const osint_data: {
				source: string | number | null;
				timestamp: number;
				media: string[];
				[key: string]: any;
			} = {
				source,
				timestamp:
		typeof event.message.date === 'number'
				? event.message.date * 1000
				: event.message.date.getTime(),
				...openai_res,
				media: [],
			};

			if (event.message.media) {
				const mediaFiles: string[] = [];
				try {
					const buffer = await event.message.downloadMedia();
					if (buffer) {
						const filename = `${event.message.id}_${uuidv4()}`;
						let mimeType: string = 'application/octet-stream'; // Default MIME type

						// Determine mimeType based on event.message.media properties
						if (event.message.media && 'document' in event.message.media && event.message.media.document?.mimeType) {
							mimeType = event.message.media.document.mimeType;
						} else if (event.message.media && 'photo' in event.message.media) {
							// For photos, a common default is image/jpeg
							mimeType = 'image/jpeg';
						}

						if (buffer.length > 0) {
							const uploadResult = await uploadFile(filename, buffer, mimeType);
							if (uploadResult && uploadResult.fileName) {
								mediaFiles.push(uploadResult.fileName);
							}
						}
					}
				} catch (error) {
					console.error('Error downloading or uploading media:', error);
				}
				osint_data.media = mediaFiles;
			}

			console.log(JSON.stringify(osint_data, null, 2));
		}

	}, new NewMessage({ chats: channels.map((c) => (c.username !== 'N/A' ? c.username : c.id)) }));

	


})();
