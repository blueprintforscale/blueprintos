import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Box from '@mui/material/Box';
import { useGetCalendarLabelsQuery } from './CalendarApi';

export type EventLabelSelectProps = {
	value: string;
	onChange: (value: string) => void;
	className?: string;
	ref?: React.RefObject<HTMLElement>;
};

/**
 * The event label select.
 */
function EventLabelSelect(props: EventLabelSelectProps) {
	const { value, onChange, className, ref } = props;
	const { data: labels } = useGetCalendarLabelsQuery();

	const handleChange = (event: SelectChangeEvent) => {
		onChange(event.target.value);
	};

	return (
		<FormControl
			fullWidth
			className={className}
		>
			<InputLabel id="select-label">Label</InputLabel>
			<Select
				labelId="select-label"
				id="label-select"
				value={value}
				label="Label"
				onChange={handleChange}
				ref={ref}
				classes={{ select: 'flex items-center space-x-3' }}
			>
				{labels?.map((label) => (
					<MenuItem
						value={label.id}
						key={label.id}
						className="space-x-3"
					>
						<Box
							className="w-3 h-3 shrink-0 rounded-full"
							sx={{ backgroundColor: label.color }}
						/>
						<span>{label.title}</span>
					</MenuItem>
				))}
			</Select>
		</FormControl>
	);
}

export default EventLabelSelect;
