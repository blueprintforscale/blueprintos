import { useTheme } from '@mui/material/styles';
import _ from 'lodash';
import Box from '@mui/material/Box';
import clsx from 'clsx';
import Typography from '@mui/material/Typography';
import { EventContentArg } from '@fullcalendar/core';
import { Event, useGetCalendarLabelsQuery } from './CalendarApi';

type CalendarAppEventContentProps = {
	eventInfo: EventContentArg & { event: Event };
};

/**
 * The event content for the calendar app.
 */
function CalendarAppEventContent(props: CalendarAppEventContentProps) {
	const { eventInfo } = props;
	const theme = useTheme();
	const { data: labels } = useGetCalendarLabelsQuery();

	const labelId = eventInfo.event.extendedProps.label as string;
	const label = _.find(labels, { id: labelId });

	return (
		<Box
			sx={{
				backgroundColor: label?.color,
				color: label && theme.palette.getContrastText(label?.color)
			}}
			className={clsx('flex items-center w-full rounded-sm px-2 py-0.5 h-5.5 text-white')}
		>
			<Typography className="text-md font-semibold">{eventInfo.timeText}</Typography>
			<Typography className="text-md px-1 truncate">{eventInfo.event.title}</Typography>
		</Box>
	);
}

export default CalendarAppEventContent;
