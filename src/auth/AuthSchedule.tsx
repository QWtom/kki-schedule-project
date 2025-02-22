import { Box, Container, Typography } from "@mui/material";
import { useState } from "react";

const AuthSchedule = () => {
	const [selectRole, setSelectRole] = useState<string>('STUDENT');

	return (
		<Container>
			<Typography>Вход в расписание</Typography>
			<Box sx={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
				
			</Box>
		</Container>
	)

}

export default AuthSchedule;