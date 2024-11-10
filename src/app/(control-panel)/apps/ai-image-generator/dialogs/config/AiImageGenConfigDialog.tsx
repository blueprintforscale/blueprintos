import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Alert, TextField } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useEffect, useState, useCallback } from 'react';
import useAiImageGenAppContext from '../../contexts/useAiImageGenAppContext';

function AiImageGenConfigDialog() {
	const { setConfigDialogOpen, configDialogOpen, apiKey, setApiKey } = useAiImageGenAppContext();
	const [apiKeyInputValue, setApiKeyInputValue] = useState(apiKey);

	useEffect(() => {
		setApiKeyInputValue(apiKey);
	}, [apiKey]);

	const handleClose = () => {
		setConfigDialogOpen(false);
	};

	const handleSave = useCallback(() => {
		setApiKey(apiKeyInputValue);
		handleClose();
	}, [apiKeyInputValue, handleClose, setApiKey]);

	return (
		<>
			<Button
				variant="contained"
				color="secondary"
				onClick={() => setConfigDialogOpen(true)}
				startIcon={<FuseSvgIcon>heroicons-outline:cog-6-tooth</FuseSvgIcon>}
			>
				Settings
			</Button>
			<Dialog
				open={configDialogOpen}
				onClose={() => setConfigDialogOpen(false)}
				maxWidth="sm"
				fullWidth
			>
				<DialogTitle className="text-lg">Configuration</DialogTitle>
				<DialogContent>
					<Alert
						severity="info"
						className="mb-24"
					>
						Your API key is not stored, you can use your api key to test the app.
					</Alert>

					<TextField
						label="OpenAI API Key"
						autoFocus
						id="api-key-input"
						value={apiKeyInputValue}
						onChange={(e) => setApiKeyInputValue(e.target.value)}
						type="password"
						autoComplete="off"
						helperText="Enter your OpenAI API key to use the image generator"
						fullWidth
					/>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleClose}>Cancel</Button>
					<Button
						onClick={handleSave}
						variant="contained"
						color="primary"
					>
						Save
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
}

export default AiImageGenConfigDialog;
