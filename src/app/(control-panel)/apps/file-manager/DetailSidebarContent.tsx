import Typography from '@mui/material/Typography';
import { motion } from 'motion/react';
import { useAppDispatch } from 'src/store/hooks';
import IconButton from '@mui/material/IconButton';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { lighten } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { useEffect } from 'react';
import usePathname from '@fuse/hooks/usePathname';
import ItemIcon from './ItemIcon';
import { resetSelectedItemId } from './fileManagerAppSlice';
import useFileManagerData from './hooks/useFileManagerData';

/**
 * The detail sidebar content.
 */
function DetailSidebarContent() {
	const { selectedItem } = useFileManagerData();
	const pathname = usePathname();
	const dispatch = useAppDispatch();

	useEffect(() => {
		dispatch(resetSelectedItemId());
	}, [dispatch, pathname]);

	if (!selectedItem) {
		return null;
	}

	return (
		<motion.div
			initial={{ y: 50, opacity: 0.8 }}
			animate={{ y: 0, opacity: 1, transition: { delay: 0.3 } }}
			className="file-details p-6 sm:p-8"
		>
			<div className="flex items-center justify-end w-full">
				<IconButton onClick={() => dispatch(resetSelectedItemId())}>
					<FuseSvgIcon>heroicons-outline:x-mark</FuseSvgIcon>
				</IconButton>
			</div>
			<Box
				className=" w-full rounded-lg border preview h-32 sm:h-64 file-icon flex items-center justify-center my-8"
				sx={(theme) => ({
					backgroundColor: lighten(theme.palette.background.default, 0.02),
					...theme.applyStyles('light', {
						backgroundColor: lighten(theme.palette.background.default, 0.4)
					})
				})}
			>
				<motion.div
					initial={{ scale: 0 }}
					animate={{ scale: 1, transition: { delay: 0.3 } }}
				>
					<ItemIcon type={selectedItem.type} />
				</motion.div>
			</Box>
			<Typography className="text-xl font-medium">{selectedItem.name}</Typography>
			<div className="text-lg font-medium mt-8">Information</div>
			<div className="flex flex-col mt-4 border-t border-b divide-y font-medium">
				<div className="flex items-center justify-between py-3">
					<Typography color="text.secondary">Created By</Typography>
					<Typography>{selectedItem.createdBy}</Typography>
				</div>
				<div className="flex items-center justify-between py-3">
					<Typography color="text.secondary">Created At</Typography>
					<Typography>{selectedItem.createdAt}</Typography>
				</div>
				<div className="flex items-center justify-between py-3">
					<Typography color="text.secondary">Modified At</Typography>
					<Typography>{selectedItem.modifiedAt}</Typography>
				</div>
				<div className="flex items-center justify-between py-3">
					<Typography color="text.secondary">Size</Typography>
					<Typography>{selectedItem.size}</Typography>
				</div>
				{selectedItem.contents && (
					<div className="flex items-center justify-between py-3">
						<Typography color="text.secondary">Contents</Typography>
						<Typography>{selectedItem.contents}</Typography>
					</div>
				)}
			</div>
			{selectedItem.description && (
				<>
					<div className="text-lg font-medium mt-8 pb-4 border-b">Description</div>
					<Typography className="py-3">{selectedItem.description}</Typography>
				</>
			)}
			<div className="grid grid-cols-2 gap-4 w-full mt-8">
				<Button
					className="flex-auto"
					color="secondary"
					variant="contained"
				>
					Download
				</Button>
				<Button className="flex-auto">Delete</Button>
			</div>
		</motion.div>
	);
}

export default DetailSidebarContent;
