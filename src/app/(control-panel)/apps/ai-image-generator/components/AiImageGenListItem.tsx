import { Paper, ButtonGroup } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import clsx from 'clsx';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import {
	AiImageGenItem,
	useDeleteAiImageGenItemMutation,
	useUpdateAiImageGenItemMutation
} from '@/app/(control-panel)/apps/ai-image-generator/AiImageGenApi';
import useAiImageGenAppContext from '../contexts/useAiImageGenAppContext';

type AiImageGenListItemProps = {
	className?: string;
	item: AiImageGenItem;
};

function AiImageGenListItem(props: AiImageGenListItemProps) {
	const { item, className = '' } = props;
	const { setSelectedItem } = useAiImageGenAppContext();

	const [remove] = useDeleteAiImageGenItemMutation();
	const [update] = useUpdateAiImageGenItemMutation();

	function handleInfo() {
		setSelectedItem(item);
	}

	function handleRemove() {
		remove(item.id);
	}

	function handleDownload() {
		const downloadLink = document.createElement('a');
		downloadLink.href = item.response?.data[0]?.url;
		downloadLink.download = `${item.formData?.prompt?.slice(0, 30)}.png`;
		downloadLink.click();
		downloadLink.remove();
	}

	function handleToggleFavorite() {
		update({ ...item, favorite: !item.favorite });
	}

	return (
		<Paper
			className={clsx('relative group min-h-120 lg:min-h-200', className)}
			sx={{
				aspectRatio: item.formData?.size.replace('x', '/'),
				background: `url(${item.response?.data[0]?.url}) no-repeat center center / cover`
			}}
		>
			{item.favorite && (
				<FuseSvgIcon className="absolute top-8 right-8 text-red-500">heroicons-solid:heart</FuseSvgIcon>
			)}
			<div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
				<ButtonGroup
					variant="contained"
					sx={{
						backgroundColor: (theme) => theme.palette.background.paper,
						color: (theme) => theme.palette.text.primary
					}}
				>
					<IconButton onClick={handleInfo}>
						<FuseSvgIcon>heroicons-solid:information-circle</FuseSvgIcon>
					</IconButton>
					<IconButton onClick={handleDownload}>
						<FuseSvgIcon>heroicons-solid:cloud-arrow-down</FuseSvgIcon>
					</IconButton>
					<IconButton onClick={handleToggleFavorite}>
						<FuseSvgIcon>{item.favorite ? 'heroicons-solid:heart' : 'heroicons-outline:heart'}</FuseSvgIcon>
					</IconButton>
					<IconButton onClick={handleRemove}>
						<FuseSvgIcon>heroicons-solid:trash</FuseSvgIcon>
					</IconButton>
				</ButtonGroup>
			</div>
		</Paper>
	);
}

export default AiImageGenListItem;
