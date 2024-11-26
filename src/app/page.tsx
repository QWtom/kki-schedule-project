// app/page.tsx
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
  CircularProgress
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { DaySelector } from '@/components/schedule/DaySelector';
import { GroupSelector } from '@/components/schedule/GroupSelector';
import { LessonCard } from '@/components/schedule/LessonCard';
import { useScheduleImport } from '@/lib/hooks/useSheduleImport';
import { getCurrentDayId, getGroupDaySchedule } from '@/lib/utils/excelParser';
import { CourseSelector } from '@/components/schedule/CourseSelector/CourseSelector';

export default function Home() {
  const [selectedDay, setSelectedDay] = useState(getCurrentDayId());
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);

  const {
    isLoading,
    error,
    parsedData,
    handleFileImport,
    resetError
  } = useScheduleImport();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        await handleFileImport(file);
        console.log('File import successful');
      } catch (error) {
        console.error('File import failed:', error);
      }
    }
  };

  const filteredGroups = parsedData?.groups.filter(
    g => selectedCourse ? g.course === selectedCourse : true
  ) || [];

  const handleCourseChange = (course: number) => {
    setSelectedCourse(course);
    setSelectedGroup('');
  };

  const currentSchedule = selectedGroup && parsedData
    ? getGroupDaySchedule(parsedData, selectedGroup, selectedDay)
    : [];

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 6, minHeight: '100vh' }}>
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
                  groups={parsedData?.groups || []}
                  selectedCourse={selectedCourse}
                  onCourseChange={handleCourseChange}
                  disabled={!parsedData || isLoading}
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
                        Нет занятий в этот день
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

