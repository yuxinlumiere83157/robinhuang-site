export const profile = {
	fullName: 'Robin Huang',
	title: '',
	institute: 'Auckland, New Zealand',
	author_name: 'Robin Huang',
	research_areas: [
		{
			title: 'Backend & APIs',
			description: 'Maintainable code, RESTful API design, server-side validation, and structured workflows.',
			field: 'backend',
		},
		{
			title: 'Databases & Data Handling',
			description: 'SQL fundamentals, data modeling basics, and practical CRUD patterns for real applications.',
			field: 'data',
		},
		{
			title: 'Cloud Fundamentals (AWS)',
			description: 'Compute/storage/networking concepts and deploying secure, production-ready web systems.',
			field: 'cloud',
		},
		{
			title: 'Interactive Systems',
			description: 'Unity/C# interactive applications integrating external inputs (Arduino sensors, gesture detection).',
			field: 'interactive',
		},
		{
			title: 'HCI & Applied Research Prototypes',
			description: 'Team-based prototypes, multimodal survey systems, and practical experimentation.',
			field: 'hci',
		},
	],
}

// Set equal to an empty string to hide the icon that you don't want to display
export const social = {
	email: 'contact@robinhuang.nz',
	linkedin: 'https://www.linkedin.com/in/yuxin-h-4917232a3/',
	x: '', // hide by default
	bluesky: '',
	github: 'https://github.com/yuxinlumiere83157',
	gitlab: '',
	scholar: '',
	inspire: '',
	arxiv: '',
	orcid: '',
}

export const template = {
	website_url: 'https://www.robinhuang.nz', // must start with http:// or https:// for sitemap/canonical
	menu_left: false,
	transitions: true,
	lightTheme: 'light',
	darkTheme: 'dark',
	excerptLength: 200,
	postPerPage: 5,
	base: '', // keep empty for root domain deployments
}

export const seo = {
	default_title: 'Robin Huang | Portfolio & CV',
	default_description:
		'Portfolio, CV, and projects by Robin Huang. Backend-focused software development, cloud fundamentals (AWS), and interactive systems.',
	default_image: '/images/og.png', // create this file later, or keep the template image path if you prefer
}
