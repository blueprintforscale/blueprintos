import { Controller, useForm } from 'react-hook-form';
import { darken } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import { useEffect, useState, MouseEvent } from 'react';
import _ from 'lodash';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useParams } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ScrumboardList, useCreateScrumboardBoardListMutation } from '../../../ScrumboardApi';
import useUpdateScrumboardBoard from '../../../hooks/useUpdateScrumboardBoard';

const defaultValues: {
	title: ScrumboardList['title'];
} = {
	title: ''
};

/**
 * Form Validation Schema
 */
const schema = z.object({
	title: z.string().min(1, 'You must enter a title').nonempty('You must enter a title')
});

type FormType = z.infer<typeof schema>;

/**
 * The board add list component.
 */
function BoardAddList() {
	const routeParams = useParams();
	const { boardId } = routeParams as { boardId: string };

	const updateBoard = useUpdateScrumboardBoard();

	const [createList] = useCreateScrumboardBoardListMutation();

	const [formOpen, setFormOpen] = useState(false);

	const { control, formState, handleSubmit, reset } = useForm<FormType>({
		mode: 'onChange',
		defaultValues,
		resolver: zodResolver(schema)
	});

	const { isValid, dirtyFields } = formState;

	useEffect(() => {
		if (!formOpen) {
			reset(defaultValues);
		}
	}, [formOpen, reset]);

	function handleOpenForm(ev: MouseEvent<HTMLButtonElement>) {
		ev.stopPropagation();
		setFormOpen(true);
	}

	function handleCloseForm() {
		setFormOpen(false);
	}

	function onSubmit(data: FormType) {
		const payload = {
			boardId,
			title: data.title
		};
		createList(payload).then((res) => {
			const newList = res?.data as ScrumboardList;
			updateBoard((board) => ({
				...board,
				lists: [...board.lists, { id: newList.id, cards: [] }]
			}));
			handleCloseForm();
		});
	}

	return (
		<div>
			<Card
				className="w-80 mx-2 sm:mx-3 rounded-lg shadow-0"
				square
				sx={{
					backgroundColor: (theme) =>
						darken(theme.palette.background.default, theme.palette.mode === 'light' ? 0.03 : 0.25)
				}}
			>
				{formOpen ? (
					<ClickAwayListener onClickAway={handleCloseForm}>
						<form
							className="p-3"
							onSubmit={handleSubmit(onSubmit)}
						>
							<Controller
								name="title"
								control={control}
								render={({ field }) => (
									<TextField
										{...field}
										className="mb-2"
										required
										fullWidth
										variant="outlined"
										placeholder="List title*"
										autoFocus
										slotProps={{
											input: {
												endAdornment: (
													<InputAdornment position="end">
														<IconButton
															onClick={handleCloseForm}
															size="small"
														>
															<FuseSvgIcon size={18}>
																heroicons-outline:x-mark
															</FuseSvgIcon>
														</IconButton>
													</InputAdornment>
												)
											}
										}}
									/>
								)}
							/>

							<div className="flex justify-between items-center">
								<Button
									variant="contained"
									color="secondary"
									type="submit"
									disabled={_.isEmpty(dirtyFields) || !isValid}
									size="small"
								>
									Add
								</Button>
							</div>
						</form>
					</ClickAwayListener>
				) : (
					<Button
						onClick={handleOpenForm}
						classes={{
							root: 'font-medium w-full rounded-lg p-6 justify-start'
						}}
						startIcon={<FuseSvgIcon>heroicons-outline:plus-circle</FuseSvgIcon>}
						sx={{
							backgroundColor: 'divider',
							'&:hover, &:focus': {
								backgroundColor: (theme) => `rgba(${theme.vars.palette.dividerChannel} / 0.8)`
							},
							color: 'text.secondary'
						}}
					>
						Add another list
					</Button>
				)}
			</Card>
		</div>
	);
}

export default BoardAddList;
