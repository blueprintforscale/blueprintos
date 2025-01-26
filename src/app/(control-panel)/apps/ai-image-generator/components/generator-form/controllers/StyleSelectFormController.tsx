import { useState } from 'react';
import { Typography, Paper, Menu, MenuItem, Box, alpha, useTheme } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

export type StyleOption = {
	value: string;
	label: string;
	description?: string;
	image: string;
	color?: string;
};

type StyleSelectFormControllerProps = {
	options: StyleOption[];
	title: string;
	value: string;
	onChange: (value: string) => void;
	ref?: React.Ref<HTMLDivElement>;
};

function StyleSelectFormController(props: StyleSelectFormControllerProps) {
	const { options, title, value, onChange, ref } = props;

	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

	const theme = useTheme();

	const open = Boolean(anchorEl);

	const selectedOption = options.find((option) => option.value === value);
	const selectedColor = selectedOption?.color || '#000';

	const selectedContrastTextColor = theme.palette.getContrastText(selectedColor);

	const handleClick = (event: React.MouseEvent<HTMLElement>) => {
		setAnchorEl(event.currentTarget);
	};

	const handleClose = () => {
		setAnchorEl(null);
	};

	const handleSelect = (_value: string) => {
		onChange(_value);
		handleClose();
	};

	return (
		<div
			className="flex flex-col gap-2"
			ref={ref}
		>
			<Typography
				className="text-sm font-semibold"
				color="text.secondary"
			>
				{title}
			</Typography>

			<Paper
				className="cursor-pointer rounded-md border shadow-none h-16 flex items-end relative overflow-hidden"
				onClick={handleClick}
				style={{
					backgroundImage: selectedOption ? `url(${selectedOption.image})` : 'none',
					backgroundSize: 'cover',
					backgroundPosition: 'center'
				}}
			>
				{/* Preview of selected option */}
				<Box
					className="flex flex-1 items-end h-full"
					sx={{
						background: `linear-gradient(180deg, rgba(0, 0, 0, 0) 40%, ${alpha(selectedColor, 0.4)} 60%, ${alpha(selectedColor, 0.5)}  70%, ${alpha(selectedColor, 0.95)} 100%)`,
						backgroundBlendMode: 'multiply'
					}}
				>
					<div className="flex flex-1">
						{selectedOption && (
							<Typography
								className="text-md font-medium px-2 pb-1"
								color={selectedContrastTextColor}
							>
								{selectedOption.label}
							</Typography>
						)}
					</div>

					<div
						className="flex items-center px-2 py-1"
						style={{ color: selectedContrastTextColor }}
					>
						<FuseSvgIcon size={16}>heroicons-solid:chevron-down</FuseSvgIcon>
					</div>
				</Box>
			</Paper>

			<Menu
				anchorEl={anchorEl}
				open={open}
				onClose={handleClose}
				slotProps={{
					paper: { sx: { width: '400px', maxHeight: '80vh' } }
				}}
				classes={{
					list: 'flex flex-col space-y-3 p-2'
				}}
			>
				{options.map((option) => {
					const color = option?.color || '#000';
					const contrastTextColor = theme.palette.getContrastText(color);

					return (
						<MenuItem
							key={option.value}
							onClick={() => handleSelect(option.value)}
							selected={value === option.value}
							className="flex flex-col items-end h-24 rounded-md overflow-hidden shadow-sm hover:shadow-md"
							sx={{
								padding: 0,
								backgroundImage: `url(${option.image})`,
								backgroundSize: 'cover',
								backgroundPosition: 'center'
							}}
						>
							<Box
								className="flex flex-col flex-1 justify-end h-full w-full px-1.5 py-1"
								sx={{
									background: `linear-gradient(180deg, rgba(0, 0, 0, 0) 40%, ${alpha(color, 0.4)} 60%, ${alpha(color, 0.5)}  70%, ${alpha(color, 0.95)} 100%)`,
									backgroundBlendMode: 'multiply'
								}}
							>
								<Typography
									className="text-md font-medium"
									color={contrastTextColor}
								>
									{option.label}
								</Typography>
								<Typography
									className="text-sm opacity-80 truncate"
									color={contrastTextColor}
								>
									{option.description}
								</Typography>
							</Box>
						</MenuItem>
					);
				})}
			</Menu>
		</div>
	);
}

export default StyleSelectFormController;
