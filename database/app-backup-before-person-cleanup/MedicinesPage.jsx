import { useEffect, useState } from "react";
import api from "../../services/api";

function MedicinesPage() {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadMedicines = async () => {
      try {
        const response = await api.get("/doctor/medicines");
        setMedicines(response.data.data);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Failed to load medicines"
        );
      } finally {
        setLoading(false);
      }
    };

    loadMedicines();
  }, []);

  const formatDate = (value) => {
    if (!value) return "-";
    return new Date(value).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary"></div>
        <p className="mt-3">Loading medicines...</p>
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Medicines</h2>
          <p className="text-secondary mb-0">
            Medicine inventory information from the Oracle database.
          </p>
        </div>

        <span className="badge bg-primary fs-6">
          Total: {medicines.length}
        </span>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Medicine ID</th>
                <th>Name</th>
                <th>Type</th>
                <th>Unit Price</th>
                <th>Stock</th>
                <th>Expiry Date</th>
              </tr>
            </thead>

            <tbody>
              {medicines.map((medicine) => (
                <tr key={medicine.MEDICINE_ID}>
                  <td className="fw-semibold">
                    {medicine.MEDICINE_ID}
                  </td>

                  <td>{medicine.MEDICINE_NAME}</td>
                  <td>{medicine.MEDICINE_TYPE || "-"}</td>

                  <td>
                    BDT {Number(medicine.PRICE || 0).toFixed(2)}
                  </td>

                  <td>{medicine.STOCK_QUANTITY ?? 0}</td>

                  <td>
                    {formatDate(medicine.EXPIRY_DATE)}
                  </td>
                </tr>
              ))}

              {medicines.length === 0 && (
                <tr>
                  <td
                    colSpan="6"
                    className="text-center text-secondary py-4"
                  >
                    No medicine records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default MedicinesPage;