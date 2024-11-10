import { FormControl, InputLabel, Select, MenuItem, Typography } from '@mui/material';
import { forwardRef, ForwardedRef } from 'react';

const sizeOptions = [
	{ value: '1024x1024', label: '1024 x 1024' },
	{ value: '1792x1024', label: '1792 x 1024' },
	{ value: '1024x1792', label: '1024 x 1792' }
];
type SizeFormControllerProps = {
	value: string;
	onChange: (value: string) => void;
};

const SizeFormController = forwardRef((props: SizeFormControllerProps, ref: ForwardedRef<HTMLDivElement>) => {
	const { value, onChange } = props;

	return (
		<FormControl fullWidth>
			<InputLabel>Size</InputLabel>
			<Select
				ref={ref}
				value={value}
				onChange={(e) => onChange(e.target.value)}
				label="Size"
			>
				{sizeOptions.map((size) => (
					<MenuItem
						key={size.value}
						value={size.value}
					>
						<div className="flex items-center space-between w-full">
							<Typography className="flex-1">{size.label}</Typography>
							<div
								className="h-20 mr-12 rounded border border-gray-300"
								style={{
									aspectRatio: size.label.replace('x', '/'),
									backgroundColor: 'rgba(0,0,0,0.1)'
								}}
							/>
						</div>
					</MenuItem>
				))}
			</Select>
		</FormControl>
	);
});

export default SizeFormController;
