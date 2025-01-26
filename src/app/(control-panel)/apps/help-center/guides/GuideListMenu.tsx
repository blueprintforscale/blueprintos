import Typography from '@mui/material/Typography';
import Link from '@fuse/core/Link';
import clsx from 'clsx';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import Button from '@mui/material/Button';
import { darken } from '@mui/material/styles';
import { Guide } from '../HelpCenterApi';

type GuideListMenuProps = {
	list: Guide[];
	className?: string;
	categorySlug: string;
	maxItems?: number;
};

/**
 * The guide list menu component.
 */
function GuideListMenu(props: GuideListMenuProps) {
	const { list = [], className, categorySlug = '', maxItems = 999 } = props;

	if (list?.length === 0) {
		return null;
	}

	return (
		<div className={clsx('w-full', className)}>
			{list.slice(0, maxItems).map((item) => (
				<Typography
					component={Link}
					className="flex mt-3 font-medium no-underline hover:underline"
					key={item.id}
					to={`/apps/help-center/guides/${categorySlug}/${item.id}`}
					color="secondary"
					role="button"
				>
					{item.title}
				</Typography>
			))}
			{list.length > maxItems && (
				<Button
					component={Link}
					to={`/apps/help-center/guides/${categorySlug}`}
					className="text-md font-medium py-0.5 px-3 min-h-0 h-6 mt-5"
					endIcon={<FuseSvgIcon size={20}>heroicons-outline:arrow-small-right</FuseSvgIcon>}
					variant="contained"
					sx={{
						color: 'text.secondary',
						backgroundColor: (theme) => darken(theme.palette.background.default, 0.1),
						'&:hover': {
							backgroundColor: (theme) => darken(theme.palette.background.default, 0.2)
						}
					}}
				>
					View All
				</Button>
			)}
		</div>
	);
}

export default GuideListMenu;
