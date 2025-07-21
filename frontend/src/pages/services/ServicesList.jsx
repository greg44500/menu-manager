import ServiceSection from "./ServiceSection"

const ServicesList = () => {
  return (
    <div>
      <h1 style={{
        fontSize: '2rem',
        fontWeight: '600',
        color: 'var(--primary)',
        marginBottom: '1rem'
      }}>
        Gestion des Services
      </h1>
      <div className="card">
        <div className="card-content">
          <ServiceSection />
        </div>
      </div>
    </div>
  )
}

export default ServicesList