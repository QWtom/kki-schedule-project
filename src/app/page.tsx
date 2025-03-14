'use client'

import { useMemo, useState, useEffect, useRef } from 'react';
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
    Tooltip,
    debounce
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { DaySelector } from '@/components/schedule/DaySelector';
import { GroupSelector } from '@/components/schedule/GroupSelector';
import { LessonCard } from '@/components/schedule/LessonCard';
import { useScheduleImport } from '@/lib/hooks/useSheduleImport';
import { getCurrentDayId, getGroupDaySchedule } from '@/lib/utils/getUtilsParser';
import { CourseSelector } from '@/components/schedule/CourseSelector';
import { FavoriteGroups } from '@/components/schedule/FavoriteGroups';
import { CachedOutlined } from '@mui/icons-material';
import { WeekSelector } from '@/components/schedule/WeekSelector';
import { useScheduleCache } from '@/lib/hooks/useScheduleCache';
import { useNotification } from '@/lib/context/NotificationContext';
import { useFavorites } from '@/lib/hooks/useFavorites';
import dynamic from 'next/dynamic';


export default function Home() {
    const { showNotification } = useNotification();
    const { favoriteGroups, defaultCourse } = useFavorites();
    const [selectedDay, setSelectedDay] = useState(getCurrentDayId());
    const [selectedGroup, setSelectedGroup] = useState('');
    const [selectedCourse, setSelectedCourse] = useState<string | null>(null);

    const courseInitialized = useRef(false);
    const groupInitialized = useRef(false);


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

    useEffect(() => {
        if (
            currentParsedData &&
            !courseInitialized.current &&
            !selectedCourse &&
            defaultCourse
        ) {
            setSelectedCourse(defaultCourse);
            courseInitialized.current = true;
        }
    }, [currentParsedData, defaultCourse, selectedCourse]);

    useEffect(() => {
        if (
            currentParsedData &&
            favoriteGroups.length > 0 &&
            !selectedGroup &&
            !groupInitialized.current &&
            currentParsedData.groups.some(g => favoriteGroups.includes(g.id))
        ) {
            const availableFavorite = currentParsedData.groups.find(g => favoriteGroups.includes(g.id));
            if (availableFavorite) {
                setSelectedGroup(availableFavorite.id);
                groupInitialized.current = true;
            }
        }
    }, [currentParsedData, favoriteGroups, selectedGroup]);
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

    const handleFileChange = useMemo(
        () => debounce(async (event: React.ChangeEvent<HTMLInputElement>) => {
            const file = event.target.files?.[0];
            if (file) {
                try {
                    const importedData = await handleFileImport(file);
                    if (importedData) {
                        saveWeekSchedule(file.name, importedData);
                        showNotification(`Неделя "${file.name}" сохранена`, 'success');
                    }
                } catch (error) {
                    console.error('File import failed:', error);
                    showNotification('Ошибка при импорте файла', 'error');
                }
            }
        }, 300),
        [handleFileImport, saveWeekSchedule, showNotification]
    );

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
            <Box sx={{ position: 'relative', mb: { xs: 4 } }}>
                <Typography
                    variant="h4"
                    fontWeight={700}
                    sx={{
                        fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.25rem', lg: '2.5rem' },
                        textAlign: { xs: 'center', sm: 'left' },
                        background: 'linear-gradient(135deg,rgb(228, 229, 230) 0%,rgb(255, 255, 255) 50%,rgb(255, 255, 255) 100%)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        textShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
                        position: 'relative',
                        zIndex: 2,
                        letterSpacing: '-0.02em',
                        maxWidth: { xs: '100%', md: '85%', lg: '80%' },
                        my: 2,
                        py: { xs: 2, sm: 3 },
                        px: { xs: 2, sm: 3, md: 0 }
                    }}
                >
                    Расписание учебных занятий ГПБОУ РС(Я) "Колледж креативных индустрий - "Айар уустар"
                </Typography>
                <Box
                    sx={{
                        position: 'absolute',
                        left: { xs: 0, md: -20 },
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: { xs: '4px', md: '6px' },
                        height: { xs: '60%', sm: '70%' },
                        background: 'linear-gradient(to bottom, #3B82F6, #2563EB)',
                        borderRadius: '4px',
                        display: { xs: 'none', sm: 'block' }
                    }}
                />
                <Box
                    sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        width: { xs: '100%', sm: '90%', md: '80%' },
                        height: '1px',
                        background: 'linear-gradient(to right, #3B82F6, rgba(59, 130, 246, 0.1))',
                        borderRadius: '4px',
                        zIndex: 1
                    }}
                />
            </Box>
            <Box sx={{ py: 4, minHeight: '100vh' }}>
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

                            {currentParsedData && (
                                <FavoriteGroups
                                    groups={currentParsedData.groups}
                                    onSelectGroup={setSelectedGroup}
                                    selectedGroup={selectedGroup}
                                />
                            )}

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