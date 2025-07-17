import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    flexRender,
} from '@tanstack/react-table'

const DataTable = ({ columns, data = [], isLoading = false, rowActions = null, pageSize = 5 }) => {

    const table = useReactTable({
        columns,
        data,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        initialState: {
            pagination: {
                pageIndex: 0,
                pageSize,
            },
        },
        // pagination gérée en interne, sans setter custom
        debugTable: false,
    })

    const headerGroups = table.getHeaderGroups()
    const rows = table.getRowModel().rows

    if (isLoading) {
        return (
            <div className="datatable-loading">
                <div className="loader" /> Chargement des données...
            </div>
        )
    }

    return (
        <div className="datatable-wrapper">
            <div className="datatable-container">
                <table className="datatable">
                    <thead className="datatable-thead">
                        {headerGroups.map(headerGroup => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <th key={header.id} className="datatable-th">
                                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                    </th>
                                ))}
                                {rowActions && (
                                    <th className="datatable-th datatable-th-actions">Actions</th>
                                )}
                            </tr>
                        ))}
                    </thead>
                    <tbody>
                        {rows.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length + (rowActions ? 1 : 0)} className="datatable-empty">
                                    Aucune donnée disponible.
                                </td>
                            </tr>
                        ) : (
                            rows.map(row => (
                                <tr key={row.id} className="datatable-tr">
                                    {row.getVisibleCells().map(cell => (
                                        <td key={cell.id} className="datatable-td">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                    {rowActions && (
                                        <td className="datatable-td datatable-td-actions">
                                            {rowActions(row.original)}
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="datatable-pagination">
                <button
                    className="btn btn-sm"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                >
                    Précédent
                </button>
                <span className="px-2 text-sm">
                    Page {table.getState().pagination.pageIndex + 1} sur {table.getPageCount()}
                </span>
                <button
                    className="btn btn-sm"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                >
                    Suivant
                </button>
            </div>
        </div>
    )
}

export default DataTable
