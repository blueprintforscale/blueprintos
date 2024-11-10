import { Typography, IconButton, Chip, lighten, Button } from '@mui/material';
import { format } from 'date-fns';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { MouseEventHandler, MouseEvent } from 'react';
import { AiImageGenPreset, useDeleteAiImageGenPresetMutation } from '../../AiImageGenApi';

type AiImageGenPresetItemProps = {
	preset: AiImageGenPreset;
	onClick: MouseEventHandler<HTMLButtonElement>;
};

function AiImageGenPresetItem(props: AiImageGenPresetItemProps) {
	const { preset, onClick } = props;
	const [removePreset] = useDeleteAiImageGenPresetMutation();

	function handleRemovePreset(ev: MouseEvent<HTMLButtonElement>) {
		ev.stopPropagation();
		removePreset(preset.id);
	}

	return (
		<Button
			className="flex-col items-start border border-divider w-full overflow-hidden rounded-md hover:shadow-sm transition-shadow duration-200 space-y-8 min-h-0 h-auto max-h-none"
			variant="outlined"
			key={preset.id}
			sx={(theme) => ({
				backgroundColor: lighten(theme.palette.background.default, 0.02),
				...theme.applyStyles('light', {
					backgroundColor: lighten(theme.palette.background.default, 0.4)
				}),
				'&:hover': {
					backgroundColor: lighten(theme.palette.background.default, 0.2)
				}
			})}
			onClick={onClick}
		>
			<div className="flex items-center justify-between w-full">
				<Typography className="text-md font-medium">{preset.name}</Typography>
				<div className="flex items-center gap-8">
					<Typography
						color="textSecondary"
						className="text-xs"
					>
						Created {format(new Date(preset.createdAt), 'MMM d, yyyy')}
					</Typography>
					<IconButton
						size="small"
						onClick={handleRemovePreset}
					>
						<FuseSvgIcon size={16}>heroicons-solid:trash</FuseSvgIcon>
					</IconButton>
				</div>
			</div>
			<div className="flex gap-8 mb-12">
				<Chip
					className="text-sm rounded-sm"
					label={preset.settings.style}
					size="small"
					variant="outlined"
				/>
				<Chip
					className="text-sm rounded-sm"
					label={preset.settings.mood}
					size="small"
					variant="outlined"
				/>
				<Chip
					className="text-sm rounded-sm"
					label={preset.settings.size}
					size="small"
					variant="outlined"
				/>
				<Chip
					className="text-sm rounded-sm"
					label={preset.settings.quality}
					size="small"
					variant="outlined"
				/>
			</div>
			<Typography
				className="text-sm"
				noWrap
			>
				{preset.settings.prompt}
			</Typography>

			<Typography
				className="text-xs italic"
				color="text.secondary"
				noWrap
			>
				{preset.settings.negativePrompt} (Negative Prompt)
			</Typography>
		</Button>
	);
}

export default AiImageGenPresetItem;
