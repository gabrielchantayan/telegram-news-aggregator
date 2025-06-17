import { news_item_prompt } from "@/prompt";

export const message = async  ( client, message, language, topics ) => {

	let generated_prompt = news_item_prompt;

	if (language) {
		generated_prompt += `\n\nThis channel typically is in ${language}`;
	}

	if (topics) {
		generated_prompt += `\n\nThis channel typically covers the following topics: ${topics.join(', ')}\nThe message may or may not be about one of these topics. Use your best judgement.`;
	}

    const response = await client.responses.create({
		model: 'gpt-4.1-nano-2025-04-14',
		instructions: generated_prompt,
		input: message,
	});

	return JSON.parse(response.output_text);
}