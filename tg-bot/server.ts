import channels from '@/channels';
import { CHATGPT_API_KEY, TELEGRAM_API_HASH, TELEGRAM_API_ID, TELEGRAM_STRING_SESSION } from '@/config';
import { initializeB2, uploadFile } from '@/lib/backblaze';
import { insert_news_item } from '@/lib/db';
import { schedule_hourly_report_job } from '@/lib/jobs';
import { message } from '@/lib/openai-message';
import input from 'input';
import OpenAI from 'openai';
import { TelegramClient } from 'telegram';
import { NewMessage } from 'telegram/events';
import { StringSession } from 'telegram/sessions';
import { v4 as uuidv4 } from 'uuid';
import { get_channels } from './lib/get-channels';

// Define the Telegram API ID, retrieved from configuration.
const apiId = TELEGRAM_API_ID;
// Define the Telegram API Hash, retrieved from configuration.
const apiHash = TELEGRAM_API_HASH;
// Initialize a new StringSession with the session string from configuration.
const stringSession = new StringSession(TELEGRAM_STRING_SESSION);

// Immediately Invoked Function Expression (IIFE) to set up and run the Telegram bot.
(async () => {

	// Initialize the Telegram client with the session, API ID, API Hash, and connection retry options.
	const telegram_client = new TelegramClient(stringSession, apiId, apiHash, {
		connectionRetries: 5, // Attempt to reconnect 5 times if the connection drops.
	});
	// Initialize the OpenAI client with the API key.
	const openai_client = new OpenAI({
		apiKey: CHATGPT_API_KEY, // Set the OpenAI API key for authentication.
	});

	// Start the Telegram client, prompting the user for phone number, password, and phone code if necessary.
	await telegram_client.start({
		phoneNumber: async () => await input.text('Please enter your number: '), // Prompt for phone number.
		password: async () => await input.text('Please enter your password: '), // Prompt for password (if 2FA is enabled).
		phoneCode: async () => await input.text('Please enter the code you received: '), // Prompt for the verification code.
		onError: (err) => console.log(err), // Log any errors that occur during the connection process.
	});
	// Log a success message once connected to Telegram.
	console.log('You should now be connected.');

	// Schedule the hourly report job
	schedule_hourly_report_job(openai_client);

	get_channels(telegram_client);

	// console.log(telegram_client.session.save()); // This line is commented out, likely for debugging session saving.

	// Initialize the Backblaze B2 client for file uploads.
	await initializeB2();

	// Send a confirmation message to the 'me' chat (saved messages) indicating successful login.
	await telegram_client.sendMessage('me', { message: `Logged into news aggregator bot at ${Date.now().toString()}` });

	// Add an event handler to listen for new messages.
	telegram_client.addEventHandler(async (event: any) => {
		// Check if the message is empty or only contains media, and if so, ignore it.
		if ((!event.message.message || event.message.message.trim() === '') && event.message.media) {
			return; // Exit if no text message is present and only media.
		}
		// Extract the chat ID, removing the '-100' prefix common for channel IDs.
		const chat_id = event.chatId ? event.chatId.toString().replace('-100', '') : null;
		// Find the channel configuration based on chat ID or username.
		const channel = channels.find((c) => c.id === chat_id || c.username === event.chat?.username);
		// Determine the source name for logging and OSINT data.
		const source = channel?.title || event.chat?.title || event.chatId
		// Log the new message's source and content to the console.
		console.log(
			`New message from [${source}]:`,
			event.message.message
		);
		// Process the message content using OpenAI, passing the client, message text, channel language, and typical topics.
		const openai_res = await message(openai_client, event.message.message, channel?.language || null, channel?.typical_topics || null, channel?.special_instructions || null);

		// If OpenAI returns a response and it contains text.
		if (openai_res && openai_res.text) {

			// Define the structure for OSINT (Open Source Intelligence) data.
			const osint_data: {
				source: string | number | null; // Source of the message (e.g., channel title, ID).
				timestamp: number; // Timestamp of the message.
				message_id: string; // Unique identifier for the message.
				text: string; // Processed text from OpenAI.
				title?: string | null; // Optional title for the news item.
				original_text?: string | null; // Optional original text if translated.
				original_language?: string | null; // Optional original language if translated.
				tags: string[]; // Tags generated by OpenAI.
				region: string[]; // Region information generated by OpenAI.
				media: string[]; // List of uploaded media file names.
				[key: string]: any; // Allow for additional properties from OpenAI response.
			} = {
				source, // Assign the determined source.
				timestamp:
					// Convert message date to a Unix timestamp in milliseconds.
					typeof event.message.date === 'number'
						? event.message.date * 1000
						: event.message.date.getTime(),
				message_id: `${chat_id}_${event.message.id}`, // Create a unique message ID.
				...openai_res, // Spread the properties from the OpenAI response.
				media: [], // Initialize an empty array for media files.
			};

			// Check if the message contains media.
			if (event.message.media) {
				const media_files: string[] = []; // Array to store names of uploaded media files.
				try {
					// Attempt to download the media content.
					const buffer = await event.message.downloadMedia();
					// If the media buffer is successfully downloaded.
					if (buffer) {
						let originalFileName: string | undefined;
						// Check if the media is a document and has an original file name.
						if (event.message.media && 'document' in event.message.media && event.message.media.document?.attributes[0]?.file_name) {
							originalFileName = event.message.media.document.attributes[0].file_name;
						}

						let fileExtension = '';
						// If an original file name exists, extract its extension.
						if (originalFileName) {
							const parts = originalFileName.split('.');
							if (parts.length > 1) {
								fileExtension = `.${parts.pop()}`; // Get the last part as the extension.
							}
						} else if (event.message.media) {
							// If no original file name, try to determine extension from MIME type or photo type.
							if ('document' in event.message.media && event.message.media.document?.mimeType) {
								const mimeParts = event.message.media.document.mimeType.split('/');
								if (mimeParts.length > 1) {
									fileExtension = `.${mimeParts.pop()}`; // Extract extension from MIME type.
								}
							} else if ('photo' in event.message.media) {
								fileExtension = '.jpeg'; // Default to .jpeg for photos.
							}
						}


						// Generate a unique filename for the uploaded media using message ID and a UUID.
						const filename = `${event.message.id}_${uuidv4()}${fileExtension}`;
						let mimeType: string = 'application/octet-stream'; // Default MIME type for unknown files.

						// Determine the MIME type based on the media properties.
						if (event.message.media && 'document' in event.message.media && event.message.media.document?.mimeType) {
							mimeType = event.message.media.document.mimeType; // Use document's MIME type if available.
						} else if (event.message.media && 'photo' in event.message.media) {
							// For photos, a common default is image/jpeg.
							mimeType = 'image/jpeg';
						}

						// If the buffer contains data, proceed with upload.
						if (buffer.length > 0) {
							// Upload the file to Backblaze B2.
							const upload_result = await uploadFile(filename, buffer, mimeType);
							// If the upload was successful and a file name is returned.
							if (upload_result && upload_result.fileName) {
								media_files.push(upload_result.fileName); // Add the uploaded file name to the list.
							}
						}
					}
				} catch (error) {
					// Log any errors encountered during media download or upload.
					console.error('Error downloading or uploading media:', error);
				}
				// Assign the list of uploaded media files to the OSINT data.
				osint_data.media = media_files;
			}

			// If the original language is English, remove the original_language and original_text fields as they are redundant.
			if (osint_data.original_language === 'English') {
				delete osint_data.original_language; // Remove the original_language field.

				if (osint_data.original_text) {
					delete osint_data.original_text; // Remove the original_text field if it exists.
				}
			}

			// Insert the processed OSINT data into the database.
			await insert_news_item(osint_data);
			// Log that OSINT data has been processed.
			console.log('Inserted news item to the database.');
		}

	}, new NewMessage({ chats: channels.map((c) => (c.username !== 'N/A' ? c.username : c.id)) })); // Register the event handler for new messages from specified channels.


})(); // End of the IIFE.
