// src/theme/index.ts
import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
	palette: {
		mode: 'dark',
		primary: {
			main: '#3B82F6', // Modern blue
			light: '#60A5FA',
			dark: '#2563EB',
		},
		background: {
			default: '#0F172A', // Dark blue background
			paper: '#1E293B',   // Slightly lighter for cards
		},
		text: {
			primary: '#F8FAFC',
			secondary: '#94A3B8',
		},
		divider: 'rgba(148, 163, 184, 0.12)',
	},
	typography: {
		fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
		h4: {
			fontWeight: 700,
			letterSpacing: '-0.02em',
		},
		h6: {
			fontWeight: 600,
			letterSpacing: '-0.01em',
		},
		button: {
			fontWeight: 500,
		},
	},
	components: {
		MuiPaper: {
			styleOverrides: {
				root: {
					backgroundImage: 'none',
					backgroundColor: '#1E293B',
					borderRadius: 16,
					border: '1px solid rgba(148, 163, 184, 0.1)',
				},
			},
		},
		MuiButton: {
			styleOverrides: {
				root: {
					textTransform: 'none',
					borderRadius: 12,
					padding: '10px 20px',
					fontSize: '0.95rem',
				},
				contained: {
					background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
					boxShadow: '0 4px 14px 0 rgba(59, 130, 246, 0.3)',
					'&:hover': {
						background: 'linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%)',
						boxShadow: '0 6px 20px 0 rgba(59, 130, 246, 0.4)',
					},
				},
			},
		},
		MuiSelect: {
			styleOverrides: {
				root: {
					borderRadius: 12,
				},
			},
		},
		MuiOutlinedInput: {
			styleOverrides: {
				root: {
					borderRadius: 12,
					'& .MuiOutlinedInput-notchedOutline': {
						borderColor: 'rgba(148, 163, 184, 0.2)',
					},
					'&:hover .MuiOutlinedInput-notchedOutline': {
						borderColor: 'rgba(148, 163, 184, 0.3)',
					},
					'&.Mui-focused .MuiOutlinedInput-notchedOutline': {
						borderColor: '#3B82F6',
					},
				},
			},
		},
	},
	shape: {
		borderRadius: 12,
	},
});