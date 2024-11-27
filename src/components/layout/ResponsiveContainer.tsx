'use client';

import { Box, useTheme, useMediaQuery } from '@mui/material';
import { ReactNode } from 'react';

interface ResponsiveContainerProps {
	children: ReactNode;
	maxContentWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export function ResponsiveContainer({
	children,
	maxContentWidth = 'lg'
}: ResponsiveContainerProps) {
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
	const isTablet = useMediaQuery(theme.breakpoints.down('md'));

	return (
		<Box
			sx={{
				width: '100%',
				maxWidth: theme.breakpoints.values[maxContentWidth],
				mx: 'auto',
				px: {
					xs: 2,
					sm: 3,
					md: 4
				},
				py: {
					xs: 2,
					sm: 3,
					md: 4
				}
			}}
		>
			{children}
		</Box>
	);
}