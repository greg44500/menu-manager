import { baseApi } from './baseApi'

export const menuApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // Créer un menu avec répartition des productions
        createMenu: builder.mutation({
            query: (menuData) => ({
                url: '/menus',
                method: 'POST',
                body: menuData, // Inclut productionAssignment
            }),
            invalidatesTags: ['Menus', 'Services'], // Invalide aussi les services
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
            transformResponse: (response) => response.data || response,
        }),
        // Valider un menu
        toggleMenuValidation: builder.mutation({
            query: ({ id, isMenuValidate }) => ({
                url: `/menus/${id}`,
                method: 'PATCH',
                body: { isMenuValidate },
            }),
            invalidatesTags: (result, error, { id }) => [{ type: 'Menus', id }, 'Menus', 'Services'],
        }),

        // Modifier un menu (sections, isRestaurant, productionAssignment)
        updateMenu: builder.mutation({
            query: ({ id, ...body }) => ({
                url: `/menus/${id}`,
                method: 'PUT',
                body, // Peut inclure sections, isRestaurant, productionAssignment
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: 'Menus', id },
                'Menus',
                'Services' // Rafraîchit aussi les services
            ],
        }),

        // Patch une section spécifique du menu
        patchMenuSection: builder.mutation({
            query: ({ id, sectionKey, items, updateAssignment, columnType }) => ({
                url: `/menus/${id}/sections/${sectionKey}`,
                method: 'PATCH',
                body: {
                    items,
                    updateAssignment, //pour mettre à jour l'assignation
                    columnType //: 'cuisine' ou 'service'
                },
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: 'Menus', id },
                'Menus'
            ],
        }),

        //  Mettre à jour uniquement la répartition des productions
        updateProductionAssignment: builder.mutation({
            query: ({ id, productionAssignment }) => ({
                url: `/menus/${id}/production-assignment`,
                method: 'PATCH',
                body: { productionAssignment },
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: 'Menus', id },
                'Menus',
                'Services'
            ],
        }),

        // Supprimer un menu
        deleteMenu: builder.mutation({
            query: (id) => ({
                url: `/menus/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Menus', 'Services'],
        }),

        // Historique d'un menu
        getMenuHistory: builder.query({
            query: (id) => `/menus/${id}/history`,
            providesTags: (result, error, id) => [{ type: 'Menus', id, history: true }],
            transformResponse: (response) => response.data || [],
        }),

        //  Helper pour récupérer les menus avec leur répartition
        getMenusWithProduction: builder.query({
            query: () => '/menus',
            providesTags: ['Menus'],
            transformResponse: (response) => {
                const menus = response.data || [];
                // Enrichissement des menus avec les productions séparées
                return menus.map(menu => ({
                    ...menu,
                    cuisineProductions: getProductionsByType(menu, 'cuisine'),
                    serviceProductions: getProductionsByType(menu, 'service')
                }));
            },
        }),
    }),
    overrideExisting: false
})

//  HELPER FUNCTIONS pour traiter les productions
const getProductionsByType = (menu, type) => {
    if (!menu?.sections || !menu?.productionAssignment) return {};

    const assignedSections = menu.productionAssignment[type] || [];
    const productions = {};

    assignedSections.forEach(sectionKey => {
        const items = menu.sections[sectionKey];
        if (items && items.length > 0) {
            productions[sectionKey] = items;
        }
    });

    return productions;
};

// Export des hooks
export const {
    useCreateMenuMutation,
    useGetAllMenusQuery,
    useGetMenuByIdQuery,
    useUpdateMenuMutation,
    useToggleMenuValidationMutation,
    usePatchMenuSectionMutation,
    useUpdateProductionAssignmentMutation,
    useDeleteMenuMutation,
    useGetMenuHistoryQuery,
    useGetMenusWithProductionQuery,
} = menuApi

//Export des helpers pour usage externe
export { getProductionsByType };