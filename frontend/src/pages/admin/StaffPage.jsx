import { useEffect, useState } from "react";
import api from "../../services/api";

function StaffPage() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadStaff = async () => {
      try {
        const response = await api.get("/admin/staff");
        setStaff(response.data.data);
      } catch (requestError) {
        setError(
          requestError.response?.data?.message ||
            "Failed to load staff information"
        );
      } finally {
        setLoading(false);
      }
    };

    loadStaff();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary"></div>
        <p className="text-secondary mt-3">Loading staff...</p>
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
          <h2 className="fw-bold mb-1">Staff</h2>
          <p className="text-secondary mb-0">
            Employee, supervisor, doctor and volunteer information.
          </p>
        </div>

        <span className="badge bg-primary fs-6">
          Total: {staff.length}
        </span>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Person ID</th>
                <th>Name</th>
                <th>Role</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Job / Specialization</th>
                <th>Status / Availability</th>
              </tr>
            </thead>

            <tbody>
              {staff.map((member) => (
                <tr key={member.PERSON_ID}>
                  <td className="fw-semibold">
                    {member.PERSON_ID}
                  </td>
                  <td>{member.NAME}</td>
                  <td>
                    <span className="badge bg-primary-subtle text-primary">
                      {member.STAFF_ROLE}
                    </span>
                  </td>
                  <td>{member.PHONE_NO || "-"}</td>
                  <td>{member.EMAIL || "-"}</td>
                  <td>
                    {member.SPECIALIZATION ||
                      member.JOB_TITLE ||
                      "-"}
                  </td>
                  <td>
                    {member.EMPLOYMENT_STATUS ||
                      member.AVAILABILITY ||
                      "-"}
                  </td>
                </tr>
              ))}

              {staff.length === 0 && (
                <tr>
                  <td
                    colSpan="7"
                    className="text-center text-secondary py-4"
                  >
                    No staff records found.
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

export default StaffPage;
