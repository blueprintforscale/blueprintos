'use client';

import { useEffect, useMemo, useState } from 'react';
import { styled } from '@mui/material/styles';
import FusePageCarded from '@fuse/core/FusePageCarded';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import { CircularProgress, Backdrop } from '@mui/material';
import AiImageGenHeader from './components/AiImageGenHeader';
import AiImageGenSidebarContent from './components/AiImageGenSidebarContent';
import AiImageGenContent from './components/AiImageGenContent';
import AiImageGenAppContext from './contexts/AiImageGenAppContext';
import { AiImageGenItem } from './AiImageGenApi';

const Root = styled(FusePageCarded)(() => ({
	'& .FusePageCarded-leftSidebar': {
		'& .FusePageCarded-sidebarContent': {
			maxHeight: '100%'
		}
	}
}));

function AiImageGenApp() {
	const [apiKey, setApiKey] = useState('');
	const [selectedItem, setSelectedItem] = useState<AiImageGenItem | null>(null);
	const [configDialogOpen, setConfigDialogOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
	const [leftSidebarOpen, setLeftSidebarOpen] = useState(!isMobile);

	useEffect(() => {
		setLeftSidebarOpen(!isMobile);
	}, [isMobile]);

	useEffect(() => {
		if (isMobile && loading) {
			setLeftSidebarOpen(false);
		}
	}, [isMobile, loading]);

	const contextValue = useMemo(
		() => ({
			apiKey,
			setApiKey,
			configDialogOpen,
			setConfigDialogOpen,
			selectedItem,
			setSelectedItem,
			loading,
			setLoading
		}),
		[configDialogOpen, setConfigDialogOpen, apiKey, setApiKey, selectedItem, setSelectedItem, loading, setLoading]
	);

	return (
		<AiImageGenAppContext.Provider value={contextValue}>
			<>
				<Root
					header={<AiImageGenHeader onSetSidebarOpen={setLeftSidebarOpen} />}
					content={<AiImageGenContent />}
					leftSidebarOpen={leftSidebarOpen}
					leftSidebarOnClose={() => {
						setLeftSidebarOpen(false);
					}}
					leftSidebarContent={<AiImageGenSidebarContent />}
					scroll={isMobile ? 'normal' : 'content'}
					leftSidebarWidth={320}
				/>

				<Backdrop
					open={loading}
					className="z-50"
				>
					<CircularProgress color="secondary" />
				</Backdrop>
			</>
		</AiImageGenAppContext.Provider>
	);
}

export default AiImageGenApp;
