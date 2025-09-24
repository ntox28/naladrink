import React, { useState, useMemo } from 'react';
import { Transaction, Product, Expense } from '../types';

interface ReportsViewProps {
  transactions: Transaction[];
  products: Product[];
  expenses: Expense[];
}

const StatCard: React.FC<{ title: string; value: string | number; }> = ({ title, value }) => (
    <div className="bg-white p-6 rounded-xl shadow-md">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <p className="mt-1 text-3xl font-semibold text-amber-900">{value}</p>
    </div>
);

const ReportsView: React.FC<ReportsViewProps> = ({ transactions, products, expenses }) => {
  const [viewMode, setViewMode] = useState<'daily' | 'monthly'>('daily');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]); // YYYY-MM-DD
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const transactionDate = new Date(t.date);
      if (viewMode === 'daily') {
        return transactionDate.toISOString().split('T')[0] === selectedDate;
      }
      if (viewMode === 'monthly') {
        return transactionDate.toISOString().slice(0, 7) === selectedMonth;
      }
      return false;
    });
  }, [transactions, viewMode, selectedDate, selectedMonth]);
  
  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => {
        const expenseDate = new Date(e.date);
        if (viewMode === 'daily') {
            return expenseDate.toISOString().split('T')[0] === selectedDate;
        }
        if (viewMode === 'monthly') {
            return expenseDate.toISOString().slice(0, 7) === selectedMonth;
        }
        return false;
    });
  }, [expenses, viewMode, selectedDate, selectedMonth]);

  const totalRevenue = useMemo(() => 
    filteredTransactions.reduce((sum, t) => sum + t.total, 0),
  [filteredTransactions]);

  const totalExpenses = useMemo(() =>
    filteredExpenses.reduce((sum, e) => sum + e.amount, 0),
  [filteredExpenses]);

  const netProfit = totalRevenue - totalExpenses;
  
  const totalTransactions = filteredTransactions.length;

  const bestSellingProducts = useMemo(() => {
    const productSales: { [key: string]: { name: string; size: string, quantity: number } } = {};
    
    filteredTransactions.forEach(t => {
        t.details.forEach(d => {
            if (!productSales[d.product_id]) {
                const productInfo = products.find(p => p.id === d.product_id);
                productSales[d.product_id] = { 
                    name: productInfo?.name || 'Unknown', 
                    size: productInfo?.size || '',
                    quantity: 0 
                };
            }
            productSales[d.product_id].quantity += d.quantity;
        });
    });

    return Object.values(productSales)
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);

  }, [filteredTransactions, products]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-amber-900">Laporan Penjualan</h1>
        <div className="flex items-center space-x-2 bg-white p-1 rounded-lg shadow-sm">
           <button onClick={() => setViewMode('daily')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'daily' ? 'bg-amber-700 text-white' : 'text-gray-600 hover:bg-amber-100'}`}>Harian</button>
           <button onClick={() => setViewMode('monthly')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'monthly' ? 'bg-amber-700 text-white' : 'text-gray-600 hover:bg-amber-100'}`}>Bulanan</button>
        </div>
      </div>
      
      <div className="mb-6 max-w-xs">
      {viewMode === 'daily' ? (
          <input 
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg shadow-sm"
          />
      ) : (
          <input 
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg shadow-sm"
          />
      )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <StatCard title="Total Omzet" value={`Rp ${totalRevenue.toLocaleString('id-ID')}`} />
        <StatCard title="Total Pengeluaran" value={`Rp ${totalExpenses.toLocaleString('id-ID')}`} />
        <StatCard title="Laba Bersih" value={`Rp ${netProfit.toLocaleString('id-ID')}`} />
        <StatCard title="Jumlah Transaksi" value={totalTransactions} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-bold text-amber-900 mb-4">Produk Terlaris</h2>
            {bestSellingProducts.length > 0 ? (
                <ul className="space-y-3">
                    {bestSellingProducts.map((item, index) => (
                        <li key={index} className="flex justify-between items-center p-2 rounded-md even:bg-amber-50">
                            <span className="font-medium text-gray-700">{item.name} ({item.size})</span>
                            <span className="font-bold text-amber-800">{item.quantity} pcs</span>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-gray-500">Tidak ada data penjualan untuk periode ini.</p>
            )}
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-bold text-amber-900 mb-4">Daftar Transaksi</h2>
            <div className="overflow-y-auto h-64">
                {filteredTransactions.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                    {filteredTransactions.map(t => (
                        <li key={t.id} className="py-3">
                            <div className="flex justify-between">
                                <span className="font-medium text-gray-800">{t.transaction_code}</span>
                                <span className="font-semibold text-gray-800">Rp {t.total.toLocaleString('id-ID')}</span>
                            </div>
                            <span className="text-sm text-gray-500">{new Date(t.date).toLocaleString('id-ID')}</span>
                        </li>
                    ))}
                </ul>
                ) : (
                    <p className="text-gray-500">Tidak ada transaksi untuk periode ini.</p>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsView;