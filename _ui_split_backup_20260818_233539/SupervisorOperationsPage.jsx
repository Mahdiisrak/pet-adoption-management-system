import { useState } from "react";
import api from "../../services/api";

function Fields({ names }) {
  return names.map((f) => (
    <div className="col-md-4" key={f.name}>
      <label className="form-label">{f.label}</label>
      {f.type === "select" ? (
        <select className="form-select" name={f.name} defaultValue={f.defaultValue || ""} required={f.required}>
          <option value="">Select</option>
          {f.options.map((x) => <option key={x} value={x}>{x}</option>)}
        </select>
      ) : (
        <input className="form-control" name={f.name} type={f.type || "text"} required={f.required} defaultValue={f.defaultValue || ""} />
      )}
    </div>
  ));
}

function FormCard({ title, fields, button, onSubmit }) {
  return (
    <div className="card border-0 shadow-sm mb-4">
      <div className="card-body">
        <h5 className="fw-bold mb-3">{title}</h5>
        <form onSubmit={onSubmit}>
          <div className="row g-3"><Fields names={fields} /></div>
          <button className="btn btn-primary mt-3" type="submit">{button}</button>
        </form>
      </div>
    </div>
  );
}

export default function SupervisorOperationsPage() {
  const [message, setMessage] = useState("");
  const [viewRows, setViewRows] = useState([]);
  const [viewName, setViewName] = useState("");

  const post = (url) => async (e) => {
    e.preventDefault();
    try {
      const data = Object.fromEntries(new FormData(e.currentTarget).entries());
      const r = await api.post(url, data);
      setMessage(r.data.message || "Saved");
      e.currentTarget.reset();
    } catch (err) { setMessage(err.response?.data?.message || err.message); }
  };

  const updateStatus = async (e) => {
    e.preventDefault();
    try {
      const data = Object.fromEntries(new FormData(e.currentTarget).entries());
      const r = await api.patch(`/supervisor/status/${data.entity}/${data.id}`, { status: data.status });
      setMessage(r.data.message || "Status updated");
    } catch (err) { setMessage(err.response?.data?.message || err.message); }
  };

  const loadView = async (name) => {
    try {
      const r = await api.get(`/supervisor/views/${name}`);
      setViewRows(r.data.data || []);
      setViewName(name);
      setMessage("");
    } catch (err) { setMessage(err.response?.data?.message || err.message); }
  };

  const doctorFields = [
    { name: "personId", label: "Person ID", required: true }, { name: "userId", label: "User ID", required: true },
    { name: "firstName", label: "First Name", required: true }, { name: "lastName", label: "Last Name", required: true },
    { name: "gender", label: "Gender", type: "select", options: ["MALE", "FEMALE", "UNKNOWN"] }, { name: "email", label: "Email", type: "email" },
    { name: "phoneNo", label: "Phone" }, { name: "address", label: "Address" }, { name: "dateOfBirth", label: "Date of Birth", type: "date" },
    { name: "hireDate", label: "Hire Date", type: "date" }, { name: "licenseNo", label: "License No", required: true },
    { name: "specialization", label: "Specialization" }, { name: "salary", label: "Salary", type: "number" },
    { name: "username", label: "Username", required: true }, { name: "password", label: "Password", type: "password", required: true },
  ];
  const volunteerFields = [
    { name: "personId", label: "Person ID", required: true }, { name: "firstName", label: "First Name", required: true },
    { name: "lastName", label: "Last Name", required: true }, { name: "gender", label: "Gender", type: "select", options: ["MALE", "FEMALE", "UNKNOWN"] },
    { name: "email", label: "Email", type: "email" }, { name: "phoneNo", label: "Phone" }, { name: "address", label: "Address" },
    { name: "dateOfBirth", label: "Date of Birth", type: "date" }, { name: "joinDate", label: "Join Date", type: "date" },
    { name: "availability", label: "Availability", type: "select", options: ["AVAILABLE", "UNAVAILABLE", "ON_DUTY"], defaultValue: "AVAILABLE" },
    { name: "skills", label: "Skills" },
  ];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4"><div><h2 className="fw-bold mb-1">Supervisor Operations</h2><p className="text-secondary mb-0">Add staff, SQL views, status, salary and medicine expense.</p></div></div>
      {message && <div className="alert alert-info">{message}</div>}

      <div className="card border-0 shadow-sm mb-4"><div className="card-body">
        <h5 className="fw-bold">SQL Views</h5>
        <div className="d-flex gap-2 flex-wrap mb-3">
          <button className="btn btn-outline-primary" onClick={() => loadView("persons")}>View All Persons</button>
          <button className="btn btn-outline-primary" onClick={() => loadView("staff")}>View All Staff</button>
          <button className="btn btn-outline-primary" onClick={() => loadView("salaries")}>View Salary History</button>
        </div>
        {viewRows.length > 0 && <div className="table-responsive"><table className="table table-sm table-hover"><thead><tr>{Object.keys(viewRows[0]).map(k => <th key={k}>{k}</th>)}</tr></thead><tbody>{viewRows.map((row,i)=><tr key={i}>{Object.values(row).map((v,j)=><td key={j}>{v == null ? "-" : String(v)}</td>)}</tr>)}</tbody></table></div>}
        {viewName && !viewRows.length && <div className="text-secondary">No rows in {viewName} view.</div>}
      </div></div>

      <FormCard title="Add Doctor" fields={doctorFields} button="Create Doctor" onSubmit={post("/supervisor/doctors")} />
      <FormCard title="Add Volunteer" fields={volunteerFields} button="Create Volunteer" onSubmit={post("/supervisor/volunteers")} />
      <FormCard title="Record Salary Payment" button="Record Salary" onSubmit={post("/supervisor/salary-payments")} fields={[
        { name: "receiverType", label: "Receiver Type", type: "select", options: ["EMPLOYEE", "SUPERVISOR", "DOCTOR"], required: true },
        { name: "receiverId", label: "Receiver ID", required: true }, { name: "amount", label: "Amount", type: "number", required: true },
        { name: "salaryDate", label: "Payment Date", type: "date" },
      ]} />
      <FormCard title="Record Medicine Expense" button="Record Expense" onSubmit={post("/supervisor/medicine-expenses")} fields={[
        { name: "medicineId", label: "Medicine ID", required: true }, { name: "amount", label: "Expense Amount", type: "number", required: true },
        { name: "quantity", label: "Purchased Quantity", type: "number" }, { name: "expenseDate", label: "Expense Date", type: "date" },
        { name: "description", label: "Description" },
      ]} />
      <FormCard title="Update Status" button="Update Status" onSubmit={updateStatus} fields={[
        { name: "entity", label: "Entity", type: "select", options: ["PET", "EMPLOYEE", "VOLUNTEER", "LOCAL_PET", "GUEST_PET", "SHELTER", "ADOPTION", "RESCUE", "SALARY", "ADOPTER", "SYSTEM_USER"], required: true },
        { name: "id", label: "Record ID", required: true }, { name: "status", label: "New Status", required: true },
      ]} />
    </div>
  );
}