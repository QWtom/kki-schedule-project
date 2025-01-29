// components/FileUpload.tsx
'use client'

import { useState } from 'react';
import { Button, Box, Typography, CircularProgress } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

interface FileUploadProps {
	onFileUpload: (file: File) => Promise<void>;
}

export const FileUpload = ({ onFileUpload }: FileUploadProps) => {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;

		try {
			setIsLoading(true);
			setError(null);
			await onFileUpload(file);
		} catch (err) {
			console.error('Error uploading file:', err);
			setError(err instanceof Error ? err.message : 'Ошибка загрузки файла');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Box>
			<input
				accept=".xlsx,.xls"
				style={{ display: 'none' }}
				id="upload-file"
				type="file"
				onChange={handleFileChange}
				disabled={isLoading}
			/>
			<label htmlFor="upload-file">
				<Button
					variant="contained"
					component="span"
					startIcon={isLoading ? <CircularProgress size={20} /> : <CloudUploadIcon />}
					disabled={isLoading}
				>
					{isLoading ? 'Загрузка...' : 'Загрузить расписание'}
				</Button>
			</label>
			{error && (
				<Typography color="error" variant="body2" sx={{ mt: 1 }}>
					{error}
				</Typography>
			)}
		</Box>
	);
};