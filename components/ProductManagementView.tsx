import React, { useState, useEffect } from 'react';
import { Product, ProductSize } from '../types';
import { PlusIcon, EditIcon, TrashIcon, CloseIcon, TeaIcon } from './Icons';

type ProductFormData = Omit<Product, 'id' | 'created_at' | 'updated_at'>;

const emptyProduct: ProductFormData = {
    name: '',
    size: ProductSize.REGULER,
    price: 0,
    is_active: true,
    image_url: '',
};

interface ProductFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (product: Product | ProductFormData) => Promise<void>;
    productToEdit: Product | null;
}

const ProductFormModal: React.FC<ProductFormModalProps> = ({ isOpen, onClose, onSave, productToEdit }) => {
    const [product, setProduct] = useState<Product | ProductFormData>(emptyProduct);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (productToEdit) {
            setProduct(productToEdit);
        } else {
            setProduct(emptyProduct);
        }
    }, [productToEdit, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const { checked } = e.target as HTMLInputElement;
            setProduct(prev => ({ ...prev, [name]: checked }));
        } else {
            setProduct(prev => ({ ...prev, [name]: name === 'price' ? parseFloat(value) : value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        await onSave(product);
        setIsSaving(false);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 m-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-amber-900">{productToEdit ? 'Edit Produk' : 'Tambah Produk'}</h2>
                    <button onClick={onClose}><CloseIcon className="w-6 h-6 text-gray-500 hover:text-gray-800" /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Nama Produk</label>
                        <input type="text" name="name" value={product.name} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500" required />
                    </div>
                     <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">URL Gambar</label>
                        <input type="url" name="image_url" value={product.image_url || ''} onChange={handleChange} placeholder="https://..." className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500" />
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Ukuran</label>
                            <select name="size" value={product.size} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500">
                                {Object.values(ProductSize).map(size => (
                                    <option key={size} value={size}>{size}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Harga (Rp)</label>
                            <input type="number" name="price" value={product.price} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500" required min="0" />
                        </div>
                    </div>
                    <div className="mb-6">
                        <label className="flex items-center">
                            <input type="checkbox" name="is_active" checked={'is_active' in product ? product.is_active : true} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500" />
                            <span className="ml-2 text-sm text-gray-700">Produk Aktif</span>
                        </label>
                    </div>
                    <div className="flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Batal</button>
                        <button type="submit" disabled={isSaving} className="px-4 py-2 bg-amber-700 text-white rounded-md hover:bg-amber-800 disabled:bg-gray-400">
                            {isSaving ? 'Menyimpan...' : 'Simpan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

interface ProductManagementViewProps {
  products: Product[];
  onSaveProduct: (productData: Product | ProductFormData) => Promise<boolean>;
  onDeleteProduct: (productId: string) => Promise<boolean>;
}

const ProductManagementView: React.FC<ProductManagementViewProps> = ({ products, onSaveProduct, onDeleteProduct }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  const handleOpenModal = (product: Product | null = null) => {
    setProductToEdit(product);
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setProductToEdit(null);
  };

  const handleSaveProduct = async (productData: Product | ProductFormData) => {
    const success = await onSaveProduct(productData);
    if (success) {
      handleCloseModal();
    }
  };
  
  const handleDeleteProduct = async (productId: string) => {
    if(window.confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
        await onDeleteProduct(productId);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-amber-900">Manajemen Produk</h1>
        <button onClick={() => handleOpenModal()} className="flex items-center space-x-2 bg-amber-700 text-white px-4 py-2 rounded-lg shadow-md hover:bg-amber-800 transition-colors">
          <PlusIcon className="w-5 h-5" />
          <span>Tambah Produk</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-100">
            <tr>
              <th scope="col" className="px-6 py-3">Gambar</th>
              <th scope="col" className="px-6 py-3">Nama Produk</th>
              <th scope="col" className="px-6 py-3">Ukuran</th>
              <th scope="col" className="px-6 py-3">Harga</th>
              <th scope="col" className="px-6 py-3">Status</th>
              <th scope="col" className="px-6 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id} className="bg-white border-b hover:bg-gray-50">
                <td className="px-6 py-4">
                    {product.image_url ? (
                        <img src={product.image_url} alt={product.name} className="w-12 h-12 object-cover rounded-md shadow" />
                    ) : (
                        <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center"><TeaIcon className="w-6 h-6 text-gray-400"/></div>
                    )}
                </td>
                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                  {product.name}
                </th>
                <td className="px-6 py-4">{product.size}</td>
                <td className="px-6 py-4">Rp {product.price.toLocaleString('id-ID')}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${product.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {product.is_active ? 'Aktif' : 'Nonaktif'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                    <button onClick={() => handleOpenModal(product)} className="text-blue-600 hover:text-blue-800 mr-4"><EditIcon className="w-5 h-5" /></button>
                    <button onClick={() => handleDeleteProduct(product.id)} className="text-red-600 hover:text-red-800"><TrashIcon className="w-5 h-5" /></button>
                </td>
              </tr>
            ))}
             {products.length === 0 && (
                <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-500">Belum ada produk.</td>
                </tr>
             )}
          </tbody>
        </table>
      </div>
      
      <ProductFormModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveProduct}
        productToEdit={productToEdit}
      />
    </div>
  );
};

export default ProductManagementView;
