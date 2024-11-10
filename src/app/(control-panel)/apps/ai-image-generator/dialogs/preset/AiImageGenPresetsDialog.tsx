import { Dialog, DialogTitle, DialogContent } from '@mui/material';
import Typography from '@mui/material/Typography';
import PresetItem from './AiImageGenPresetItem';
import {
	useGetAiImageGenPresetsQuery,
	AiImageGenPreset
} from '@/app/(control-panel)/apps/ai-image-generator/AiImageGenApi';

type AiImageGenPresetsDialogProps = {
	open: boolean;
	onClose: () => void;
	onLoad: (preset: AiImageGenPreset) => void;
};

function AiImageGenPresetsDialog(props: AiImageGenPresetsDialogProps) {
	const { open, onClose, onLoad } = props;
	const { data: presets } = useGetAiImageGenPresetsQuery(undefined, { skip: !open });

	function handleItemClick(preset: AiImageGenPreset) {
		onLoad(preset);
		onClose();
	}

	return (
		<Dialog
			open={open}
			onClose={onClose}
			maxWidth="sm"
			fullWidth
		>
			<DialogTitle className="text-lg">Saved Presets</DialogTitle>
			<DialogContent>
				{presets?.length > 0 && (
					<div className="space-y-16">
						{presets?.map((preset) => (
							<PresetItem
								preset={preset}
								key={preset.id}
								onClick={() => handleItemClick(preset)}
							/>
						))}
					</div>
				)}

				{presets?.length === 0 && (
					<Typography
						color="textSecondary"
						className="text-center p-24"
					>
						No presets saved yet
					</Typography>
				)}
			</DialogContent>
		</Dialog>
	);
}

export default AiImageGenPresetsDialog;
