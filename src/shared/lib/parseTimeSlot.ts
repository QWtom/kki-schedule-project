export const parseTimeSlot = (timeCell: string) => {
	if (!timeCell) return null;

	const normalized = timeCell
		.replace(/\s+/g, ' ')
		.trim()
		.replace(/[-–—]/g, '-')
		.replace(/\s*-\s*/g, '-');

	const match = normalized.match(/^(\d{1,2})(?::|\s*)?(\d{0,2})-(\d{1,2})(?::|\s*)?(\d{0,2})$/);

	if (!match) {
		console.warn(`Invalid time format: ${timeCell} (normalized: ${normalized})`);
		return null;
	}

	const [_, startHour, startMinute = '00', endHour, endMinute = '00'] = match;

	if (parseInt(startHour) > 23 || parseInt(endHour) > 23 ||
		parseInt(startMinute) > 59 || parseInt(endMinute) > 59) {
		console.warn(`Invalid time values: ${timeCell}`);
		return null;
	}

	const start = `${startHour.padStart(2, '0')}:${startMinute.padEnd(2, '0')}`;
	const end = `${endHour.padStart(2, '0')}:${endMinute.padEnd(2, '0')}`;

	return {
		start,
		end,
		formatted: `${start}-${end}`
	};
};