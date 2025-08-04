import ItemTable from './ItemTable';

const ItemList = () => (
    <div>
        <h1 className="title-primary">Gestion des Items</h1>
        <div className="card">
            <div className="card-content">
                <ItemTable />
            </div>
        </div>
    </div>
);

export default ItemList;
