// src/app/api/googlesheets/googleapi.js
export const getGoogleSheet = async () => {
	try {
		const API_SERVER_URL = process.env.NEXT_PUBLIC_API_SERVER_URL;
		const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

		const timestamp = Date.now();
		const randomParam = Math.random().toString(36).substring(7);

		const url = `${API_SERVER_URL}/api/googlesheets?t=${timestamp}&r=${randomParam}`;

		console.log(`Fetching from API server: ${url}`);

		const response = await fetch(url, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'X-API-Key': API_KEY
			}
		});

		if (!response.ok) {
			const errorText = await response.text();
			console.error('API Error Response:', errorText);
			throw new Error(`API error: ${response.status} - ${errorText}`);
		}

		const data = await response.json();
		console.log('API Response received, sheet names:', data.data ? Object.keys(data.data) : []);

		return data;
	} catch (error) {
		console.error('Error fetching Google Sheets data:', error);
		throw error;
	}
};