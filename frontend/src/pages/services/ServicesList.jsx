// ServicesList.jsx
// Point d'entrée de la page Services. Affiche le titre et le composant principal ServiceSection.
// Conserve un code minimal, réutilisable.

import ServiceSection from './ServiceSection'

const ServicesList = () => (
  <div>
    <h1 className="title-primary">Gestion des services</h1>
    <ServiceSection />
  </div>
)

export default ServicesList
