import { useEffect, useState } from "react";
import api from "../../services/api";

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const response = await api.get("/admin/dashboard");
        setStats(response.data.data);
      } catch (requestError) {
        setError(
          requestError.response?.data?.message ||
            "Failed to load dashboard statistics"
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary"></div>
        <p className="text-secondary mt-3">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        {error}
      </div>
    );
  }

  const cards = [
    {
      title: "Total Pets",
      value: stats.TOTAL_PETS,
      icon: "bi-heart-fill",
    },
    {
      title: "Local Pets",
      value: stats.LOCAL_PETS,
      icon: "bi-house-heart",
    },
    {
      title: "Guest Pets",
      value: stats.GUEST_PETS,
      icon: "bi-box-arrow-in-right",
    },
    {
      title: "Completed Adoptions",
      value: stats.COMPLETED_ADOPTIONS,
      icon: "bi-check-circle-fill",
    },
    {
      title: "Active Rescues",
      value: stats.ACTIVE_RESCUES,
      icon: "bi-life-preserver",
    },
    {
      title: "Total Volunteers",
      value: stats.TOTAL_VOLUNTEERS,
      icon: "bi-people-fill",
    },
    {
      title: "Donation Amount",
      value: `BDT ${Number(stats.DONATION_AMOUNT).toLocaleString()}`,
      icon: "bi-cash-stack",
    },
    {
      title: "Current Balance",
      value: `BDT ${Number(stats.CURRENT_BALANCE).toLocaleString()}`,
      icon: "bi-wallet2",
    },
    {
      title: "Upcoming Vaccinations",
      value: stats.UPCOMING_VACCINATIONS,
      icon: "bi-calendar-check",
    },
  ];

  return (
    <>
      <div className="mb-4">
        <h2 className="fw-bold mb-1">Admin Dashboard</h2>
        <p className="text-secondary mb-0">
          Real-time overview from the Oracle database.
        </p>
      </div>

      <div className="row g-4">
        {cards.map((card) => (
          <div
            className="col-12 col-sm-6 col-xl-4"
            key={card.title}
          >
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <p className="text-secondary mb-2">
                      {card.title}
                    </p>

                    <h3 className="fw-bold mb-0">
                      {card.value}
                    </h3>
                  </div>

                  <div
                    className="bg-primary-subtle text-primary rounded-3
                               d-flex align-items-center justify-content-center"
                    style={{ width: "48px", height: "48px" }}
                  >
                    <i className={`bi ${card.icon} fs-4`}></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default AdminDashboard;

