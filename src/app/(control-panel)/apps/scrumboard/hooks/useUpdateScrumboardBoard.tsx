import { useParams } from 'next/navigation';
import { ScrumboardBoard, useGetScrumboardBoardQuery, useUpdateScrumboardBoardMutation } from '../ScrumboardApi';
import { PartialDeep } from 'type-fest/source/partial-deep';

function useUpdateScrumboardBoard() {
	const routeParams = useParams<{ boardId?: string }>();
	const { boardId } = routeParams;
	const { data: board } = useGetScrumboardBoardQuery(boardId, { skip: !boardId });
	const [updateBoard] = useUpdateScrumboardBoardMutation();

	const handleUpdateBoard = (updateFn: (board: ScrumboardBoard) => PartialDeep<ScrumboardBoard>) => {
		updateBoard({ ...board, ...updateFn(board) });
	};

	return handleUpdateBoard;
}

export default useUpdateScrumboardBoard;
