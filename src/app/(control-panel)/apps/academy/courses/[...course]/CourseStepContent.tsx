import { useTheme } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import { Typography } from '@mui/material';
import FuseLoading from '@fuse/core/FuseLoading';
import { CourseStep, useGetAcademyCourseStepContentQuery } from '../../AcademyApi';

type CourseStepContentProps = {
	step: CourseStep;
};

function CourseStepContent(props: CourseStepContentProps) {
	const { step } = props;
	const theme = useTheme();
	const { data: stepContent, isLoading } = useGetAcademyCourseStepContentQuery(step?.id, {
		skip: !step?.id
	});

	if (isLoading) {
		return <FuseLoading />;
	}

	return (
		<Paper className="w-full mx-auto sm:my-2 lg:mt-4 p-6 sm:p-10 sm:py-12 rounded-xl shadow-sm overflow-hidden">
			<Typography
				variant="h4"
				className="mb-4 font-medium"
			>
				{step?.title}
			</Typography>

			<Typography
				className="text-2xl mb-8"
				variant="h5"
			>
				{step?.subtitle}
			</Typography>

			<div
				className="prose prose-sm dark:prose-invert w-full max-w-full"
				dangerouslySetInnerHTML={{ __html: stepContent?.html || '' }}
				dir={theme.direction}
			/>
		</Paper>
	);
}

export default CourseStepContent;
