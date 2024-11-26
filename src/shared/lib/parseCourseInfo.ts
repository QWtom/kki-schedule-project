export const parseCourseInfo = (sheetName: string): { courseNumber: number; subgroup: number } | null => {
	const patternWithParentheses = /(\d+)\s*курс\s*\((\d+)\)/i;
	const matchWithParentheses = sheetName.match(patternWithParentheses);

	if (matchWithParentheses) {
		return {
			courseNumber: parseInt(matchWithParentheses[1]),
			subgroup: parseInt(matchWithParentheses[2])
		};
	}

	const patternSimple = /(\d+)\s*курс/i;
	const matchSimple = sheetName.match(patternSimple);

	if (matchSimple) {
		const subgroupPattern = /\((\d+)\)$/;
		const subgroupMatch = sheetName.match(subgroupPattern);

		return {
			courseNumber: parseInt(matchSimple[1]),
			subgroup: subgroupMatch ? parseInt(subgroupMatch[1]) : 1
		};
	}

	const numberPattern = /^(\d+)/;
	const numberMatch = sheetName.match(numberPattern);

	if (numberMatch) {
		return {
			courseNumber: parseInt(numberMatch[1]),
			subgroup: 1
		};
	}

	return null;
};