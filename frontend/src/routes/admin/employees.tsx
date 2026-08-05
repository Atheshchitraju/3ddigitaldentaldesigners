import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import API_URL from "../../config/api";

export const Route = createFileRoute("/admin/employees")({
  component: EmployeesPage,
});

type Employee = {
  _id: string;
  employeeId: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string | null;
  workingStatus: string;
  status: string;
};

function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "Employee",
    department: "Designer",
  });

  const getToken = () => localStorage.getItem("adminToken");

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await fetch(`${API_URL}/api/employees`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setEmployees(data.employees);
      }

      setLoading(false);
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  const createEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/api/employees`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!data.success) {
        alert(data.message);
        return;
      }

      alert("Employee Created");
      setShowModal(false);

      setForm({
        name: "",
        email: "",
        phone: "",
        password: "",
        role: "Employee",
        department: "Designer",
      });

      fetchEmployees();
    } catch (err) {
      console.log(err);
      alert("Something went wrong creating the employee.");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleEmployee = async (id: string) => {
    if (!confirm("Change employee status?")) return;

    try {
      const response = await fetch(`${API_URL}/api/employees/${id}/toggle`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      const data = await response.json();

      if (!data.success) {
        alert(data.message);
        return;
      }

      fetchEmployees();
    } catch (err) {
      console.log(err);
    }
  };

  const deleteEmployee = async (id: string) => {
    if (!confirm("Delete Employee?")) return;

    try {
      const response = await fetch(`${API_URL}/api/employees/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      const data = await response.json();

      if (!data.success) {
        alert(data.message);
        return;
      }

      fetchEmployees();
    } catch (err) {
      console.log(err);
    }
  };

  const filteredEmployees = employees.filter((employee) => {
    const q = search.toLowerCase();
    return (
      employee.name.toLowerCase().includes(q) ||
      (employee.department ?? "").toLowerCase().includes(q) ||
      employee.employeeId.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {/* Header */}
      <br></br>
      <br></br>
      <br></br>
      <br></br>
      <br></br>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Employee Management</h1>
          <p className="text-gray-500 mt-1">Manage all production employees</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700"
        >
          + Add Employee
        </button>
      </div>

      {/* Statistics */}
      <div className="grid md:grid-cols-4 gap-5 mb-8">
        <div className="bg-white rounded-xl p-5 shadow">
          <p className="text-gray-500">Total Employees</p>
          <h2 className="text-3xl font-bold mt-2">{employees.length}</h2>
        </div>

        <div className="bg-white rounded-xl p-5 shadow">
          <p className="text-gray-500">Active</p>
          <h2 className="text-3xl font-bold text-green-600 mt-2">
            {employees.filter((e) => e.status === "Active").length}
          </h2>
        </div>

        <div className="bg-white rounded-xl p-5 shadow">
          <p className="text-gray-500">Busy</p>
          <h2 className="text-3xl font-bold text-orange-500 mt-2">
            {employees.filter((e) => e.workingStatus === "Busy").length}
          </h2>
        </div>

        <div className="bg-white rounded-xl p-5 shadow">
          <p className="text-gray-500">Available</p>
          <h2 className="text-3xl font-bold text-blue-600 mt-2">
            {employees.filter((e) => e.workingStatus === "Available").length}
          </h2>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow p-5 mb-6">
        <input
          type="text"
          placeholder="Search Employee..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border rounded-lg px-4 py-3"
        />
      </div>

      {/* Employee Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        {loading ? (
          <div className="p-10 text-center">Loading Employees...</div>
        ) : filteredEmployees.length === 0 ? (
          <div className="p-10 text-center text-gray-500">No employees found.</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-4 text-left">Employee</th>
                <th className="text-left">Department</th>
                <th className="text-left">Status</th>
                <th className="text-left">Working</th>
                <th className="text-left">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredEmployees.map((employee) => (
                <tr key={employee._id} className="border-b hover:bg-gray-50">
                  <td className="p-4">
                    <div className="font-semibold">{employee.name}</div>
                    <div className="text-sm text-gray-500">{employee.employeeId}</div>
                  </td>

                  <td>
                    {employee.department ? (
                      <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm">
                        {employee.department}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-sm">—</span>
                    )}
                  </td>

                  <td>
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        employee.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {employee.status}
                    </span>
                  </td>

                  <td>
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        employee.workingStatus === "Available"
                          ? "bg-blue-100 text-blue-700"
                          : employee.workingStatus === "Busy"
                            ? "bg-orange-100 text-orange-700"
                            : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {employee.workingStatus}
                    </span>
                  </td>

                  <td>
                    <div className="flex gap-3">
                      <button className="text-blue-600 hover:underline">Edit</button>

                      <button
                        onClick={() => toggleEmployee(employee._id)}
                        className="text-yellow-600 hover:underline"
                      >
                        Toggle
                      </button>

                      <button
                        onClick={() => deleteEmployee(employee._id)}
                        className="text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Employee Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <form onSubmit={createEmployee} className="bg-white rounded-xl p-8 w-[500px] space-y-4">
            <h2 className="text-2xl font-bold">Add Employee</h2>

            <input
              placeholder="Name"
              required
              className="border p-3 w-full rounded"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            <input
              placeholder="Email"
              type="email"
              required
              className="border p-3 w-full rounded"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />

            <input
              placeholder="Phone"
              className="border p-3 w-full rounded"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />

            <input
              placeholder="Password"
              type="password"
              required
              className="border p-3 w-full rounded"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />

            <select
              className="border p-3 w-full rounded"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              <option value="Employee">Employee</option>
              <option value="Admin">Admin</option>
            </select>

            {form.role === "Employee" && (
              <select
                className="border p-3 w-full rounded"
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
              >
                <option>Designer</option>
                <option>Printer</option>
                <option>Metalist</option>
                <option>Ceramist</option>
                <option>QC</option>
                <option>Dispatch</option>
              </select>
            )}

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-5 py-2 border rounded"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="bg-blue-600 text-white px-5 py-2 rounded disabled:opacity-50"
              >
                {submitting ? "Creating..." : "Create Employee"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
