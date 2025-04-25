'use client';

import FuseLoading from '@fuse/core/FuseLoading';
import FusePageSimple from '@fuse/core/FusePageSimple/FusePageSimple';
import Typography from '@mui/material/Typography';
import Masonry from '@mui/lab/Masonry';
import _ from 'lodash';
import { useDeleteNotificationMutation, useGetAllNotificationsQuery } from './NotificationApi';
import NotificationCard from './NotificationCard';
import NotificationsAppHeader from './NotificationsAppHeader';

function NotificationsApp() {
	const [deleteNotification] = useDeleteNotificationMutation();

	const { data: notifications, isLoading } = useGetAllNotificationsQuery();

	function handleDismiss(id: string) {
		deleteNotification(id);
	}

	if (isLoading) {
		return <FuseLoading />;
	}

	return (
		<FusePageSimple
			header={<NotificationsAppHeader />}
			content={
				<div className="flex flex-wrap w-full p-4 mt-0 sm:mt-2">
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
						{_.orderBy(notifications, ['time'], ['desc']).map((notification) => (
							<NotificationCard
								key={notification.id}
								className=""
								item={notification}
								onClose={handleDismiss}
							/>
						))}
					</Masonry>

					{notifications.length === 0 && (
						<div className="flex flex-1 items-center justify-center p-16">
							<Typography
								className="text-center text-xl"
								color="text.secondary"
							>
								There are no notifications for now.
							</Typography>
						</div>
					)}
				</div>
			}
		/>
	);
}

export default NotificationsApp;
