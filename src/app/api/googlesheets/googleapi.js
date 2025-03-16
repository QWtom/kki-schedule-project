// src/app/api/googlesheets/googleapi.js
export const getGoogleSheet = async () => {
	try {
		// Добавляем timestamp к запросу, чтобы избежать кэширования
		const response = await fetch(`/api/googlesheets?t=${Date.now()}`);

		if (!response.ok) {
			const errorData = await response.json().catch(() => null);
			const errorMessage = errorData?.error || 'Failed to fetch Google Sheets data';
			const errorDetails = errorData?.details || '';

			console.error('API Error:', errorMessage, errorDetails);
			throw new Error(`${errorMessage}${errorDetails ? `: ${errorDetails}` : ''}`);
		}

		const data = await response.json();
		console.log('Получены данные с Google Sheets:', data);
		return data;
	} catch (error) {
		console.error('Ошибка при получении данных с Google Sheets:', error);
		throw error;
	}
};