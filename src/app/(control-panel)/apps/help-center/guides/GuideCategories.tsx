'use client';

import Link from '@fuse/core/Link';
import Typography from '@mui/material/Typography';
import _ from 'lodash';
import { useMemo } from 'react';
import PageBreadcrumb from 'src/components/PageBreadcrumb';
import GuideListMenu from './GuideListMenu';
import { useGetHelpCenterGuidesQuery, useGetHelpCenterGuideCategoriesQuery } from '../HelpCenterApi';

/**
 * The guide categories.
 */
function GuideCategories() {
	const { data: guides } = useGetHelpCenterGuidesQuery();
	const { data: categories } = useGetHelpCenterGuideCategoriesQuery();

	const groupedGuides = useMemo(() => {
		return _.map(categories, (category) => ({
			...category,
			guides: _.filter(guides, { categoryId: category.id })
		}));
	}, [categories, guides]);

	return (
		<div className="flex flex-col items-center p-6 sm:p-10 container">
			<div className="flex flex-col w-full max-w-6xl">
				<div className="sm:mt-8">
					<PageBreadcrumb />
				</div>
				<div className="mt-2 text-4xl sm:text-7xl font-extrabold tracking-tight leading-[1.25]">
					Guides & Resources
				</div>
				<div className="grid grid-cols-1 sm:grid-cols-2 grid-flow-row gap-y-12 sm:gap-x-4 mt-8 sm:mt-12">
					{groupedGuides?.map((category) => (
						<div key={category.id}>
							<Typography
								component={Link}
								to={`/apps/help-center/guides/${category.slug}`}
								className="mb-1 text-2xl font-semibold"
								role="button"
							>
								{category.title}
							</Typography>

							<GuideListMenu
								list={category.guides}
								categorySlug={category.slug}
								maxItems={4}
							/>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}

export default GuideCategories;
