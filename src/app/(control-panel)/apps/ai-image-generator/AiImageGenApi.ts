import { apiService as api } from '@/store/apiService';

export const addTagTypes = ['aiImageGen_presets', 'aiImageGen_items', 'aiImageGen_item'] as const;

const injectedRtkApi = api
	.enhanceEndpoints({
		addTagTypes
	})
	.injectEndpoints({
		endpoints: (build) => ({
			getAiImageGenPresets: build.query<GetAiImageGenPresetsApiResponse, GetAiImageGenPresetsApiArg>({
				query: () => ({ url: `/api/mock/ai-image-generator/presets` }),
				providesTags: ['aiImageGen_presets']
			}),
			createAiImageGenPreset: build.mutation<CreateAiImageGenPresetApiResponse, CreateAiImageGenPresetApiArg>({
				query: (aiImageGenPreset) => ({
					url: `/api/mock/ai-image-generator/presets`,
					method: 'POST',
					body: aiImageGenPreset
				}),
				invalidatesTags: ['aiImageGen_presets']
			}),
			deleteAiImageGenPreset: build.mutation<DeleteAiImageGenPresetApiResponse, DeleteAiImageGenPresetApiArg>({
				query: (id) => ({
					url: `/api/mock/ai-image-generator/presets/${id}`,
					method: 'DELETE'
				}),
				invalidatesTags: ['aiImageGen_presets']
			}),
			getAiImageGenItems: build.query<GetAiImageGenItemsApiResponse, GetAiImageGenItemsApiArg>({
				query: () => ({ url: `/api/mock/ai-image-generator/items` }),
				providesTags: ['aiImageGen_items']
			}),
			createAiImageGenItem: build.mutation<CreateAiImageGenItemApiResponse, CreateAiImageGenItemApiArg>({
				query: (aiImageGenItem) => ({
					url: `/api/mock/ai-image-generator/items`,
					method: 'POST',
					body: aiImageGenItem
				}),
				invalidatesTags: ['aiImageGen_items']
			}),
			getAiImageGenItem: build.query<GetAiImageGenItemApiResponse, GetAiImageGenItemApiArg>({
				query: (queryArg) => ({
					url: `/api/mock/ai-image-generator/items/${queryArg.id}`
				}),
				providesTags: ['aiImageGen_item']
			}),
			updateAiImageGenItem: build.mutation<UpdateAiImageGenItemApiResponse, UpdateAiImageGenItemApiArg>({
				query: (aiImageGenItem) => ({
					url: `/api/mock/ai-image-generator/items/${aiImageGenItem.id}`,
					method: 'PUT',
					body: aiImageGenItem
				}),
				invalidatesTags: ['aiImageGen_items']
			}),
			deleteAiImageGenItem: build.mutation<DeleteAiImageGenItemApiResponse, DeleteAiImageGenItemApiArg>({
				query: (id) => ({
					url: `/api/mock/ai-image-generator/items/${id}`,
					method: 'DELETE'
				}),
				invalidatesTags: ['aiImageGen_items']
			})
		}),
		overrideExisting: false
	});
export { injectedRtkApi as AiImageGenApi };
export type GetAiImageGenPresetsApiResponse = /** status 200 OK */ AiImageGenPreset[];
export type GetAiImageGenPresetsApiArg = void;
export type CreateAiImageGenPresetApiResponse = /** status 200 OK */ AiImageGenPreset;
export type CreateAiImageGenPresetApiArg = AiImageGenPreset;

export type DeleteAiImageGenPresetApiResponse = unknown;
export type DeleteAiImageGenPresetApiArg = string;

export type GetAiImageGenItemsApiResponse = /** status 200 OK */ AiImageGenItem[];
export type GetAiImageGenItemsApiArg = void;
export type CreateAiImageGenItemApiResponse = /** status 200 OK */ AiImageGenItem;
export type CreateAiImageGenItemApiArg = AiImageGenItem;
export type GetAiImageGenItemApiResponse = /** status 200 Tag Found */ AiImageGenItem;
export type GetAiImageGenItemApiArg = {
	id: string;
};
export type UpdateAiImageGenItemApiResponse = /** status 200 Contact Updated */ AiImageGenItem;
export type UpdateAiImageGenItemApiArg = AiImageGenItem;
export type DeleteAiImageGenItemApiResponse = unknown;
export type DeleteAiImageGenItemApiArg = string;
export type AiImageGenSettings = {
	prompt?: string;
	negativePrompt?: string;
	size?: string;
	artStyle?: string;
	style?: string;
	mood?: string;
	lighting?: string;
	quality?: string;
};
export type AiImageGenPreset = {
	id?: string;
	name?: string;
	settings?: AiImageGenSettings;
	createdAt?: number;
};
export type AiImageGenApiResponse = {
	created?: number;
	data?: {
		revised_prompt?: string;
		url?: string;
	}[];
};
export type AiImageGenItem = {
	id?: string;
	favorite?: boolean;
	formData?: AiImageGenSettings;
	response?: AiImageGenApiResponse;
};
export const {
	useGetAiImageGenPresetsQuery,
	useCreateAiImageGenPresetMutation,
	useDeleteAiImageGenPresetMutation,
	useGetAiImageGenItemsQuery,
	useCreateAiImageGenItemMutation,
	useGetAiImageGenItemQuery,
	useUpdateAiImageGenItemMutation,
	useDeleteAiImageGenItemMutation
} = injectedRtkApi;
