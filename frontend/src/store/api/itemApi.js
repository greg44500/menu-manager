import { baseApi } from './baseApi'

export const itemApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getItems: builder.query({
            query: () => '/items',
            providesTags: ['Items'],
        }),
        getItemById: builder.query({
            query: (id) => `/items/${id}`,
            providesTags: (result, error, id) => [{ type: 'Items', id }],
        }),
        getMyItems: builder.query({
            query: () => '/items/mine',
            providesTags: ['Items'],
        }),
        createItem: builder.mutation({
            query: (itemData) => ({
                url: '/items',
                method: 'POST',
                body: itemData,
            }),
            invalidatesTags: ['Items'],
        }),
        updateItem: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `/items/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['Items'],
        }),
        deleteItem: builder.mutation({
            query: (id) => ({
                url: `/items/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Items'],
        }),
    }),
})

export const {
    useGetItemsQuery,
    useGetItemByIdQuery,
    useGetMyItemsQuery,
    useCreateItemMutation,
    useUpdateItemMutation,
    useDeleteItemMutation,
} = itemApi