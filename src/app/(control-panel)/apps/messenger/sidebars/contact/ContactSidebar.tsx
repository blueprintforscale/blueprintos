import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { format } from 'date-fns/format';
import { useContext } from 'react';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { lighten } from '@mui/material/styles';
import Box from '@mui/material/Box';
import UserAvatar from '../../components/UserAvatar';
import { useGetMessengerContactQuery } from '../../MessengerApi';
import MessengerAppContext from '@/app/(control-panel)/apps/messenger/contexts/MessengerAppContext';

/**
 * The contact sidebar.
 */
function ContactSidebar() {
	const { contactSidebarOpen, setContactSidebarOpen } = useContext(MessengerAppContext);

	const contactId = contactSidebarOpen;

	const { data: contact } = useGetMessengerContactQuery(contactId, {
		skip: !contactId
	});

	if (!contact) {
		return null;
	}

	return (
		<div className="flex flex-col flex-auto h-full">
			<Box
				className="border-b-1"
				sx={(theme) => ({
					backgroundColor: lighten(theme.palette.background.default, 0.02),
					...theme.applyStyles('light', {
						backgroundColor: lighten(theme.palette.background.default, 0.4)
					})
				})}
			>
				<Toolbar className="flex items-center px-1">
					<IconButton
						onClick={() => setContactSidebarOpen(null)}
						color="inherit"
					>
						<FuseSvgIcon>heroicons-outline:x-mark</FuseSvgIcon>
					</IconButton>
					<Typography
						className="px-1 font-medium text-lg"
						color="inherit"
						variant="subtitle1"
					>
						Contact info
					</Typography>
				</Toolbar>
			</Box>
			<div className="flex flex-col justify-center items-center mt-8">
				<UserAvatar
					className="w-40 h-40 text-16"
					user={contact}
				/>
				<Typography className="mt-4 text-lg font-medium">{contact.name}</Typography>
				<Typography
					color="text.secondary"
					className="mt-0.5 text-md"
				>
					{contact.about}
				</Typography>
			</div>
			<div className="w-full p-6">
				{contact.attachments?.media && (
					<>
						<Typography className="mt-4 text-lg font-medium">Media</Typography>
						<div className="grid grid-cols-4 gap-1 mt-4">
							{contact.attachments?.media.map((url, index) => (
								<img
									key={index}
									className="h-20 rounded-sm object-cover"
									src={url}
									alt=""
								/>
							))}
						</div>
					</>
				)}

				<Typography className="mt-10 text-lg font-medium">Details</Typography>

				<div className="mt-4">
					<Typography
						className="text-base font-medium"
						color="text.secondary"
					>
						Emails
					</Typography>

					{contact.details.emails?.map((item, index) => (
						<div
							className="flex items-center"
							key={index}
						>
							<Typography>{item.email}</Typography>
							{item.label && (
								<Typography
									className="text-md truncate"
									color="text.secondary"
								>
									<span className="mx-2">&bull;</span>
									<span className="font-medium">{item.label}</span>
								</Typography>
							)}
						</div>
					))}
				</div>

				<div className="mt-4">
					<Typography
						className="text-base font-medium"
						color="text.secondary"
					>
						Phone numbers
					</Typography>

					{contact.details.phoneNumbers?.map((item, index) => (
						<div
							className="flex items-center"
							key={index}
						>
							<Typography>{item.phoneNumber}</Typography>
							{item.label && (
								<Typography
									className="text-md truncate"
									color="text.secondary"
								>
									<span className="mx-2">&bull;</span>
									<span className="font-medium">{item.label}</span>
								</Typography>
							)}
						</div>
					))}
				</div>

				<div className="mt-4">
					<Typography
						className="text-base font-medium"
						color="text.secondary"
					>
						Title
					</Typography>

					<Typography>{contact.details.title}</Typography>
				</div>

				<div className="mt-4">
					<Typography
						className="text-base font-medium"
						color="text.secondary"
					>
						Company
					</Typography>

					<Typography>{contact.details.company}</Typography>
				</div>

				<div className="mt-4">
					<Typography
						className="text-base font-medium"
						color="text.secondary"
					>
						Birthday
					</Typography>

					<Typography>{format(new Date(contact.details.birthday), 'P')}</Typography>
				</div>

				<div className="mt-4">
					<Typography
						className="text-base font-medium"
						color="text.secondary"
					>
						Address
					</Typography>

					<Typography>{contact.details.address}</Typography>
				</div>
			</div>
		</div>
	);
}

export default ContactSidebar;
