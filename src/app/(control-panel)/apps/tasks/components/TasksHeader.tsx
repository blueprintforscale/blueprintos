import Typography from '@mui/material/Typography';
import { motion } from 'motion/react';
import Button from '@mui/material/Button';
import NavLinkAdapter from '@fuse/core/NavLinkAdapter';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import _ from 'lodash';
import PageBreadcrumb from 'src/components/PageBreadcrumb';
import { useGetTasksQuery } from '../TasksApi';

/**
 * The tasks header.
 */
function TasksHeader() {
	const { data: tasks } = useGetTasksQuery();

	const remainingTasks = _.filter(tasks, (item) => item.type === 'task' && !item.completed).length;

	return (
		<div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 p-6 sm:p-8 w-full justify-between">
			<div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3">
				<div>
					<PageBreadcrumb className="mb-2" />

					<motion.span
						initial={{ x: -20 }}
						animate={{
							x: 0,
							transition: { delay: 0.2 }
						}}
					>
						<Typography className="text-4xl font-extrabold leading-none tracking-tight mb-1">
							Tasks
						</Typography>
					</motion.span>

					<motion.span
						initial={{
							y: -20,
							opacity: 0
						}}
						animate={{
							y: 0,
							opacity: 1,
							transition: { delay: 0.2 }
						}}
					>
						<Typography
							className="text-base font-medium ml-0.5"
							color="text.secondary"
						>
							{`${remainingTasks} remaining tasks`}
						</Typography>
					</motion.span>
				</div>
			</div>

			<div className="flex items-center space-x-2">
				<Button
					className="whitespace-nowrap"
					component={NavLinkAdapter}
					to="/apps/tasks/new/section"
					color="primary"
					variant="contained"
				>
					<FuseSvgIcon size={20}>heroicons-outline:plus</FuseSvgIcon>
					<span className="mx-2">Add Section</span>
				</Button>
				<Button
					className="whitespace-nowrap"
					variant="contained"
					color="secondary"
					component={NavLinkAdapter}
					to="/apps/tasks/new/task"
				>
					<FuseSvgIcon size={20}>heroicons-outline:plus</FuseSvgIcon>
					<span className="mx-2">Add Task</span>
				</Button>
			</div>
		</div>
	);
}

export default TasksHeader;
