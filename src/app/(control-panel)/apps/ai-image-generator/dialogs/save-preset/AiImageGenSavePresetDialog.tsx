import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';

type AiImageGenSavePresetDialogProps = {
	open: boolean;
	onClose: () => void;
	onSave: (name: string) => void;
};

function AiImageGenSavePresetDialog(props: AiImageGenSavePresetDialogProps) {
	const { open, onClose, onSave } = props;
	const [newPresetName, setNewPresetName] = useState('');

	const handleSave = () => {
		onSave(newPresetName);
		onClose();
	};

	useEffect(() => {
		setNewPresetName('');
	}, [open]);

	return (
		<Dialog
			open={open}
			onClose={onClose}
			maxWidth="sm"
			fullWidth
		>
			<DialogTitle className="text-lg">Save Current Settings as Preset</DialogTitle>
			<DialogContent>
				<TextField
					autoFocus
					margin="dense"
					label="Preset Name"
					fullWidth
					variant="outlined"
					value={newPresetName}
					onChange={(e) => setNewPresetName(e.target.value)}
					className="mt-16"
				/>
				<Typography
					variant="caption"
					color="textSecondary"
					className="mt-16 block"
				>
					This will save all current settings as a new preset
				</Typography>
			</DialogContent>
			<DialogActions>
				<Button onClick={onClose}>Cancel</Button>
				<Button
					onClick={handleSave}
					variant="contained"
				>
					Save
				</Button>
			</DialogActions>
		</Dialog>
	);
}

export default AiImageGenSavePresetDialog;
