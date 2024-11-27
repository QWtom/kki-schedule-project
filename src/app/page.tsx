'use client'

import { useState } from 'react';
import {
    Container,
    Typography,
    Box,
    Paper,
    Button,
    Stack,
    alpha,
    Alert,
    CircularProgress,
    Tooltip
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { DaySelector } from '@/components/schedule/DaySelector';
import { GroupSelector } from '@/components/schedule/GroupSelector';
import { LessonCard } from '@/components/schedule/LessonCard';
import { useScheduleImport } from '@/lib/hooks/useSheduleImport';
import { getCurrentDayId, getGroupDaySchedule } from '@/lib/utils/getUtilsParser';
import { CourseSelector } from '@/components/schedule/CourseSelector';
import { CachedOutlined } from '@mui/icons-material';
import { WeekSelector } from '@/components/schedule/WeekSelector';
import { useScheduleCache } from '@/lib/hooks/useScheduleCache';

export default function Home() {
    const [selectedDay, setSelectedDay] = useState(getCurrentDayId());
    const [selectedGroup, setSelectedGroup] = useState('');
    const [selectedCourse, setSelectedCourse] = useState<string | null>(null);

    const {
        isLoading,
        error,
        parsedData,
        handleFileImport,
        checkDataFreshness,
        resetError,
    } = useScheduleImport();

    const {
        weeks,
        activeWeek,
        saveWeekSchedule,
        setActiveWeek
    } = useScheduleCache();

    const currentParsedData = activeWeek?.schedule || parsedData;

    const { isFresh, lastUpdate } = checkDataFreshness();

    const formatLastUpdate = (date: Date | null) => {
        if (!date || isNaN(date.getTime())) {
            console.log('Invalid date in formatLastUpdate:', date);
            return 'Нет данных';
        }

        try {
            return new Intl.DateTimeFormat('ru-RU', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }).format(date);
        } catch (error) {
            console.error('Error formatting date:', error);
            return 'Ошибка формата даты';
        }
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            try {
                const importedData = await handleFileImport(file);

                if (importedData) {
                    saveWeekSchedule(file.name, importedData);
                }
            } catch (error) {
                console.error('File import failed:', error);
            }
        }
    };

    const filteredGroups = currentParsedData?.groups.filter(g => {
        if (!selectedCourse) return true;
        const [courseStr, subgroupStr] = selectedCourse.replace(')', '').split('(');
        const course = parseInt(courseStr);
        const subgroup = parseInt(subgroupStr);
        return g.course === course && g.subgroup === subgroup;
    }) || [];

    const handleCourseChange = (courseKey: string) => {
        setSelectedCourse(courseKey);
        setSelectedGroup('');
    };

    const currentSchedule = selectedGroup && currentParsedData
        ? getGroupDaySchedule(currentParsedData, selectedGroup, selectedDay)
        : [];


    return (
        <Container maxWidth="lg">
            <Typography fontSize={36} fontWeight={700} mt={4}>Расписание</Typography>
            <Box sx={{ py: 4, minHeight: '100vh' }}>
                {/* ... Header section ... */}
                <Stack spacing={4}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 4,
                            background: alpha('#1E293B', 0.6),
                            backdropFilter: 'blur(20px)',
                        }}
                    >
                        <Stack spacing={3}>
                            {/* File Upload */}
                            {/* Индикатор кэшированных данных */}
                            {parsedData && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Tooltip title={`Последнее обновление: ${formatLastUpdate(lastUpdate)}`}>
                                        <CachedOutlined
                                            color={isFresh ? 'success' : 'warning'}
                                            sx={{ cursor: 'help' }}
                                        />
                                    </Tooltip>
                                    {!isFresh && lastUpdate && (
                                        <Typography variant="caption" color="warning.main">
                                            Рекомендуется обновить данные
                                        </Typography>
                                    )}
                                </Box>
                            )}
                            {weeks.length > 0 && (
                                <WeekSelector
                                    weeks={weeks}
                                    activeWeekId={activeWeek?.weekId || null}
                                    onWeekChange={setActiveWeek}
                                    disabled={isLoading}
                                />
                            )}
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
                                        sx={{ marginBottom: '2px' }}
                                    >
                                        {isLoading ? 'Загрузка...' : 'Загрузить расписание'}
                                    </Button>
                                </label>
                            </Box>

                            {error && (
                                <Alert
                                    severity="error"
                                    onClose={resetError}
                                    sx={{
                                        backgroundColor: alpha('#ef4444', 0.1),
                                        color: '#ef4444',
                                        '& .MuiAlert-icon': { color: '#ef4444' }
                                    }}
                                >
                                    {error}
                                </Alert>
                            )}

                            {/* Group Select */}
                            <Stack spacing={2}>
                                <CourseSelector
                                    groups={currentParsedData?.groups || []}
                                    selectedCourse={selectedCourse}
                                    onCourseChange={handleCourseChange}
                                    disabled={!currentParsedData || isLoading}
                                />

                                <GroupSelector
                                    groups={filteredGroups}
                                    selectedGroup={selectedGroup}
                                    onChange={setSelectedGroup}
                                    disabled={!selectedCourse || !parsedData || isLoading}
                                />
                            </Stack>
                        </Stack>
                    </Paper>

                    {/* Schedule Display */}
                    {selectedGroup && parsedData && (
                        <Paper
                            elevation={0}
                            sx={{
                                p: 4,
                                background: alpha('#1E293B', 0.6),
                                backdropFilter: 'blur(20px)',
                            }}
                        >
                            <Stack spacing={4}>
                                <DaySelector
                                    selectedDay={selectedDay}
                                    onDaySelect={setSelectedDay}
                                />

                                <Stack spacing={2}>
                                    {currentSchedule.length > 0 ? (
                                        currentSchedule.map((lesson, index) => (
                                            <LessonCard
                                                key={lesson.id}
                                                lesson={lesson}
                                                index={index}
                                            />
                                        ))
                                    ) : (
                                        <Box
                                            sx={{
                                                textAlign: 'center',
                                                py: 8,
                                                background: alpha('#1E293B', 0.3),
                                                borderRadius: 4,
                                                border: '2px dashed rgba(148, 163, 184, 0.1)',
                                            }}
                                        >
                                            <Typography color="text.secondary">
                                                Нет пар в этот день
                                            </Typography>
                                        </Box>
                                    )}
                                </Stack>
                            </Stack>
                        </Paper>
                    )}
                </Stack>
            </Box>
        </Container>
    );
}

