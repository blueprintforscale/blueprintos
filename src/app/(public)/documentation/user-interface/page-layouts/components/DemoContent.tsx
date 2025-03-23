/**
 * Demo Content
 */
import { Box, darken } from '@mui/material';

function DemoContent() {
	return (
		<Box className="flex-auto p-6">
			<Box className="space-y-12">
				{/* Header Section */}
				<div>
					<Box
						className="h-8 w-48 rounded mb-4"
						sx={{
							backgroundColor: (theme) => darken(theme.palette.background.default, 0.05)
						}}
					/>
					<Box className="space-y-2">
						<Box
							className="h-4 w-full rounded"
							sx={{
								backgroundColor: (theme) => darken(theme.palette.background.default, 0.05)
							}}
						/>
						<Box
							className="h-4 w-3/4 rounded"
							sx={{
								backgroundColor: (theme) => darken(theme.palette.background.default, 0.05)
							}}
						/>
					</Box>
				</div>

				{/* Content Blocks */}
				<Box className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{[...Array(12)].map((_, i) => (
						<div key={i}>
							<Box
								className="h-4 w-36 rounded mb-3"
								sx={{
									backgroundColor: (theme) => darken(theme.palette.background.default, 0.05)
								}}
							/>
							<Box className="space-y-2">
								<Box
									className="h-3 w-full rounded"
									sx={{
										backgroundColor: (theme) => darken(theme.palette.background.default, 0.05)
									}}
								/>
								<Box
									className="h-3 w-5/6 rounded"
									sx={{
										backgroundColor: (theme) => darken(theme.palette.background.default, 0.05)
									}}
								/>
								<Box
									className="h-3 w-4/6 rounded"
									sx={{
										backgroundColor: (theme) => darken(theme.palette.background.default, 0.05)
									}}
								/>
							</Box>
						</div>
					))}
				</Box>

				{/* Footer Section */}
				<div>
					<Box className="grid grid-cols-2 md:grid-cols-3 gap-4">
						{[...Array(12)].map((_, i) => (
							<Box
								key={i}
								className="h-20 rounded"
								sx={{
									backgroundColor: (theme) => darken(theme.palette.background.default, 0.1)
								}}
							/>
						))}
					</Box>
				</div>
			</Box>
		</Box>
	);
}

export default DemoContent;
