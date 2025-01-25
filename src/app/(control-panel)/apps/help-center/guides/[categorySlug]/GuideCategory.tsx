'use client';

import { useParams } from 'next/navigation';
import { useMemo } from 'react';
import PageBreadcrumb from 'src/components/PageBreadcrumb';
import _ from 'lodash';
import GuideListMenu from '../GuideListMenu';
import { useGetHelpCenterGuideCategoriesQuery, useGetHelpCenterGuidesByCategoryQuery } from '../../HelpCenterApi';

/**
 * The guide category.
 */
function GuideCategory() {
	const routeParams = useParams<{ categorySlug: string }>();
	const { categorySlug } = routeParams;

	const { data: categories } = useGetHelpCenterGuideCategoriesQuery();
	const category = useMemo(() => _.find(categories, { slug: categorySlug }), [categories, categorySlug]);

	const { data: guides } = useGetHelpCenterGuidesByCategoryQuery({
		categoryId: category?.id
	});

	return (
		<div className="flex flex-col items-center p-6 sm:p-10 container">
			<div className="flex flex-col w-full max-w-6xl">
				<div className="sm:mt-8">
					<PageBreadcrumb />
				</div>
				<div className="mt-2 text-4xl sm:text-7xl font-extrabold tracking-tight leading-[1.25]">
					{category?.title}
				</div>
				<div className="mt-8 sm:mt-12">
					<GuideListMenu
						list={guides}
						categorySlug={categorySlug}
					/>
				</div>
			</div>
		</div>
	);
}

export default GuideCategory;
