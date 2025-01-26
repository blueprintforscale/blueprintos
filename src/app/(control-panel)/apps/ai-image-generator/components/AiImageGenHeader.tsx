import { Typography } from '@mui/material';
import { motion } from 'motion/react';
import PageBreadcrumb from 'src/components/PageBreadcrumb';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import IconButton from '@mui/material/IconButton';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import ConfigDialog from '../dialogs/config/AiImageGenConfigDialog';

type AiImageGenHeaderProps = {
	onSetSidebarOpen: (open: boolean) => void;
};

function AiImageGenHeader({ onSetSidebarOpen }: AiImageGenHeaderProps) {
	const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));

	return (
		<div className="flex flex-1 flex-col sm:flex-row sm:items-center justify-between py-2 sm:py-6 relative">
			<motion.span
				initial={{ x: -20 }}
				animate={{
					x: 0,
					transition: { delay: 0.2 }
				}}
			>
				<div className="flex flex-col mb-3 sm:mb-0">
					<PageBreadcrumb className="mb-1" />
					<Typography className="text-4xl font-extrabold leading-none tracking-tight">
						AI Image Generator (DALL-E 3)
					</Typography>
				</div>
			</motion.span>
			<div className="flex flex-1 w-full sm:w-auto items-center sm:justify-end space-x-2">
				{isMobile && (
					<IconButton
						onClick={() => onSetSidebarOpen(true)}
						aria-label="open left sidebar"
						className="border border-divider"
					>
						<FuseSvgIcon>heroicons-outline:bars-3</FuseSvgIcon>
					</IconButton>
				)}
				<ConfigDialog />
			</div>
		</div>
	);
}

export default AiImageGenHeader;
