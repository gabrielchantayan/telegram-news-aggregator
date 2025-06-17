import { TelegramClient } from "telegram";

export const get_channels = async (client: TelegramClient) => {
    console.log('Getting channels...');
    const dialogs = await client.getDialogs();
    const channels = dialogs
        .filter(dialog => dialog.isChannel)
        .map(dialog => ({
            id: dialog.entity.id.toString(),
            title: dialog.title,
            username: (dialog.entity as any).username || 'N/A'
        }));
		
    console.log('Found channels:', channels);
}