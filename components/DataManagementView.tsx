import React from 'react';
import { Transaction, Product } from '../types';
import { TrashIcon } from './Icons';

interface DataManagementViewProps {
  transactions: Transaction[];
  products: Product[];
  onDeleteTransaction: (transactionId: string) => Promise<boolean>;
  onDeleteProduct: (productId: string) => Promise<boolean>;
}

const DataManagementView: React.FC<DataManagementViewProps> = ({ transactions, products, onDeleteTransaction, onDeleteProduct }) => {
  
  const handleDeleteTransaction = (transaction: Transaction) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus transaksi ${transaction.transaction_code}? Tindakan ini tidak dapat diurungkan.`)) {
      onDeleteTransaction(transaction.id);
    }
  };

  const handleDeleteProduct = (product: Product) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus produk ${product.name} (${product.size})? Tindakan ini tidak dapat diurungkan.`)) {
      onDeleteProduct(product.id);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-amber-900 mb-4">Manajemen Data</h1>
      
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-8 rounded-md" role="alert">
        <p className="font-bold">Perhatian!</p>
        <p>Tindakan di halaman ini bersifat permanen dan tidak dapat diurungkan. Hati-hati saat menghapus data.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Transaction Deletion Section */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-bold text-amber-900 mb-4">Hapus Transaksi</h2>
          <div className="overflow-y-auto h-[calc(100vh-350px)] pr-2">
            {transactions.length > 0 ? (
              <ul className="space-y-3">
                {transactions.map(t => (
                  <li key={t.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div>
                      <p className="font-semibold text-gray-800">{t.transaction_code}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(t.date).toLocaleString('id-ID')} - Rp {t.total.toLocaleString('id-ID')}
                      </p>
                    </div>
                    <button 
                      onClick={() => handleDeleteTransaction(t)}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full transition-colors"
                      aria-label={`Hapus transaksi ${t.transaction_code}`}
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-center mt-8">Tidak ada data transaksi.</p>
            )}
          </div>
        </div>

        {/* Product Deletion Section */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-bold text-amber-900 mb-4">Hapus Produk</h2>
           <div className="overflow-y-auto h-[calc(100vh-350px)] pr-2">
            {products.length > 0 ? (
              <ul className="space-y-3">
                {products.map(p => (
                  <li key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div>
                      <p className="font-semibold text-gray-800">{p.name} <span className="text-sm font-normal text-gray-600">({p.size})</span></p>
                      <p className="text-sm text-gray-500">
                        Rp {p.price.toLocaleString('id-ID')}
                      </p>
                    </div>
                    <button 
                      onClick={() => handleDeleteProduct(p)}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full transition-colors"
                      aria-label={`Hapus produk ${p.name}`}
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-center mt-8">Tidak ada data produk.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataManagementView;