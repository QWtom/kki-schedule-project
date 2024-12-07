export const parseTimeSlot = (timeString: string) => {
	console.log('Initial time string:', timeString);

	// Шаг 1: Нормализация строки
	// Сначала заменяем множественные пробелы одним пробелом и убираем пробелы вокруг дефиса
	let cleanTimeString = timeString
		.replace(/\s+/g, ' ')               // Множественные пробелы -> один пробел
		.replace(/\s*-\s*/g, '-')           // Убираем пробелы вокруг дефиса
		.replace(/-+$/, '')                 // Убираем дефисы в конце
		.trim();

	console.log('After normalization:', cleanTimeString);

	// Шаг 2: Разделение на компоненты времени
	const timeParts = cleanTimeString.split('-');
	if (timeParts.length !== 2) {
		console.log('Invalid time format - expected two parts:', timeParts);
		return null;
	}

	const [startTime, endTime] = timeParts;

	const parseTimeComponent = (timeStr: string) => {
		const cleaned = timeStr.trim().replace(/[^\d:]/g, '');
		console.log('Parsing time component:', cleaned);

		let hours: number;
		let minutes: number;

		if (cleaned.includes(':')) {
			[hours, minutes] = cleaned.split(':').map(Number);
		} else if (cleaned.length === 4) {
			hours = parseInt(cleaned.substring(0, 2));
			minutes = parseInt(cleaned.substring(2));
		} else if (cleaned.length === 3) {
			hours = parseInt(cleaned.substring(0, 1));
			minutes = parseInt(cleaned.substring(1));
		} else {
			console.log('Unrecognized time format:', cleaned);
			return null;
		}

		if (isNaN(hours) || isNaN(minutes) ||
			hours < 0 || hours > 23 ||
			minutes < 0 || minutes > 59) {
			console.log('Invalid time values:', { hours, minutes });
			return null;
		}

		return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
	};

	const parsedStart = parseTimeComponent(startTime);
	const parsedEnd = parseTimeComponent(endTime);

	if (!parsedStart || !parsedEnd) {
		console.log('Failed to parse time components');
		return null;
	}

	const result = {
		start: parsedStart,
		end: parsedEnd,
		formatted: `${parsedStart}-${parsedEnd}`
	};

	console.log('Successfully parsed time:', result);
	return result;
};