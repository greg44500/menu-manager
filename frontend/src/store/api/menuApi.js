import { baseApi } from './baseApi'

export const menuApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        createMenu: builder.mutation({
            query: (menuData) => ({
                url: '/menus',
                method: 'POST',
                body: menuData,
            }),
            invalidatesTags: ['Menus'],
        }),
        getMenuById: builder.query({
            query: (id) => `/menus/${id}`,
            providesTags: (result, error, id) => [{ type: 'Menus', id }],
        }),
    }),
})

export const {
    useCreateMenuMutation,
    useGetMenuByIdQuery,
} = menuApi