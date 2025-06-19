import cron from 'node-cron';
import { db, insert_hourly_report } from '@/lib/db';
import { hourly_report_prompt } from '@/prompt';

import OpenAI from 'openai';

export async function schedule_hourly_report_job(openai_client: OpenAI): Promise<void> {
    cron.schedule('0 * * * *', async () => {
        try {
            const now = new Date();
            const end_of_previous_hour = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), 0, 0, -1);
            const start_of_previous_hour = new Date(end_of_previous_hour.getFullYear(), end_of_previous_hour.getMonth(), end_of_previous_hour.getDate(), end_of_previous_hour.getHours(), 0, 0);

            console.log(`Running hourly report job for ${start_of_previous_hour.toISOString()} to ${end_of_previous_hour.toISOString()}`);

            const { rows: news_items } = await db.query(
                `SELECT * FROM news_items WHERE timestamp >= $1 AND timestamp <= $2`,
                [start_of_previous_hour, end_of_previous_hour]
            );

            let report_text: string;
            let tags: string[] = [];
            let regions: string[] = [];
            let title: string;

            if (news_items.length === 0) {
                report_text = "No news to report";
                title = 'The past hour has been calm...';
            } else {
                const news_block = news_items.map((item: any) => `Title: ${item.title}\nSummary: ${item.summary}`).join('\n\n');
                const prompt = `${hourly_report_prompt}\n\n${news_block}`;
                const openai_response = await openai_client.chat.completions.create({
                    model: "gpt-4o",
                    messages: [{ role: "user", content: prompt }],
                    response_format: { type: "json_object" },
                });

                const json_string = openai_response.choices[0].message?.content;
                if (!json_string) {
                    throw new Error("OpenAI response was empty.");
                }

                const parsed_response = JSON.parse(json_string);
                title = parsed_response.title;
                report_text = parsed_response.report;
                tags = parsed_response.tags || [];
                regions = parsed_response.regions || [];
            }

            await insert_hourly_report({ title, report_text, tags, regions, timestamp: now });
            console.log("Hourly report job completed successfully.");
        } catch (error) {
            console.error("Error in hourly report job:", error);
        }
    });
}