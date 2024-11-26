export const parseSubjectTeacher = (cellValue: string): { subject: string; teacher: string } => {
	if (!cellValue || typeof cellValue !== 'string') {
		return { subject: '', teacher: '' };
	}

	const parts = cellValue.split('/').map(part => part.trim());
	if (parts.length >= 2) {
		return {
			subject: parts[0],
			teacher: parts.slice(1).join('/').replace(/\s+/g, ' ')
		};
	}

	return { subject: cellValue.trim(), teacher: '' };
};