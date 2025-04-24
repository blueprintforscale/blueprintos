import _ from 'lodash';
import { PartialDeep } from 'type-fest';
import { Task, SubTask } from '../TasksApi';

/**
 * The sub task model.
 */
export const subTaskModel = (data: PartialDeep<SubTask>): SubTask =>
	_.defaults(data || {}, {
		id: '',
		title: '',
		completed: false
	});

/**
 * The task model.
 */
const TaskModel = (data: PartialDeep<Task>): Task =>
	_.defaults(data || {}, {
		id: '',
		type: 'task',
		title: '',
		notes: '',
		completed: false,
		dueDate: null,
		priority: 0,
		tags: [],
		assignedTo: null,
		subTasks: [],
		order: 1
	}) as Task;

export default TaskModel;
