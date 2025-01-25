import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { lighten } from '@mui/material/styles';
import { motion } from 'motion/react';
import FuseLoading from '@fuse/core/FuseLoading';
import FolderItem from './FolderItem';
import FileItem from './FileItem';
import useFileManagerData from './hooks/useFileManagerData';

/**
 * The file manager list.
 */
function FileManagerList() {
	const { folders, files, isLoading } = useFileManagerData();

	if (isLoading) {
		return <FuseLoading />;
	}

	if (files.length === 0 && folders.length === 0) {
		return (
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1, transition: { delay: 0.1 } }}
				className="flex flex-1 items-center justify-center h-full"
			>
				<Typography
					color="text.secondary"
					variant="h5"
				>
					There are no items!
				</Typography>
			</motion.div>
		);
	}

	return (
		<div className="p-4 md:p-8">
			{folders?.length > 0 && (
				<Box
					className="p-4 w-full rounded-xl mb-6 border"
					sx={(theme) => ({
						backgroundColor: lighten(theme.palette.background.default, 0.02),
						...theme.applyStyles('light', {
							backgroundColor: lighten(theme.palette.background.default, 0.4)
						})
					})}
				>
					<Typography className="font-medium">Folders</Typography>
					<div className="flex flex-wrap -m-2 mt-2">
						{folders.map((item) => (
							<FolderItem
								key={item.id}
								item={item}
							/>
						))}
					</div>
				</Box>
			)}
			{files.length > 0 && (
				<Box
					className="p-4 w-full rounded-xl mb-6 border"
					sx={(theme) => ({
						backgroundColor: lighten(theme.palette.background.default, 0.02),
						...theme.applyStyles('light', {
							backgroundColor: lighten(theme.palette.background.default, 0.4)
						})
					})}
				>
					<Typography className="font-medium">Files</Typography>
					<div className="flex flex-wrap -m-2 mt-2">
						{files.map((item) => (
							<FileItem
								key={item.id}
								item={item}
							/>
						))}
					</div>
				</Box>
			)}
		</div>
	);
}

export default FileManagerList;
