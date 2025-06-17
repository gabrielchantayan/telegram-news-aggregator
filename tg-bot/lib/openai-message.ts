import { prompt } from "@/prompt";

export const message = async  ( client, message ) => {
    const response = await client.responses.create({
		model: 'gpt-4.1-nano-2025-04-14',
		instructions: prompt,
		input: message,
	});

	return JSON.parse(response.output_text || '{}');
}