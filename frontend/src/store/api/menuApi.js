import { baseApi } from './baseApi'

export const menuApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // Créer un menu
        createMenu: builder.mutation({
            query: (menuData) => ({
                url: '/menus',
                method: 'POST',
                body: menuData,
            }),
            invalidatesTags: ['Menus'],
        }),

        // Lister tous les menus
        getAllMenus: builder.query({
            query: () => '/menus',
            providesTags: ['Menus'],
            transformResponse: (response) => ({
                menus: response.data || [],
                count: response.count || 0,
            }),
        }),

        // Récupérer un menu par ID
        getMenuById: builder.query({
            query: (id) => `/menus/${id}`,
            providesTags: (result, error, id) => [{ type: 'Menus', id }],
        }),

        // Modifier un menu
        updateMenu: builder.mutation({
            query: ({ id, ...body }) => ({
                url: `/menus/${id}`,
                method: 'PUT',
                body,
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: 'Menus', id }, 'Menus'
            ],
        }),

        // Supprimer un menu
        deleteMenu: builder.mutation({
            query: (id) => ({
                url: `/menus/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Menus'],
        }),

        // Historique d'un menu
        getMenuHistory: builder.query({
            query: (id) => `/menus/${id}/history`,
            providesTags: (result, error, id) => [{ type: 'Menus', id, history: true }],
            transformResponse: (res) => res.data || [],
        }),
    }),
})

export const {
    useCreateMenuMutation,
    useGetAllMenusQuery,
    useGetMenuByIdQuery,
    useUpdateMenuMutation,
    useDeleteMenuMutation,
    useGetMenuHistoryQuery,
} = menuApi
