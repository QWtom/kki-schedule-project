export const parseTimeSlot = (timeString: string) => {
	const cleanTime = timeString
		.replace(/\s+/g, ' ')
		.trim()
		.replace(/\s*-\s*/g, '-');

	const timeMatch = cleanTime.match(/(\d{1,2}:\d{2})-(\d{1,2}:\d{2})/);

	if (!timeMatch) {
		console.warn('Invalid time format:', timeString);
		return null;
	}

	const [_, start, end] = timeMatch;

	const formatTime = (time: string) => {
		const [hours, minutes] = time.split(':');
		return `${hours.padStart(2, '0')}:${minutes}`;
	};

	return {
		start: formatTime(start),
		end: formatTime(end),
		formatted: `${formatTime(start)} - ${formatTime(end)}`
	};
};