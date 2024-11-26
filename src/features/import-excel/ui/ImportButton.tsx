'use client'

import { useState } from 'react';
import { parseExcelFile } from '../model/import';

export const ImportButton = () => {
	const [isLoading, setIsLoading] = useState(false);

	const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;

		setIsLoading(true);
		try {
			const data = await parseExcelFile(file);
			// Обработка данных
		} catch (error) {
			console.error('Error importing file:', error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="relative">
			<input
				type="file"
				accept=".xlsx,.xls"
				onChange={handleFileChange}
				className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
			/>
			<button
				className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 
                   transition-colors duration-200 ease-in-out"
				disabled={isLoading}
			>
				{isLoading ? 'Импорт...' : 'Импортировать Excel'}
			</button>
		</div>
	);
};
