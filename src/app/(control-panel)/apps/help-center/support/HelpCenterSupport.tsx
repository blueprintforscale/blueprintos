'use client';

import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { Controller, useForm } from 'react-hook-form';
import _ from 'lodash';
import TextField from '@mui/material/TextField';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import PageBreadcrumb from 'src/components/PageBreadcrumb';

type formValuesType = { name: string; email: string; subject: string; message: string };

const defaultValues = { name: '', email: '', subject: '', message: '' };

const schema = z.object({
	name: z.string().nonempty('You must enter a name'),
	subject: z.string().nonempty('You must enter a subject'),
	message: z.string().nonempty('You must enter a message'),
	email: z.string().email('You must enter a valid email').nonempty('You must enter an email')
});

/**
 * The help center support.
 */
function HelpCenterSupport() {
	const { control, handleSubmit, watch, formState } = useForm({
		mode: 'onChange',
		defaultValues,
		resolver: zodResolver(schema)
	});
	const { isValid, dirtyFields, errors } = formState;

	const form = watch();

	function onSubmit(data: formValuesType) {
		// eslint-disable-next-line no-console
		console.log(data);
	}

	if (_.isEmpty(form)) {
		return null;
	}

	return (
		<div className="flex flex-col items-center p-6 sm:p-10 container">
			<div className="flex flex-col w-full max-w-6xl">
				<div className="sm:mt-8">
					<PageBreadcrumb />
				</div>
				<div className="mt-2 text-4xl sm:text-7xl font-extrabold tracking-tight leading-[1.25]">
					Contact support
				</div>

				<Paper className="mt-8 sm:mt-12 p-6 pb-7 sm:p-10 sm:pb-7 rounded-xl">
					<form
						onSubmit={handleSubmit(onSubmit)}
						className="px-0 sm:px-6"
					>
						<div className="mb-6">
							<Typography className="text-2xl font-bold tracking-tight">Submit your request</Typography>
							<Typography color="text.secondary">
								Your request will be processed and our support staff will get back to you in 24 hours.
							</Typography>
						</div>
						<div className="space-y-8">
							<Controller
								control={control}
								name="name"
								render={({ field }) => (
									<TextField
										className="w-full"
										{...field}
										label="Name"
										placeholder="Name"
										id="name"
										error={!!errors.name}
										helperText={errors?.name?.message}
										variant="outlined"
										required
										fullWidth
									/>
								)}
							/>

							<Controller
								control={control}
								name="email"
								render={({ field }) => (
									<TextField
										{...field}
										className="w-full"
										label="Email"
										placeholder="Email"
										variant="outlined"
										fullWidth
										error={!!errors.email}
										helperText={errors?.email?.message}
										required
									/>
								)}
							/>

							<Controller
								control={control}
								name="subject"
								render={({ field }) => (
									<TextField
										{...field}
										className="w-full"
										label="Subject"
										placeholder="Subject"
										variant="outlined"
										fullWidth
										error={!!errors.subject}
										helperText={errors?.subject?.message}
										required
									/>
								)}
							/>

							<Controller
								name="message"
								control={control}
								render={({ field }) => (
									<TextField
										{...field}
										label="Message"
										className="w-full m-0"
										margin="normal"
										multiline
										minRows={4}
										variant="outlined"
										error={!!errors.message}
										helperText={errors?.message?.message}
										required
									/>
								)}
							/>
						</div>
						<div className="flex items-center justify-end mt-8">
							<Button className="mx-2">Cancel</Button>
							<Button
								className="mx-2"
								variant="contained"
								color="secondary"
								disabled={_.isEmpty(dirtyFields) || !isValid}
								type="submit"
							>
								Save
							</Button>
						</div>
					</form>
				</Paper>
			</div>
		</div>
	);
}

export default HelpCenterSupport;
