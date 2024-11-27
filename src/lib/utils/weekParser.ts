export const parseWeekInfo = (fileName: string) => {
	const cleanName = fileName.replace('.xlsx', '').replace('.xls', '');

	const weekName = cleanName
		.split('_')
		.filter(part => part.toLowerCase() !== 'расписание')
		.join(' ');

	return {
		weekId: generateWeekId(cleanName),
		weekName: weekName || 'Неделя без названия'
	};
};

const generateWeekId = (fileName: string): string => {
	return `week-${fileName.toLowerCase().replace(/[^a-zа-я0-9]/g, '-')}`;
};