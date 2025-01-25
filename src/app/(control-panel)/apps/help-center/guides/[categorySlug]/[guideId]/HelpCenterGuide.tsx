'use client';

import { useParams } from 'next/navigation';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Card from '@mui/material/Card';
import PageBreadcrumb from 'src/components/PageBreadcrumb';
import DemoContent from '@fuse/core/DemoContent';
import { useGetHelpCenterGuideByIdQuery } from '../../../HelpCenterApi';

/**
 * The help center guide.
 */
function HelpCenterGuide() {
	const routeParams = useParams<{ guideId: string }>();
	const { guideId } = routeParams;

	const { data: guide } = useGetHelpCenterGuideByIdQuery(guideId);

	if (!guide) {
		return null;
	}

	return (
		<div className="flex flex-col items-center p-6 sm:p-10 container">
			<div className="flex flex-col w-full max-w-6xl">
				<div className="sm:mt-8">
					<PageBreadcrumb />
				</div>

				<Typography className="mt-2 text-4xl sm:text-7xl font-extrabold tracking-tight leading-[1.25]">
					{guide.title}
				</Typography>

				<Typography
					className="mt-2 sm:text-2xl tracking-tight"
					color="text.secondary"
				>
					{guide.subtitle}
				</Typography>

				<div
					className="mt-8 sm:mt-12 max-w-none prose dark:prose-invert"
					dangerouslySetInnerHTML={{ __html: guide.content }}
				/>

				<DemoContent />

				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-10 pt-8 border-t">
					<Typography
						className="text-sm font-medium"
						color="text.secondary"
					>
						Last updated 2 months ago
					</Typography>
					<div className="flex items-center mt-2 sm:mt-0">
						<Typography
							className="font-medium mx-2"
							color="text.secondary"
						>
							Was this page helpful?
						</Typography>
						<IconButton>
							<FuseSvgIcon>heroicons-outline:thumb-up</FuseSvgIcon>
						</IconButton>
						<IconButton>
							<FuseSvgIcon>heroicons-outline:thumb-down</FuseSvgIcon>
						</IconButton>
					</div>
				</div>

				<Card className="mt-8 flex items-center justify-between p-6 sm:px-10 rounded-xl shadow-sm hover:shadow-lg transition-shadow ease-in-out duration-150">
					<div>
						<Typography color="text.secondary">Next</Typography>
						<Typography className="text-lg font-semibold">Removing a media from a project</Typography>
					</div>
					<FuseSvgIcon className="ml-3">heroicons-outline:arrow-right</FuseSvgIcon>
				</Card>
			</div>
		</div>
	);
}

export default HelpCenterGuide;
