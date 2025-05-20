'use client';

// Display the outstanding bills for a dealer in an expandable row
export default function DealerBillsRow({ bills = [] }) {
  if (!bills || bills.length === 0) {
    return (
      <tr className="bg-gray-50 dark:bg-gray-700">
        <td colSpan={5} className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 text-center">
          No outstanding bills for this dealer.
        </td>
      </tr>
    );
  }

  return (
    <tr className="bg-gray-50 dark:bg-gray-700">
      <td colSpan={5} className="px-6 py-4">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600 border border-gray-200 dark:border-gray-600 rounded-lg">
            <thead className="bg-gray-100 dark:bg-gray-600">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Bill Number
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Bill Date
                </th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {bills.map((bill, index) => (
                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                    {bill.billNumber}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(bill.billDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-right font-medium text-gray-900 dark:text-gray-100">
                    ₹{bill.billAmount.toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
              <tr className="bg-gray-50 dark:bg-gray-700">
                <td colSpan={2} className="px-4 py-2 text-right text-sm font-medium text-gray-900 dark:text-gray-100">
                  Total:
                </td>
                <td className="px-4 py-2 text-right text-sm font-bold text-gray-900 dark:text-gray-100">
                  ₹{bills.reduce((acc, bill) => acc + bill.billAmount, 0).toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </td>
    </tr>
  );
}
