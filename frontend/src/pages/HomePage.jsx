import { useEffect, useState } from "react";
import api from "../services/api";

function HomePage() {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPets = async () => {
      try {
        const response = await api.get("/pets");
        setPets(response.data.data);
      } catch (err) {
        console.error("Failed to load pets:", err);
        setError("Failed to load pet data.");
      } finally {
        setLoading(false);
      }
    };

    fetchPets();
  }, []);

  return (
    <main className="container py-5">
      <div className="mb-4">
        <h1 className="fw-bold">Pet Adoption and Management System</h1>
        <p className="text-secondary mb-0">
          Available pet records from the Oracle database
        </p>
      </div>

      {loading && (
        <div className="alert alert-info">
          Loading pets...
        </div>
      )}

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="row g-4">
          {pets.map((pet) => (
            <div className="col-12 col-md-6 col-lg-4" key={pet.PET_ID}>
              <div className="card h-100 shadow-sm border-0">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <h4 className="card-title mb-1">
                        {pet.PET_NAME}
                      </h4>

                      <p className="text-secondary mb-0">
                        ID: {pet.PET_ID}
                      </p>
                    </div>

                    <span className="badge text-bg-primary">
                      {pet.PET_STATUS}
                    </span>
                  </div>

                  <p className="mb-2">
                    <strong>Species:</strong> {pet.SPECIES}
                  </p>

                  <p className="mb-2">
                    <strong>Breed:</strong> {pet.BREED || "Unknown"}
                  </p>

                  <p className="mb-0">
                    <strong>Gender:</strong> {pet.GENDER}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

export default HomePage;
