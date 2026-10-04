import { useEffect, useState } from "react";
import api from "../../services/api";

function EmergencyContactsPage() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [editMode, setEditMode] = useState(false);
  const [editingContactNo, setEditingContactNo] = useState(null);

  const [formData, setFormData] = useState({
    contactName: "",
    relationship: "",
    phoneNo: "",
  });

  const loadContacts = async () => {
    try {
      setError("");

      const response = await api.get(
        "/employee/emergency-contacts"
      );

      setContacts(response.data.data || []);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Failed to load emergency contacts"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContacts();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData({
      contactName: "",
      relationship: "",
      phoneNo: "",
    });

    setEditMode(false);
    setEditingContactNo(null);
    setShowForm(false);
  };

  const handleAddClick = () => {
    setError("");
    setSuccess("");

    setEditMode(false);
    setEditingContactNo(null);

    setFormData({
      contactName: "",
      relationship: "",
      phoneNo: "",
    });

    setShowForm(true);
  };

  const handleEditClick = (contact) => {
    setError("");
    setSuccess("");

    setEditMode(true);
    setEditingContactNo(contact.CONTACT_NO);

    setFormData({
      contactName: contact.CONTACT_NAME || "",
      relationship: contact.RELATIONSHIP || "",
      phoneNo: contact.PHONE_NO || "",
    });

    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleCancel = () => {
    setError("");
    resetForm();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!formData.contactName.trim()) {
      setError("Contact name is required");
      return;
    }

    if (!formData.phoneNo.trim()) {
      setError("Phone number is required");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        contactName: formData.contactName.trim(),
        relationship:
          formData.relationship.trim() || null,
        phoneNo: formData.phoneNo.trim(),
      };

      let response;

      if (editMode) {
        response = await api.put(
          `/employee/emergency-contacts/${editingContactNo}`,
          payload
        );
      } else {
        response = await api.post(
          "/employee/emergency-contacts",
          payload
        );
      }

      setSuccess(
        response.data.message ||
          (editMode
            ? "Emergency contact updated successfully"
            : "Emergency contact added successfully")
      );

      resetForm();

      await loadContacts();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          (editMode
            ? "Failed to update emergency contact"
            : "Failed to add emergency contact")
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-4">
        <div className="alert alert-light border">
          Loading emergency contacts...
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="d-flex justify-content-between align-items-start mb-4">
        <div>
          <h2 className="fw-bold mb-1">
            Emergency Contacts
          </h2>

          <p className="text-secondary mb-0">
            Manage your personal emergency contact information.
          </p>
        </div>

        <div className="d-flex gap-2 align-items-center">
          <span className="badge bg-primary fs-6">
            Total: {contacts.length}
          </span>

          {!showForm && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleAddClick}
            >
              <i className="bi bi-plus-circle me-2"></i>
              Add Emergency Contact
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          {success}
        </div>
      )}

      {showForm && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body p-4">
            <div className="mb-3">
              <h5 className="fw-bold mb-1">
                {editMode
                  ? "Edit Emergency Contact"
                  : "Add Emergency Contact"}
              </h5>

              <p className="text-secondary small mb-0">
                {editMode
                  ? `Updating Contact No ${editingContactNo}`
                  : "This contact will be connected to your employee account."}
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-4">
                  <label
                    htmlFor="contactName"
                    className="form-label fw-semibold"
                  >
                    Contact Name
                    <span className="text-danger ms-1">
                      *
                    </span>
                  </label>

                  <input
                    type="text"
                    id="contactName"
                    name="contactName"
                    className="form-control"
                    placeholder="e.g. Lutfur Rahman"
                    value={formData.contactName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-4">
                  <label
                    htmlFor="relationship"
                    className="form-label fw-semibold"
                  >
                    Relationship
                  </label>

                  <input
                    type="text"
                    id="relationship"
                    name="relationship"
                    className="form-control"
                    placeholder="e.g. Father"
                    value={formData.relationship}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-4">
                  <label
                    htmlFor="phoneNo"
                    className="form-label fw-semibold"
                  >
                    Phone Number
                    <span className="text-danger ms-1">
                      *
                    </span>
                  </label>

                  <input
                    type="text"
                    id="phoneNo"
                    name="phoneNo"
                    className="form-control"
                    placeholder="e.g. +880 1304-991339"
                    value={formData.phoneNo}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-12">
                  <div className="d-flex justify-content-end gap-2">
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={handleCancel}
                      disabled={submitting}
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            aria-hidden="true"
                          ></span>

                          {editMode
                            ? "Updating..."
                            : "Saving..."}
                        </>
                      ) : (
                        <>
                          <i
                            className={`bi ${
                              editMode
                                ? "bi-pencil-square"
                                : "bi-check-circle"
                            } me-2`}
                          ></i>

                          {editMode
                            ? "Update Contact"
                            : "Save Contact"}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card border-0 shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Contact No</th>
                <th>Person</th>
                <th>Contact Name</th>
                <th>Relationship</th>
                <th>Phone Number</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>

            <tbody>
              {contacts.map((contact) => (
                <tr
                  key={`${contact.PERSON_ID}-${contact.CONTACT_NO}`}
                >
                  <td className="fw-semibold">
                    {contact.CONTACT_NO}
                  </td>

                  <td>
                    {contact.PERSON_NAME}

                    <div className="small text-secondary">
                      {contact.PERSON_ID}
                    </div>
                  </td>

                  <td>
                    {contact.CONTACT_NAME}
                  </td>

                  <td>
                    {contact.RELATIONSHIP || "-"}
                  </td>

                  <td>
                    {contact.PHONE_NO}
                  </td>

                  <td className="text-end">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary"
                      onClick={() =>
                        handleEditClick(contact)
                      }
                    >
                      <i className="bi bi-pencil-square me-1"></i>
                      Edit
                    </button>
                  </td>
                </tr>
              ))}

              {contacts.length === 0 && (
                <tr>
                  <td
                    colSpan="6"
                    className="text-center text-secondary py-4"
                  >
                    No emergency contact records found.
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

export default EmergencyContactsPage;