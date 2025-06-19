import { news_item_prompt } from "@/prompt";

const NEWS_ITEM_CACHE: string[] = []; // Module-level array to cache the last 20 parsed news item texts.

export const message = async  ( client, message, language, topics, special_instructions? ) => {

	let generated_prompt = news_item_prompt;

	if (language) {
		generated_prompt += `\n\nThis channel typically is in ${language}`;
	}

	if (topics) {
		generated_prompt += `\n\nThis channel typically covers the following topics: ${topics.join(', ')}\nThe message may or may not be about one of these topics. Use your best judgement.`;
	}

	if (special_instructions) {
		generated_prompt += `\n\nYou have been given the following special instructions regarding the source of news: ${special_instructions}`;
	}

	// Append PREVIOUS_ITEMS if cache is not empty
	if (NEWS_ITEM_CACHE.length > 0) {
		generated_prompt += `\n\nPREVIOUS_ITEMS: ${JSON.stringify(NEWS_ITEM_CACHE)}\n\nUse Rule 8 for duplicate filtering.`;
	}

    const response = await client.responses.create({
		model: 'gpt-4.1-nano-2025-04-14',
		instructions: generated_prompt,
		input: message,
	});

	const output_text = response.output_text.trim();

	// If output is empty or whitespace, return null (indicating a duplicate)
	if (!output_text) {
		return null;
	}

	const parsed_output = JSON.parse(output_text);

	// Push only the 'text' field to cache, drop oldest if cache exceeds 20 items
	NEWS_ITEM_CACHE.push(parsed_output.text);
	if (NEWS_ITEM_CACHE.length > 20) {
		NEWS_ITEM_CACHE.shift(); // Remove the oldest item
	}

	return parsed_output;
}