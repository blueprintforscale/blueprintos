import { lighten } from '@mui/system';
import { Box, Typography } from '@mui/material';

type FormSectionProps = {
	children: React.ReactNode;
	title?: string;
};

function FormSection(props: FormSectionProps) {
	const { children, title } = props;

	return (
		<Box
			className="p-12 w-full rounded-sm border space-y-8"
			sx={(theme) => ({
				backgroundColor: lighten(theme.palette.background.default, 0.02),
				...theme.applyStyles('light', {
					backgroundColor: lighten(theme.palette.background.default, 0.4)
				})
			})}
		>
			{title && (
				<Typography
					className="text-xs font-semibold"
					color="text.secondary"
				>
					{title}
				</Typography>
			)}
			<div className="">{children}</div>
		</Box>
	);
}

export default FormSection;
