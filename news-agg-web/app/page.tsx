import NewsCard from '@/components/news-card';

const news = [
	{
		source: 'Sepah Pasdaran',
		text: "Reports of missile strikes in Haifa\n\n🔹 The 'Al Mayadeen' network reported that some of the missiles fired by Iran have hit the port city of 'Haifa'.",
		title: 'Iranian Missiles Reportedly Hit Haifa',
		original_text:
			'گزارش‌ها از اصابت موشک به حیفا\n\n🔹 شبکه «المیادین» گزارش داد که برخی از موشک‌های شلیک‌شده توسط ایران، به شهر بندری «حیفا» اصابت کرده‌اند.\n\n✅ @sepah_pasdaran',
		original_language: 'Persian',
		tags: ['Iran–Israel conflict', 'Missile strike', 'Haifa', 'Iran', 'Al Mayadeen'],
		timestamp: 1750128360000,
	},
	{
		source: 'Sepah Pasdaran',
		text: '#Urgent | The intensity of the explosions in Haifa was such that residents of the city of Tyre in Lebanon also heard the sound.',
		title: 'Explosions in Haifa Heard in Tyre, Lebanon',
		original_text:
			'#فوری | شدت انفجارها در حیفا به حدی بوده که ساکنان شهر صور در لبنان هم صدای آن را شنیده‌اند\n\n✅ @sepah_pasdaran',
		original_language: 'Persian',
		tags: ['Iran–Israel conflict', 'Haifa', 'Explosions', 'Lebanon', 'Tyre'],
		timestamp: 1750126810800,
	},
	{
		source: 'Resistance News Network',
		text: '🚨 Gaza Summary - June 16th, 2025\n\nTwo IOF airstrikes targeted the northern Gaza Strip moments ago. In Mawasi Khan Younis, 5 martyrs ascended after the IOF bombed a tent, including a mother and her 3 children.\n\nEarlier today, the IOF bombed Beit Lahia and Jabalia with artillery and helicopters, coinciding with repeated detonations. 3 martyrs ascended in Beit Lahia, while 3 others were martyred while waiting for aid. A fisherman was martyred by IOF naval fire.\n\nIn the central Strip, a home was bombed in Maghazi and a tent was targeted in Deir Al-Balah, resulting in two martyrs.\n\nIn the southern Strip, particularly in eastern and western Khan Younis, the IOF carried out heavy artillery and airstrikes. 20 martyrs ascended west of Rafah while waiting for aid. The 98th Division of the IOF also withdrew from the area.\n\nThe communications blackout continues in the southern and central Gaza Strip. By the afternoon, 43 martyrs had ascended, including 26 who were killed while waiting for aid. By the evening, 58 martyrs ascended, including 38 while waiting for aid. #GazaSummary',
		title: 'Heavy IOF Strikes Across Gaza Kill 58',
		tags: ['Gaza–Israel conflict', 'Gaza', 'Airstrikes', 'IOF', 'Civilian casualties'],
		timestamp: 1750123620000,
	},
	{
		source: 'Bagrayman 26',
		text: '⚡️ No one was hospitalized after a Ministry of Defense vehicle overturned in Armenia\'s Lori region.\n\nThis was reported to Armenpress by the Ministry of Defense of the Republic of Armenia.\n\n"In response to media inquiries: as a result of the overturning of a vehicle belonging to the Ministry of Defense in the Lori region, no servicemen were hospitalized. One serviceman sustained a minor injury (concussion)," the statement said.',
		title: 'Armenian Defense Ministry Vehicle Overturns in Lori',
		original_text:
			'⚡️ Никто не госпитализирован после того, как автомобиль Минобороны Армении в Лорийской области перевернулся. \n\nОб этом Арменпресс сообщили в Министерстве обороны Республики Армения.\n\n«В ответ на запросы СМИ:в результате того, что в Лорийской области перевернулось транспортное средство, находящееся  на балансе Министерства обороны, госпитализированных военнослужащих нет. Один военнослужащий получил легкое ранение (контузию)», — говорится в сообщении.',
		original_language: 'Russian',
		tags: ['Armenian military', 'Lori region', 'Vehicle accident', 'Defense Ministry', 'Injury report'],
		timestamp: 1750112400000,
	},
	{
		source: 'Praxis Redacted Official',
		text: 'IRAN (RNN) — Iranian air defenses shot down a Zionist drone at Natanz, the site of a nuclear facility. Air defenses also activated in Qazvin, northwest of Tehran.',
		title: 'Iran Shoots Down Drone Over Natanz',
		tags: ['Iran–Israel conflict', 'Iran', 'Natanz', 'Drone', 'Air defense'],
		timestamp: 1750113600000,
	},
	{
		source: 'Praxis Redacted Official',

		text: 'Al-Mayadeen correspondent: Three armed Mossad spies were arrested south of Tehran. They were planning to carry out terrorist operations.',
		title: 'Three Mossad Spies Arrested Near Tehran',

		tags: ['Iran–Israel conflict', 'Tehran', 'Mossad', 'Espionage', 'Terror plot'],
		timestamp: 1750105200000,
	},
];

export default function Home() {
	return (
		<div className='grid grid-rows-[auto_1fr_20px] items-start  min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-mono)]'>
			<div className='max-w-120'>
				<h1 className='text-3xl font-semibold'>OSINT News Aggregator</h1>
				<p>
					A collection of news from various Telegraph channels, translated to English, tagged, then published in a feed.
				</p>
			</div>
			<div className='flex flex-col gap-8'>
				{news.map((n, i) => (
					<NewsCard
						key={i}
						source={n.source}
						title={n.title}
						text={n.text}
						original_text={n.original_text}
						original_language={n.original_language}
						tags={n.tags}
						timestamp={n.timestamp}
					/>
				))}
			</div>
			<div className='text-sm'>Load more</div>
		</div>
	);
}
