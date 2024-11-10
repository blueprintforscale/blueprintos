import { useState, useMemo } from 'react';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import FuseLoading from '@fuse/core/FuseLoading';
import _ from 'lodash';
import FuseTabs from '@/components/tabs/FuseTabs';
import FuseTab from '@/components/tabs/FuseTab';
import GeneratedImagesList from './AiImageGenList';
import { useGetAiImageGenItemsQuery } from '@/app/(control-panel)/apps/ai-image-generator/AiImageGenApi';
import AiImageGenItemInfoDialog from '../dialogs/item-info/AiImageGenItemInfoDialog';

const tabValues = [
	{
		label: 'All',
		value: 'all',
		icon: null
	},
	{
		label: 'Favorites',
		value: 'favorites',
		icon: 'heroicons-solid:heart'
	}
];

function AiImageGenContent() {
	const [tabValue, setTabValue] = useState(0);
	const { data, isLoading } = useGetAiImageGenItemsQuery();

	const items = useMemo(() => _.filter(data, (item) => (tabValue === 1 ? item.favorite : true)), [data, tabValue]);

	if (isLoading) {
		return <FuseLoading />;
	}

	return (
		<div className="h-full w-full px-24 py-24">
			<div className="w-full mb-24">
				<FuseTabs
					value={tabValue}
					onChange={(_ev, value: number) => setTabValue(value)}
				>
					{tabValues.map((tab) => (
						<FuseTab
							key={tab.value}
							label={tab.label}
							icon={<FuseSvgIcon>{tab.icon}</FuseSvgIcon>}
							iconPosition="start"
						/>
					))}
				</FuseTabs>
			</div>

			<GeneratedImagesList items={items} />

			<AiImageGenItemInfoDialog />
		</div>
	);
}

export default AiImageGenContent;
