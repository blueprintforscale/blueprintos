'use client';

import Typography from '@mui/material/Typography';
import { motion } from 'motion/react';
import Box from '@mui/material/Box';
import { lighten, ThemeProvider } from '@mui/material/styles';
import { OutlinedInput } from '@mui/material';
import InputAdornment from '@mui/material/InputAdornment';
import Card from '@mui/material/Card';
import Link from '@fuse/core/Link';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import PageBreadcrumb from 'src/components/PageBreadcrumb';
import { useMainThemeDark } from '@fuse/core/FuseSettings/hooks/fuseThemeHooks';
import FaqList from '../faqs/FaqList';
import { useGetHelpCenterFaqCategoriesQuery, useGetHelpCenterFaqsByCategoryQuery } from '../HelpCenterApi';

/**
 * The help center home.
 */
function HelpCenterHome() {
	const mainThemeDark = useMainThemeDark();
	const { data: faqsCategories } = useGetHelpCenterFaqCategoriesQuery();
	const mostFaqCategoryId = faqsCategories?.[0]?.id;
	const { data: faqsMost } = useGetHelpCenterFaqsByCategoryQuery(
		{ categoryId: mostFaqCategoryId },
		{ skip: !mostFaqCategoryId }
	);

	return (
		<div className="flex flex-col flex-auto min-w-0">
			<ThemeProvider theme={mainThemeDark}>
				<Box
					className="relative pt-8 pb-28 px-4 sm:pt-20 sm:pb-48 sm:px-16 overflow-hidden"
					sx={(theme) => ({
						backgroundColor: 'primary.dark',
						color: theme.palette.getContrastText(theme.palette.primary.main)
					})}
				>
					<div className="flex flex-col items-center justify-center mx-auto w-full">
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1, transition: { delay: 0 } }}
						>
							<PageBreadcrumb color="secondary" />
						</motion.div>
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1, transition: { delay: 0 } }}
						>
							<Typography className="mt-1 text-5xl sm:text-7xl font-extrabold tracking-tight leading-[1.25] text-center">
								How can we help you today?
							</Typography>
						</motion.div>
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1, transition: { delay: 0.3 } }}
						>
							<Typography
								color="text.secondary"
								className="mt-3 sm:text-2xl text-center tracking-tight"
							>
								Search for a topic or question, check out our FAQs and guides, contact us for detailed
								support
							</Typography>
						</motion.div>
						<motion.div
							initial={{ y: -20, opacity: 0 }}
							animate={{ y: 0, opacity: 1, transition: { delay: 0.2 } }}
						>
							<OutlinedInput
								sx={{ backgroundColor: 'transparent' }}
								className="flex flex-1 items-center px-4 mx-2 rounded-full h-11 max-w-full w-80 sm:w-sm mt-10 sm:mt-20"
								placeholder="Enter a question, topic or keyword"
								fullWidth
								startAdornment={
									<InputAdornment position="start">
										<FuseSvgIcon color="disabled">heroicons-solid:magnifying-glass</FuseSvgIcon>
									</InputAdornment>
								}
								inputProps={{
									'aria-label': 'Search'
								}}
							/>
						</motion.div>
					</div>
					<svg
						className="absolute inset-0 pointer-events-none"
						viewBox="0 0 960 540"
						width="100%"
						height="100%"
						preserveAspectRatio="xMidYMax slice"
						xmlns="http://www.w3.org/2000/svg"
					>
						<g
							className="opacity-5"
							fill="none"
							stroke="currentColor"
							strokeWidth="100"
						>
							<circle
								r="234"
								cx="196"
								cy="23"
							/>
							<circle
								r="234"
								cx="790"
								cy="491"
							/>
						</g>
					</svg>
				</Box>
			</ThemeProvider>
			<div className="flex flex-col items-center px-6 sm:px-10">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-y-8 md:gap-y-0 md:gap-x-6 w-full max-w-sm md:max-w-6xl -mt-16 sm:-mt-24">
					<Card
						component={Link}
						to="/apps/help-center/faqs"
						role="button"
						className="relative flex flex-col shadow-sm hover:shadow-lg overflow-hidden transition-shadow ease-in-out duration-150"
					>
						<div className="flex flex-col flex-auto items-center justify-center p-8 text-center">
							<div className="text-2xl font-semibold">FAQs</div>
							<div
								className="md:max-w-40 mt-1"
								color="text.secondary"
							>
								Frequently asked questions and answers
							</div>
						</div>
						<Box
							className="flex items-center justify-center py-4 px-8"
							sx={(theme) => ({
								backgroundColor: lighten(theme.palette.background.default, 0.02),
								...theme.applyStyles('light', {
									backgroundColor: lighten(theme.palette.background.default, 0.4)
								})
							})}
						>
							<Typography
								color="secondary"
								className="mx-2"
							>
								Go to FAQs
							</Typography>
							<FuseSvgIcon
								size={20}
								color="secondary"
							>
								heroicons-solid:arrow-small-right
							</FuseSvgIcon>
						</Box>
					</Card>
					<Card
						component={Link}
						to="/apps/help-center/guides"
						role="button"
						className="relative flex flex-col shadow-sm hover:shadow-lg overflow-hidden transition-shadow ease-in-out duration-150"
					>
						<div className="flex flex-col flex-auto items-center justify-center p-8 text-center">
							<div className="text-2xl font-semibold">Guides</div>
							<div
								className="md:max-w-40 mt-1"
								color="text.secondary"
							>
								Articles and resources to guide you
							</div>
						</div>
						<Box
							className="flex items-center justify-center py-4 px-8"
							sx={(theme) => ({
								backgroundColor: lighten(theme.palette.background.default, 0.02),
								...theme.applyStyles('light', {
									backgroundColor: lighten(theme.palette.background.default, 0.4)
								})
							})}
						>
							<Typography
								color="secondary"
								className="mx-2"
							>
								Check guides
							</Typography>
							<FuseSvgIcon
								size={20}
								color="secondary"
							>
								heroicons-solid:arrow-small-right
							</FuseSvgIcon>
						</Box>
					</Card>
					<Card
						component={Link}
						to="/apps/help-center/support"
						role="button"
						className="relative flex flex-col shadow-sm hover:shadow-lg overflow-hidden transition-shadow ease-in-out duration-150"
					>
						<div className="flex flex-col flex-auto items-center justify-center p-8 text-center">
							<div className="text-2xl font-semibold">Support</div>
							<div
								className="md:max-w-40 mt-1"
								color="text.secondary"
							>
								Contact us for more detailed support
							</div>
						</div>
						<Box
							className="flex items-center justify-center py-4 px-8"
							sx={(theme) => ({
								backgroundColor: lighten(theme.palette.background.default, 0.02),
								...theme.applyStyles('light', {
									backgroundColor: lighten(theme.palette.background.default, 0.4)
								})
							})}
						>
							<Typography
								color="secondary"
								className="mx-2"
							>
								Contact us
							</Typography>
							<FuseSvgIcon
								size={20}
								color="secondary"
							>
								heroicons-solid:arrow-small-right
							</FuseSvgIcon>
						</Box>
					</Card>
				</div>
			</div>
			<Typography className="mt-24 px-4 text-3xl sm:text-5xl font-extrabold leading-[1.25] tracking-tight text-center">
				Most frequently asked questions
			</Typography>
			<Typography
				className="mt-2 px-4 text-xl text-center"
				color="text.secondary"
			>
				Here are the most frequently asked questions you may check before getting started
			</Typography>
			<div className="flex flex-col w-full px-4 items-center my-12">
				<FaqList
					className="w-full max-w-6xl"
					list={faqsMost}
				/>
			</div>
		</div>
	);
}

export default HelpCenterHome;
