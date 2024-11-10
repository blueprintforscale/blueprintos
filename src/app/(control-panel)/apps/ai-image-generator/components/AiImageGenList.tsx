import { Typography } from '@mui/material';
import _ from 'lodash';
import { AiImageGenItem } from '@/app/(control-panel)/apps/ai-image-generator/AiImageGenApi';
import AiImageGenListItem from './AiImageGenListItem';

type AiImageGenListProps = {
	items: AiImageGenItem[];
};

function AiImageGenList(props: AiImageGenListProps) {
	const { items } = props;

	if (items?.length === 0) {
		return (
			<Typography className="text-center text-gray-500 min-h-full h-full flex items-center justify-center">
				No images generated yet. Start by entering a prompt!
			</Typography>
		);
	}

	return (
		<div className="w-full mt-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-12">
			{_.sortBy(items, (item) => item?.response?.created)
				.reverse()
				.map((image) => (
					<AiImageGenListItem
						className="w-full flex col-span-1"
						key={image.id}
						item={image}
					/>
				))}
		</div>
	);
}

export default AiImageGenList;
