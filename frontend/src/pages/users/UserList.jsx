// src/pages/users/UserList.jsx
import UserTable from '../../pages/users/UserTable'

const UserList = () => {
  // Ici tu peux placer d'autres composants globaux à la section si besoin,
  // ou juste le tableau.
  return (
    <div className="card">
      <h1 className="title-primary">Utilisateurs</h1>
      <UserTable />
    </div>
  )
}

export default UserList
