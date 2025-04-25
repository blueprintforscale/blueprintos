'use client';

import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { z } from 'zod';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import _ from 'lodash';
import { useEffect } from 'react';
import { useGetAccountSettingsQuery, useUpdateAccountSettingsMutation } from '../SettingsApi';

const defaultValues: FormType = {
	id: '',
	name: '',
	username: '',
	title: '',
	company: '',
	about: '',
	email: '',
	phone: '',
	country: '',
	language: ''
};

/**
 * Form Validation Schema
 */
const schema = z.object({
	id: z.string().min(1, 'ID is required'),
	name: z.string().min(1, 'Name is required'),
	username: z.string().min(1, 'Username is required'),
	title: z.string().min(1, 'Title is required'),
	company: z.string().min(1, 'Company is required'),
	about: z.string().min(1, 'About is required'),
	email: z.string().email('Invalid email').min(1, 'Email is required'),
	phone: z.string().min(1, 'Phone is required'),
	country: z.string().min(1, 'Country is required'),
	language: z.string().min(1, 'Language is required')
});

type FormType = z.infer<typeof schema>;

function AccountTab() {
	const { data: accountSettings } = useGetAccountSettingsQuery();
	const [updateAccountSettings] = useUpdateAccountSettingsMutation();

	const { control, reset, handleSubmit, formState } = useForm<FormType>({
		defaultValues,
		mode: 'all',
		resolver: zodResolver(schema)
	});

	const { isValid, dirtyFields, errors } = formState;

	useEffect(() => {
		reset(accountSettings);
	}, [accountSettings, reset]);

	/**
	 * Form Submit
	 */
	function onSubmit(formData: FormType) {
		updateAccountSettings(formData);
	}

	return (
		<div className="w-full max-w-5xl">
			<form onSubmit={handleSubmit(onSubmit)}>
				<div className="w-full">
					<Typography className="text-xl">Profile</Typography>
					<Typography color="text.secondary">
						Following information is publicly displayed, be careful!
					</Typography>
				</div>
				<div className="mt-8 grid w-full gap-6 sm:grid-cols-4">
					<div className="sm:col-span-4">
						<Controller
							control={control}
							name="name"
							render={({ field }) => (
								<TextField
									{...field}
									label="Name"
									placeholder="Name"
									id="name"
									error={!!errors.name}
									helperText={errors?.name?.message}
									variant="outlined"
									required
									fullWidth
									slotProps={{
										input: {
											startAdornment: (
												<InputAdornment position="start">
													<FuseSvgIcon size={20}>heroicons-solid:user-circle</FuseSvgIcon>
												</InputAdornment>
											)
										}
									}}
								/>
							)}
						/>
					</div>
					<div className="sm:col-span-4">
						<Controller
							control={control}
							name="username"
							render={({ field }) => (
								<TextField
									{...field}
									label="Username"
									placeholder="Username"
									id="user-name"
									error={!!errors.username}
									helperText={errors?.username?.message}
									variant="outlined"
									required
									fullWidth
									slotProps={{
										input: {
											startAdornment: (
												<InputAdornment position="start">
													<Typography
														color="text.secondary"
														className="italic"
													>
														fusetheme.com/
													</Typography>
												</InputAdornment>
											)
										}
									}}
								/>
							)}
						/>
					</div>
					<div className="sm:col-span-2">
						<Controller
							control={control}
							name="title"
							render={({ field }) => (
								<TextField
									className=""
									{...field}
									label="Title"
									placeholder="Job title"
									id="title"
									error={!!errors.title}
									helperText={errors?.title?.message}
									variant="outlined"
									fullWidth
									slotProps={{
										input: {
											startAdornment: (
												<InputAdornment position="start">
													<FuseSvgIcon size={20}>heroicons-solid:briefcase</FuseSvgIcon>
												</InputAdornment>
											)
										}
									}}
								/>
							)}
						/>
					</div>
					<div className="sm:col-span-2">
						<Controller
							control={control}
							name="company"
							render={({ field }) => (
								<TextField
									className=""
									{...field}
									label="Company"
									placeholder="Company"
									id="company"
									error={!!errors.company}
									helperText={errors?.company?.message}
									variant="outlined"
									fullWidth
									slotProps={{
										input: {
											startAdornment: (
												<InputAdornment position="start">
													<FuseSvgIcon size={20}>
														heroicons-solid:building-office-2
													</FuseSvgIcon>
												</InputAdornment>
											)
										}
									}}
								/>
							)}
						/>
					</div>
					<div className="sm:col-span-4">
						<Controller
							control={control}
							name="about"
							render={({ field }) => (
								<TextField
									className=""
									{...field}
									label="Notes"
									placeholder="Notes"
									id="notes"
									error={!!errors.about}
									variant="outlined"
									fullWidth
									multiline
									minRows={5}
									maxRows={10}
									slotProps={{
										input: {
											className: 'max-h-min h-min items-start',
											startAdornment: (
												<InputAdornment
													className="mt-4"
													position="start"
												>
													<FuseSvgIcon size={20}>
														heroicons-solid:bars-3-bottom-left
													</FuseSvgIcon>
												</InputAdornment>
											)
										}
									}}
									helperText={
										<span className="flex flex-col">
											<span>
												Brief description for your profile. Basic HTML and Emoji are allowed.
											</span>
											<span>{errors?.about?.message}</span>
										</span>
									}
								/>
							)}
						/>
					</div>
				</div>

				<div className="my-10 border-t" />
				<div className="w-full">
					<Typography className="text-xl">Personal Information</Typography>
					<Typography color="text.secondary">
						Communication details in case we want to connect with you. These will be kept private.
					</Typography>
				</div>
				<div className="grid w-full gap-6 sm:grid-cols-4 mt-8">
					<div className="sm:col-span-2">
						<Controller
							control={control}
							name="email"
							render={({ field }) => (
								<TextField
									{...field}
									label="Email"
									placeholder="Email"
									variant="outlined"
									fullWidth
									error={!!errors.email}
									helperText={errors?.email?.message}
									slotProps={{
										input: {
											startAdornment: (
												<InputAdornment position="start">
													<FuseSvgIcon size={20}>heroicons-solid:envelope</FuseSvgIcon>
												</InputAdornment>
											)
										}
									}}
								/>
							)}
						/>
					</div>
					<div className="sm:col-span-2">
						<Controller
							control={control}
							name="phone"
							render={({ field }) => (
								<TextField
									{...field}
									label="Phone Number"
									placeholder="Phone Number"
									variant="outlined"
									fullWidth
									error={!!errors.phone}
									helperText={errors?.phone?.message}
									slotProps={{
										input: {
											startAdornment: (
												<InputAdornment position="start">
													<FuseSvgIcon size={20}>heroicons-solid:phone</FuseSvgIcon>
												</InputAdornment>
											)
										}
									}}
								/>
							)}
						/>
					</div>
					<div className="sm:col-span-2">
						<Controller
							control={control}
							name="country"
							render={({ field }) => (
								<TextField
									{...field}
									label="Country"
									placeholder="County"
									variant="outlined"
									fullWidth
									error={!!errors.country}
									helperText={errors?.country?.message}
									slotProps={{
										input: {
											startAdornment: (
												<InputAdornment position="start">
													<FuseSvgIcon size={20}>heroicons-solid:flag</FuseSvgIcon>
												</InputAdornment>
											)
										}
									}}
								/>
							)}
						/>
					</div>
					<div className="sm:col-span-2">
						<Controller
							control={control}
							name="language"
							render={({ field }) => (
								<TextField
									{...field}
									label="Language"
									placeholder="Language"
									variant="outlined"
									fullWidth
									error={!!errors.language}
									helperText={errors?.language?.message}
									slotProps={{
										input: {
											startAdornment: (
												<InputAdornment position="start">
													<FuseSvgIcon size={20}>heroicons-solid:globe-alt</FuseSvgIcon>
												</InputAdornment>
											)
										}
									}}
								/>
							)}
						/>
					</div>
				</div>

				<Divider className="mb-10 mt-11 border-t" />
				<div className="flex items-center justify-end space-x-2">
					<Button
						variant="outlined"
						disabled={_.isEmpty(dirtyFields)}
						onClick={() => reset(accountSettings)}
					>
						Cancel
					</Button>
					<Button
						variant="contained"
						color="secondary"
						disabled={_.isEmpty(dirtyFields) || !isValid}
						type="submit"
					>
						Save
					</Button>
				</div>
			</form>
		</div>
	);
}

export default AccountTab;
