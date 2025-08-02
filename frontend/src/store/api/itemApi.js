import { baseApi } from './baseApi'

export const itemApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // Lister tous les items
        getItems: builder.query({
            query: () => '/items',
            providesTags: ['Items'],
            transformResponse: (res) => ({
                items: res.data || [],
                count: res.count || 0,
            }),
        }),
        // Lister MES items
        getMyItems: builder.query({
            query: () => '/items/mine',
            providesTags: ['Items', 'MyItems'],
            transformResponse: (res) => ({
                items: res.data || [],
                count: res.count || 0,
            }),
        }),
        // Détail d'un item
        getItemById: builder.query({
            query: (id) => `/items/${id}`,
            providesTags: (result, error, id) => [{ type: 'Items', id }],
        }),
        // Créer un item
        createItem: builder.mutation({
            query: (itemData) => ({
                url: '/items',
                method: 'POST',
                body: itemData,
            }),
            invalidatesTags: ['Items', 'MyItems'],
        }),
        // Mettre à jour un item
        updateItem: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `/items/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: 'Items', id },
                'Items',
                'MyItems',
            ],
        }),
        // Supprimer un item
        deleteItem: builder.mutation({
            query: (id) => ({
                url: `/items/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Items', 'MyItems'],
        }),
        // Historique d’un item
        getItemHistory: builder.query({
            query: (id) => `/items/${id}/history`,
            providesTags: (result, error, id) => [{ type: 'Items', id, history: true }],
            transformResponse: (res) => res.data || [],
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
    useGetItemHistoryQuery,  //  hook pour l’historique 
} = itemApi
