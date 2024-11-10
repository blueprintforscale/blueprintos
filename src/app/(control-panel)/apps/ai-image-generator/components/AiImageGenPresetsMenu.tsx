import { Menu, MenuItem, ListItemIcon, ListItemText, Button } from '@mui/material';
import { useState } from 'react';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import PresetsDialog from '../dialogs/preset/AiImageGenPresetsDialog';
import SavePresetDialog from '../dialogs/save-preset/AiImageGenSavePresetDialog';
import { AiImageGenPreset } from '../AiImageGenApi';

type AiImageGenPresetsMenuProps = {
	onLoadPreset: (preset: AiImageGenPreset) => void;
	onSavePreset: (name: string) => void;
};

function AiImageGenPresetsMenu(props: AiImageGenPresetsMenuProps) {
	const { onLoadPreset, onSavePreset } = props;
	const [presetMenuAnchor, setPresetMenuAnchor] = useState<null | HTMLElement>(null);
	const [savePresetDialog, setSavePresetDialog] = useState(false);
	const [loadPresetDialog, setLoadPresetDialog] = useState(false);

	const loadPreset = (preset: AiImageGenPreset) => {
		onLoadPreset(preset);
		setPresetMenuAnchor(null);
	};

	return (
		<>
			<Button
				className="border border-divider text-sm px-4 min-h-0 max-h-24 rounded gap-4"
				variant="outlined"
				size="small"
				onClick={(e) => setPresetMenuAnchor(e.currentTarget)}
				startIcon={<FuseSvgIcon size={16}>heroicons-solid:adjustments-horizontal</FuseSvgIcon>}
				classes={{
					icon: 'm-0'
				}}
			>
				Presets
			</Button>
			{/* Presets Menu */}
			<Menu
				anchorEl={presetMenuAnchor}
				open={Boolean(presetMenuAnchor)}
				onClose={() => setPresetMenuAnchor(null)}
				transformOrigin={{ horizontal: 'right', vertical: 'top' }}
				anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
			>
				<MenuItem
					onClick={() => {
						setSavePresetDialog(true);
						setPresetMenuAnchor(null);
					}}
				>
					<ListItemIcon>
						<FuseSvgIcon size={16}>heroicons-solid:bookmark</FuseSvgIcon>
					</ListItemIcon>
					<ListItemText primary="Save Current Settings" />
				</MenuItem>
				<MenuItem
					onClick={() => {
						setLoadPresetDialog(true);
						setPresetMenuAnchor(null);
					}}
				>
					<ListItemIcon>
						<FuseSvgIcon size={16}>heroicons-solid:folder-open</FuseSvgIcon>
					</ListItemIcon>
					<ListItemText primary="Load Preset" />
				</MenuItem>
			</Menu>

			<SavePresetDialog
				open={savePresetDialog}
				onClose={() => setSavePresetDialog(false)}
				onSave={onSavePreset}
			/>

			<PresetsDialog
				open={loadPresetDialog}
				onClose={() => setLoadPresetDialog(false)}
				onLoad={loadPreset}
			/>
		</>
	);
}

export default AiImageGenPresetsMenu;
