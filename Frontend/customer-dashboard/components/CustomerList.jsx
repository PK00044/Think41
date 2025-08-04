import React, { useState, useEffect } from 'react';

function CustomerList() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Fetch all customers first
    fetch("http://localhost:3001/customers")
      .then((response) => {
        if (!response.ok) throw new Error("Failed to fetch customers");
        return response.json();
      })
      .then((data) => {
        console.log("API Data:", data);  // Log API data to inspect
        const customersArray = Array.isArray(data) ? data : data.customers || [];

        // Fetch order count for each customer and update the list
        const fetchCustomersWithOrderCount = customersArray.map(customer =>
          fetch(`http://localhost:3001/customers/${customer.id}`)
            .then(response => response.json())
            .then(customerDetails => ({
              ...customer,
              name: `${customer.first_name} ${customer.last_name}`,
              order_count: customerDetails.orderCount || 0,  // Get orderCount from the response
            }))
        );

        // Wait for all fetches to complete
        Promise.all(fetchCustomersWithOrderCount)
          .then(updatedCustomers => {
            setCustomers(updatedCustomers);
            setLoading(false);
          })
          .catch(err => {
            setError(err.message);
            setLoading(false);
          });
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Handle search filtering
  const filteredCustomers = customers.filter(customer => {
    const searchText = searchQuery.toLowerCase();
    return (
      (customer.name?.toLowerCase() || "").includes(searchText) ||
      (customer.email?.toLowerCase() || "").includes(searchText)
    );
  });

  return (
    <div className="container mx-auto p-4">
      <div className="mb-4">
        <input
          type="text"
          className="p-2 border rounded"
          placeholder="Search by name or email"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <div>
          <table className="min-w-full table-auto">
            <thead>
              <tr>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Order Count</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map(customer => (
                <tr key={customer.id}>
                  <td className="px-4 py-2">{customer.name || "N/A"}</td>
                  <td className="px-4 py-2">{customer.email || "N/A"}</td>
                  <td className="px-4 py-2">{customer.order_count || "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default CustomerList;
