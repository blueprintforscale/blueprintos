'use client';

import FuseUtils from '@fuse/utils';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import Masonry from '@mui/lab/Masonry';
import { useParams } from 'next/navigation';
import { useAppSelector } from 'src/store/hooks';
import FuseLoading from '@fuse/core/FuseLoading';
import NoteListItem from './NoteListItem';
import { NotesNote, RouteParams, useGetNotesListQuery } from '../../NotesApi';
import { selectSearchText } from '../../notesAppSlice';

/**
 * The note list.
 */
function NoteList() {
	const routeParams = useParams<RouteParams>();
	const { data: notes, isLoading } = useGetNotesListQuery(routeParams);

	const searchText = useAppSelector(selectSearchText);

	const [filteredData, setFilteredData] = useState<NotesNote[]>([]);

	useEffect(() => {
		function filterData() {
			let data = notes;

			if (searchText?.length === 0) {
				return data;
			}

			data = FuseUtils.filterArrayByString(data, searchText);

			return data;
		}

		if (notes?.length > 0) {
			setFilteredData(filterData());
		}
	}, [notes, searchText, routeParams]);

	if (isLoading) {
		return <FuseLoading />;
	}

	if (!filteredData || filteredData.length === 0) {
		return (
			<div className="flex items-center justify-center h-full">
				<Typography
					color="text.secondary"
					variant="h5"
				>
					There are no notes!
				</Typography>
			</div>
		);
	}

	return (
		<div className="flex flex-wrap w-full">
			<Masonry
				columns={{
					xs: 1,
					sm: 2,
					md: 3,
					lg: 4,
					xl: 5,
					xxl: 6
				}}
				spacing={2}
				className="my-masonry-grid flex w-full"
			>
				{filteredData.map((note) => (
					<NoteListItem
						key={note.id}
						note={note}
						className="w-full rounded-lg shadow-sm"
					/>
				))}
			</Masonry>
		</div>
	);
}

export default NoteList;
