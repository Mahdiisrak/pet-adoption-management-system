import { useEffect, useState } from "react";
import api from "../../services/api";

function Fields({ fields }) {
  return fields.map((f) => (
    <div className="col-md-4" key={f.name}>
      <label className="form-label">{f.label}</label>
      {f.type === "select" ? (
        <select name={f.name} className="form-select" required={f.required} defaultValue="">
          <option value="">Select</option>{f.options.map(x => <option key={x} value={x}>{x}</option>)}
        </select>
      ) : <input name={f.name} type={f.type || "text"} className="form-control" required={f.required} />}
    </div>
  ));
}

function FormCard({ title, fields, button, onSubmit }) {
  return <div className="card border-0 shadow-sm mb-4"><div className="card-body"><h5 className="fw-bold mb-3">{title}</h5><form onSubmit={onSubmit}><div className="row g-3"><Fields fields={fields} /></div><button className="btn btn-primary mt-3">{button}</button></form></div></div>;
}

export default function DoctorOperationsPage() {
  const [pets, setPets] = useState([]);
  const [message, setMessage] = useState("");
  const loadPets = async () => {
    try { const r = await api.get("/doctor/pets"); setPets(r.data.data || []); }
    catch (err) { setMessage(err.response?.data?.message || err.message); }
  };
  useEffect(() => { loadPets(); }, []);

  const post = (url) => async (e) => {
    e.preventDefault();
    try { const data = Object.fromEntries(new FormData(e.currentTarget).entries()); const r = await api.post(url, data); setMessage(r.data.message || "Saved"); e.currentTarget.reset(); await loadPets(); }
    catch (err) { setMessage(err.response?.data?.message || err.message); }
  };
  const patchById = (base, idField) => async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    const id = data[idField]; delete data[idField];
    Object.keys(data).forEach(k => data[k] === "" && delete data[k]);
    try { const r = await api.patch(`${base}/${id}`, data); setMessage(r.data.message || "Updated"); await loadPets(); }
    catch (err) { setMessage(err.response?.data?.message || err.message); }
  };

  return <div>
    <h2 className="fw-bold mb-1">Doctor Operations</h2><p className="text-secondary mb-4">Update pets and write medical data.</p>
    {message && <div className="alert alert-info">{message}</div>}

    <div className="card border-0 shadow-sm mb-4"><div className="card-body"><h5 className="fw-bold">Pets</h5><div className="table-responsive"><table className="table table-sm"><thead><tr><th>ID</th><th>Name</th><th>Species</th><th>Breed</th><th>Weight</th><th>Status</th></tr></thead><tbody>{pets.map(p => <tr key={p.PET_ID}><td>{p.PET_ID}</td><td>{p.PET_NAME}</td><td>{p.SPECIES}</td><td>{p.BREED || "-"}</td><td>{p.WEIGHT || "-"}</td><td>{p.PET_STATUS}</td></tr>)}</tbody></table></div></div></div>

    <FormCard title="Update Pet" button="Update Pet" onSubmit={patchById("/doctor/pets", "petId")} fields={[
      { name: "petId", label: "Pet ID", required: true }, { name: "petName", label: "Pet Name" }, { name: "species", label: "Species" },
      { name: "breed", label: "Breed" }, { name: "color", label: "Color" }, { name: "weight", label: "Weight", type: "number" },
      { name: "petStatus", label: "Status", type: "select", options: ["AVAILABLE", "ADOPTED", "RESCUED", "TREATMENT", "GUEST"] },
      { name: "dateOfBirth", label: "Date of Birth", type: "date" },
    ]} />

    <FormCard title="Create Medical Record" button="Create Medical Record" onSubmit={post("/doctor/medical-records")} fields={[
      { name: "recordId", label: "Record ID (optional)" }, { name: "petId", label: "Pet ID", required: true }, { name: "recordDate", label: "Record Date", type: "date" },
      { name: "diagnosis", label: "Diagnosis" }, { name: "treatment", label: "Treatment" }, { name: "healthStatus", label: "Health Status" },
    ]} />

    <FormCard title="Update Medical Record" button="Update Medical Record" onSubmit={patchById("/doctor/medical-records", "recordId")} fields={[
      { name: "recordId", label: "Record ID", required: true }, { name: "diagnosis", label: "Diagnosis" }, { name: "treatment", label: "Treatment" }, { name: "healthStatus", label: "Health Status" },
    ]} />

    <FormCard title="Add Vaccination" button="Add Vaccination" onSubmit={post("/doctor/vaccinations")} fields={[
      { name: "vaccinationId", label: "Vaccination ID (optional)" }, { name: "recordId", label: "Medical Record ID", required: true },
      { name: "vaccineName", label: "Vaccine Name", required: true }, { name: "vaccinationDate", label: "Vaccination Date", type: "date", required: true },
      { name: "nextDueDate", label: "Next Due Date", type: "date" }, { name: "vaccinePrice", label: "Vaccine Price", type: "number" },
      { name: "vaccinationStatus", label: "Status", type: "select", options: ["SCHEDULED", "COMPLETED", "MISSED", "CANCELLED"] },
    ]} />

    <FormCard title="Update Vaccination Status" button="Update Vaccination Status" onSubmit={async (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(e.currentTarget).entries());
      try { const r = await api.patch(`/doctor/vaccinations/${data.vaccinationId}/status`, { status: data.status }); setMessage(r.data.message || "Updated"); e.currentTarget.reset(); }
      catch (err) { setMessage(err.response?.data?.message || err.message); }
    }} fields={[
      { name: "vaccinationId", label: "Vaccination ID", required: true },
      { name: "status", label: "Status", type: "select", options: ["SCHEDULED", "COMPLETED", "MISSED", "CANCELLED"], required: true },
    ]} />

    <FormCard title="Add Medicine" button="Add Medicine" onSubmit={post("/doctor/medicines")} fields={[
      { name: "medicineId", label: "Medicine ID (optional)" }, { name: "medicineName", label: "Medicine Name", required: true },
      { name: "medicineType", label: "Medicine Type" }, { name: "price", label: "Price", type: "number", required: true },
      { name: "stockQuantity", label: "Stock Quantity", type: "number" }, { name: "expiryDate", label: "Expiry Date", type: "date" },
    ]} />

    <FormCard title="Update Medicine" button="Update Medicine" onSubmit={patchById("/doctor/medicines", "medicineId")} fields={[
      { name: "medicineId", label: "Medicine ID", required: true }, { name: "medicineName", label: "Medicine Name" }, { name: "medicineType", label: "Medicine Type" },
      { name: "price", label: "Price", type: "number" }, { name: "stockQuantity", label: "Stock Quantity", type: "number" }, { name: "expiryDate", label: "Expiry Date", type: "date" },
    ]} />

    <FormCard title="Create Prescription" button="Create Prescription" onSubmit={post("/doctor/prescriptions")} fields={[
      { name: "recordId", label: "Medical Record ID", required: true }, { name: "medicineId", label: "Medicine ID", required: true }, { name: "dosage", label: "Dosage", required: true },
      { name: "frequency", label: "Frequency" }, { name: "durationDays", label: "Duration Days", type: "number" }, { name: "instructions", label: "Instructions" },
    ]} />
  </div>;
}