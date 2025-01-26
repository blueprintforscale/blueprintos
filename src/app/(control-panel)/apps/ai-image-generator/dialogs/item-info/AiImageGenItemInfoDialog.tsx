import { Dialog, DialogTitle, DialogContent, Typography, Card, CardMedia, IconButton } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import useAiImageGenAppContext from '../../contexts/useAiImageGenAppContext';

function AiImageGenItemInfoDialog() {
	const { setSelectedItem, selectedItem } = useAiImageGenAppContext();

	if (!selectedItem) return null;

	const { response, formData: { prompt, negativePrompt, size, artStyle, style, mood, lighting, quality } = {} } =
		selectedItem;

	const imageUrl = response?.data?.[0]?.url;
	const revisedPrompt = response?.data?.[0]?.revised_prompt;
	const created = response?.created;

	return (
		<Dialog
			open={!!selectedItem}
			onClose={() => setSelectedItem(null)}
			maxWidth="lg"
			fullWidth
		>
			<IconButton
				className="absolute top-1 right-1"
				onClick={() => setSelectedItem(null)}
			>
				<FuseSvgIcon>heroicons-solid:x-mark</FuseSvgIcon>
			</IconButton>

			<DialogTitle className="text-lg">Image Details</DialogTitle>

			<DialogContent>
				<div className="grid md:grid-cols-3 gap-6 min-h-[70vh]">
					<div className="grid col-span-2 items-start">
						{imageUrl && (
							<Card>
								<CardMedia
									component="img"
									image={imageUrl}
									alt={prompt}
								/>
							</Card>
						)}
					</div>

					<div className="flex flex-col col-span-1">
						<div className="flex flex-col gap-6">
							<div className="flex flex-col gap-2">
								{prompt && (
									<Typography>
										<strong>Prompt:</strong> {prompt}
									</Typography>
								)}
								{revisedPrompt && (
									<Typography>
										<strong>Revised Prompt:</strong> {revisedPrompt}
									</Typography>
								)}
								{negativePrompt && (
									<Typography>
										<strong>Negative Prompt:</strong> {negativePrompt}
									</Typography>
								)}
							</div>

							<div className="flex flex-col gap-2">
								<Typography className="text-lg font-bold">Image Settings</Typography>
								{size && (
									<Typography>
										<strong>Size:</strong> {size}
									</Typography>
								)}
								{artStyle && (
									<Typography>
										<strong>Art Style:</strong> {artStyle}
									</Typography>
								)}
								{style && (
									<Typography>
										<strong>Style:</strong> {style}
									</Typography>
								)}
								{mood && (
									<Typography>
										<strong>Mood:</strong> {mood}
									</Typography>
								)}
								{lighting && (
									<Typography>
										<strong>Lighting:</strong> {lighting}
									</Typography>
								)}
								{quality && (
									<Typography>
										<strong>Quality:</strong> {quality}
									</Typography>
								)}
							</div>

							{created && (
								<Typography variant="body2">
									<strong>Created:</strong> {new Date(created * 1000).toLocaleString()}
								</Typography>
							)}
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}

export default AiImageGenItemInfoDialog;
