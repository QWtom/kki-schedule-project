export const getGoogleSheet = async () => {
	try {
		const response = await fetch('/api/googlesheets');

		if (!response.ok) {
			throw new Error('Failed to fetch Google Sheets data');
		}

		const data = await response.json();
		console.log('Получены данные с Google Sheets:', data);
		return data;
	} catch (error) {
		console.error('Ошибка при получении данных с Google Sheets:', error);
		throw error;
	}
};