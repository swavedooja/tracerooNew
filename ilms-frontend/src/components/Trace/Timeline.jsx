import React from 'react';
import { Box, Paper, Typography, Stepper, Step, StepLabel, StepContent } from '@mui/material';
import { Circle } from '@mui/icons-material';

export default function Timeline({ events }) {
    if (!events || events.length === 0) {
        return (
            <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
                No events found for this item.
            </Paper>
        );
    }

    return (
        <Box sx={{ maxWidth: 600, mx: 'auto' }}>
            <Stepper orientation="vertical">
                {events.map((event, index) => (
                    <Step key={event.id} active={true}>
                        <StepLabel
                            StepIconComponent={() => <Circle sx={{ color: index === 0 ? 'primary.main' : 'grey.400' }} />}
                        >
                            <Typography variant="subtitle1" fontWeight="bold">
                                {event.eventType}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {new Date(event.timestamp).toLocaleString()}
                            </Typography>
                        </StepLabel>
                        <StepContent>
                            <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
                                <Typography variant="body2"><strong>Location:</strong> {event.location || 'N/A'}</Typography>
                                <Typography variant="body2"><strong>User:</strong> {event.user || 'System'}</Typography>
                                {event.notes && (
                                    <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                                        "{event.notes}"
                                    </Typography>
                                )}
                            </Paper>
                        </StepContent>
                    </Step>
                ))}
            </Stepper>
        </Box>
    );
}
