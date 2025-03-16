export const getGoogleSheet = async () => {
	try {
		const timestamp = Date.now();
		const randomParam = Math.random().toString(36).substring(7);
		const url = `/api/googlesheets?t=${timestamp}&r=${randomParam}`;

		console.log(`Fetching from: ${url}`);

		const response = await fetch(url);

		console.log(`Response status: ${response.status}`);

		if (!response.ok) {
			const errorText = await response.text();
			console.error('API Error Response:', errorText);
			throw new Error(`API error: ${response.status} - ${errorText}`);
		}

		const data = await response.json();
		console.log('Response data structure:', Object.keys(data));
		console.log('Metadata:', data.metadata);
		console.log('Sheets count:', data.data ? Object.keys(data.data).length : 0);

		return data;
	} catch (error) {
		console.error('Error details:', error);
		throw error;
	}
};