'use client'

import { useMemo, useState, useEffect, useRef, useCallback } from 'react';
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
    Chip,
    Link
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SyncIcon from '@mui/icons-material/Sync';
import InfoIcon from '@mui/icons-material/Info';
import UpdateIcon from '@mui/icons-material/Update';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { DaySelector } from '@/components/schedule/DaySelector';
import { GroupSelector } from '@/components/schedule/GroupSelector';
import { LessonCard } from '@/components/schedule/LessonCard';
import { useScheduleImport } from '@/lib/hooks/useSheduleImport';
import { getCurrentDayId, getGroupDaySchedule } from '@/lib/utils/getUtilsParser';
import { CourseSelector } from '@/components/schedule/CourseSelector';
import { FavoriteGroups } from '@/components/schedule/FavoriteGroups';
import TelegramIcon from '@mui/icons-material/Telegram';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { WeekSelector } from '@/components/schedule/WeekSelector';
import { useScheduleCache } from '@/lib/hooks/useScheduleCache';
import { useNotification } from '@/lib/context/NotificationContext';
import { useFavorites } from '@/lib/hooks/useFavorites';
import { useAppMode } from '@/lib/hooks/useAppMode';
import { useGoogleSheets } from '@/lib/hooks/useGoogleSheets';

export default function Home() {
    const { showNotification } = useNotification();
    const { favoriteGroups, defaultCourse } = useFavorites();
    const [selectedDay, setSelectedDay] = useState(getCurrentDayId());
    const [selectedGroup, setSelectedGroup] = useState('');
    const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
    const { isOnlineMode, isOfflineMode } = useAppMode();
    const [initialLoadDone, setInitialLoadDone] = useState(false);
    const [manualSyncInProgress, setManualSyncInProgress] = useState(false);

    const {
        isLoading: isApiLoading,
        fetchGoogleSheetData,
        error: apiError,
        parsedData: apiParsedData,
        loadedDataInfo,
        isCacheStale
    } = useGoogleSheets();

    const {
        isLoading: isImportLoading,
        error: importError,
        parsedData: importParsedData,
        handleFileImport,
        checkDataFreshness,
        resetError: resetImportError,
    } = useScheduleImport();

    const {
        weeks,
        activeWeek,
        saveWeekSchedule,
        setActiveWeek
    } = useScheduleCache();

    const courseInitialized = useRef(false);
    const groupInitialized = useRef(false);

    const parsedData = apiParsedData || importParsedData;
    const currentParsedData = activeWeek?.schedule || parsedData;
    const isLoading = isImportLoading || isApiLoading || manualSyncInProgress;
    const error = importError || apiError;

    const handleSyncData = useCallback(async () => {
        if (!isOnlineMode) {
            showNotification('Синхронизация недоступна в оффлайн режиме', 'info');
            return;
        }
        if (isLoading) {
            showNotification('Синхронизация уже выполняется', 'info');
            return;
        }

        try {
            setManualSyncInProgress(true);
            const data = await fetchGoogleSheetData(false);

            if (data) {
                courseInitialized.current = false;
                groupInitialized.current = false;
            }
        } catch (error) {
            console.error('Ошибка синхронизации:', error);
            showNotification('Ошибка при синхронизации данных', 'error');
        } finally {
            setManualSyncInProgress(false);
        }
    }, [isOnlineMode, isLoading, fetchGoogleSheetData, showNotification]);

    const handleFileChange = useMemo(
        () => async (event: React.ChangeEvent<HTMLInputElement>) => {
            if (isOnlineMode) return;

            const file = event.target.files?.[0];
            if (file) {
                try {
                    const importedData = await handleFileImport(file);
                    if (importedData) {
                        saveWeekSchedule(file.name, importedData);
                        showNotification(`Неделя "${file.name}" сохранена`, 'success');

                        courseInitialized.current = false;
                        groupInitialized.current = false;
                    }
                } catch (error) {
                    console.error('File import failed:', error);
                    showNotification('Ошибка при импорте файла', 'error');
                }
            }
        },
        [handleFileImport, saveWeekSchedule, showNotification, isOnlineMode]
    );


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

    useEffect(() => {
        if (!initialLoadDone && isOnlineMode && !isLoading && !parsedData) {
            console.log('Выполняем первичную загрузку данных');
            setInitialLoadDone(true);

            const timer = setTimeout(() => {
                fetchGoogleSheetData(true).catch(err => {
                    console.error('Ошибка при начальной загрузке:', err);
                });
            }, 1000);

            return () => clearTimeout(timer);
        }

        if (!initialLoadDone && parsedData) {
            setInitialLoadDone(true);
        }
    }, [initialLoadDone, isOnlineMode, isLoading, parsedData, fetchGoogleSheetData]);

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
            {/* Заголовок */}
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
                    Расписание учебных занятий ГБПОУ РС(Я) "Колледж креативных индустрий - "АЙАР УУСТАР"
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
            <Box sx={{
                p: 3,
                my: 2,
                borderRadius: 2,
                background: alpha('#3B82F6', 0.1),
                border: `1px solid ${alpha('#3B82F6', 0.2)}`,
            }}>
                <Typography variant="h6">
                    Контакты
                </Typography>

                <Box sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 2,
                    mt: 1
                }}>
                    <Link
                        href="https://t.me/iteatom"
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 0.5,
                            color: 'primary.main',
                            textDecoration: 'none',
                            '&:hover': {
                                textDecoration: 'underline'
                            }
                        }}
                    >
                        <TelegramIcon fontSize="small" />
                        Telegram
                    </Link>

                    <Link
                        href="https://wa.me/79627396052"
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 0.5,
                            color: 'primary.main',
                            textDecoration: 'none',
                            '&:hover': {
                                textDecoration: 'underline'
                            }
                        }}
                    >
                        <WhatsAppIcon fontSize="small" />
                        WhatsApp
                    </Link>
                </Box>
            </Box>
            <Box sx={{ py: 4, minHeight: '100vh' }}>
                <Stack spacing={4}>
                    {currentParsedData && (
                        <Paper
                            elevation={0}
                            sx={{
                                p: 2,
                                mb: 2,
                                background: alpha('#1E293B', 0.6),
                                backdropFilter: 'blur(20px)',
                                borderRadius: 2,
                                border: '1px solid rgba(59, 130, 246, 0.2)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                flexWrap: 'wrap',
                                gap: 2
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <InfoIcon color="primary" />
                                <Box>
                                    <Typography variant="body1">
                                        {loadedDataInfo ?
                                            `Загружено расписание: ${loadedDataInfo}` :
                                            'Расписание успешно загружено'}
                                    </Typography>
                                </Box>
                            </Box>

                            {/* Индикатор состояния данных */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {isLoading ? (
                                    <Chip
                                        icon={<CircularProgress size={16} />}
                                        label="Синхронизация..."
                                        color="info"
                                        size="small"
                                    />
                                ) : isCacheStale ? (
                                    <Tooltip title="Обновить данные">
                                        <Chip
                                            icon={<UpdateIcon fontSize="small" />}
                                            label="Обновить"
                                            color="primary"
                                            size="small"
                                            clickable
                                            onClick={handleSyncData}
                                        />
                                    </Tooltip>
                                ) : (
                                    <Chip
                                        icon={<CheckCircleIcon fontSize="small" />}
                                        label="Актуально"
                                        color="success"
                                        size="small"
                                        variant="outlined"
                                    />
                                )}
                            </Box>
                        </Paper>
                    )}

                    {/* Основной интерфейс */}
                    <Paper
                        elevation={0}
                        sx={{
                            p: 4,
                            background: alpha('#1E293B', 0.6),
                            backdropFilter: 'blur(20px)',
                        }}
                    >
                        <Stack spacing={3}>
                            {/* Выбор недели (только для оффлайн режима) */}
                            {isOfflineMode && weeks.length > 0 && (
                                <WeekSelector
                                    weeks={weeks}
                                    activeWeekId={activeWeek?.weekId || null}
                                    onWeekChange={setActiveWeek}
                                    disabled={isLoading}
                                />
                            )}

                            {/* Кнопки загрузки и синхронизации */}
                            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                {isOfflineMode && (
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
                                )}

                                {isOnlineMode && (
                                    <Button
                                        variant="contained"
                                        startIcon={isLoading ? <CircularProgress size={20} /> : <SyncIcon />}
                                        onClick={handleSyncData}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? 'Синхронизация...' : 'Синхронизировать'}
                                    </Button>
                                )}
                            </Box>

                            {/* Отображение ошибок */}
                            {error && (
                                <Alert
                                    severity="error"
                                    onClose={resetImportError}
                                    sx={{
                                        backgroundColor: alpha('#ef4444', 0.1),
                                        color: '#ef4444',
                                        '& .MuiAlert-icon': { color: '#ef4444' }
                                    }}
                                >
                                    {error}
                                </Alert>
                            )}

                            {/* Избранные группы */}
                            {currentParsedData && (
                                <FavoriteGroups
                                    groups={currentParsedData.groups}
                                    onSelectGroup={setSelectedGroup}
                                    selectedGroup={selectedGroup}
                                />
                            )}

                            {/* Выбор курса и группы */}
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
                                    disabled={!selectedCourse || !currentParsedData || isLoading}
                                />
                            </Stack>
                        </Stack>
                    </Paper>

                    {/* Отображение расписания */}
                    {selectedGroup && currentParsedData && (
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