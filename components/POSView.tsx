import React, { useState, useMemo, useCallback } from 'react';
import { Product, CartItem, PaymentMethod, Transaction, User, TransactionDetail } from '../types';
import { PlusIcon, MinusIcon, TrashIcon, TeaIcon } from './Icons';
import { supabase } from '../lib/supabaseClient';

interface POSViewProps {
  products: Product[];
  onTransactionComplete: (transaction: Transaction) => void;
  currentUser: User;
}

const ProductCard: React.FC<{ product: Product; onAddToCart: (product: Product) => void; }> = ({ product, onAddToCart }) => (
    <div 
        onClick={() => onAddToCart(product)}
        className="bg-white rounded-lg shadow-md flex flex-col cursor-pointer hover:shadow-xl hover:ring-2 hover:ring-amber-500 transition-all duration-200 overflow-hidden"
    >
        <div className="w-full h-32 bg-amber-100 flex items-center justify-center">
             {product.image_url ? (
                <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
             ) : (
                <TeaIcon className="w-16 h-16 text-amber-400" />
             )}
        </div>
        <div className="p-4 flex flex-col justify-between flex-grow">
            <div>
                <h3 className="font-bold text-amber-900 truncate">{product.name}</h3>
                <p className="text-sm text-gray-500">{product.size}</p>
            </div>
            <p className="text-lg font-semibold text-right text-amber-800 mt-2">
                Rp {product.price.toLocaleString('id-ID')}
            </p>
        </div>
    </div>
);

const Cart: React.FC<{
    cart: CartItem[];
    updateQuantity: (productId: string, newQuantity: number) => void;
    removeFromCart: (productId:string) => void;
    total: number;
    completeTransaction: (paymentMethod: PaymentMethod, amountReceived?: number, notes?: string) => Promise<boolean>;
}> = ({ cart, updateQuantity, removeFromCart, total, completeTransaction }) => {
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.TUNAI);
    const [amountReceived, setAmountReceived] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const change = useMemo(() => {
        if (paymentMethod !== PaymentMethod.TUNAI) return 0;
        const received = parseFloat(amountReceived);
        if (isNaN(received) || received < total) return 0;
        return received - total;
    }, [amountReceived, total, paymentMethod]);

    const handleCompleteTransaction = async () => {
        setError(null);
        setIsProcessing(true);
        let received = parseFloat(amountReceived)
        if (paymentMethod === PaymentMethod.TUNAI && (isNaN(received) || received < total)) {
            setError('Uang diterima tidak cukup.');
            setIsProcessing(false);
            return;
        }
        
        const success = await completeTransaction(paymentMethod, paymentMethod === PaymentMethod.TUNAI ? received : undefined);

        if (success) {
            setAmountReceived('');
            setPaymentMethod(PaymentMethod.TUNAI);
        }
        setIsProcessing(false);
    }

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col lg:h-full">
            <h2 className="text-2xl font-bold text-amber-900 border-b pb-4 mb-4">Keranjang</h2>
            {cart.length === 0 ? (
                <div className="flex-grow flex items-center justify-center text-gray-500">
                    <p>Pilih produk untuk memulai</p>
                </div>
            ) : (
                <div className="flex-grow overflow-y-auto pr-2 -mr-2">
                    {cart.map(item => (
                        <div key={item.productId} className="flex items-center mb-4">
                            <div className="flex-grow">
                                <p className="font-semibold text-gray-800">{item.name} <span className="text-sm font-normal text-gray-500">({item.size})</span></p>
                                <p className="text-sm text-gray-600">Rp {item.unitPrice.toLocaleString('id-ID')}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                                <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="p-1 rounded-full bg-gray-200 hover:bg-gray-300"><MinusIcon className="w-4 h-4" /></button>
                                <span className="w-8 text-center font-semibold">{item.quantity}</span>
                                <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="p-1 rounded-full bg-gray-200 hover:bg-gray-300"><PlusIcon className="w-4 h-4" /></button>
                            </div>
                            <div className="ml-4 text-right w-20 font-semibold">
                                Rp {item.subtotal.toLocaleString('id-ID')}
                            </div>
                            <button onClick={() => removeFromCart(item.productId)} className="ml-2 text-red-500 hover:text-red-700"><TrashIcon className="w-5 h-5" /></button>
                        </div>
                    ))}
                </div>
            )}
            <div className="border-t pt-4 mt-auto">
                <div className="flex justify-between text-xl font-bold mb-4">
                    <span>Total</span>
                    <span>Rp {total.toLocaleString('id-ID')}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-4">
                    {Object.values(PaymentMethod).map(method => (
                        <button 
                            key={method} 
                            onClick={() => setPaymentMethod(method)}
                            className={`p-2 rounded-md text-sm transition-colors ${paymentMethod === method ? 'bg-amber-800 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                        >
                            {method}
                        </button>
                    ))}
                </div>
                {paymentMethod === PaymentMethod.TUNAI && (
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Uang Diterima (Rp)</label>
                        <input 
                            type="number"
                            value={amountReceived}
                            onChange={(e) => setAmountReceived(e.target.value)}
                            placeholder="Contoh: 50000"
                            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                        />
                         <div className="mt-2 text-lg flex justify-between">
                            <span className="font-medium text-gray-700">Kembalian:</span>
                            <span className="font-bold text-green-600">Rp {change.toLocaleString('id-ID')}</span>
                        </div>
                    </div>
                )}
                 {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
                <button
                    disabled={cart.length === 0 || isProcessing}
                    onClick={handleCompleteTransaction}
                    className="w-full bg-amber-700 text-white font-bold py-3 rounded-lg hover:bg-amber-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-lg"
                >
                    {isProcessing ? 'Memproses...' : 'Bayar'}
                </button>
            </div>
        </div>
    );
};


// FIX: The POSView component was incomplete. It has been fully implemented, including state management, event handlers, a return statement, and a default export. This resolves all reported errors.
const POSView: React.FC<POSViewProps> = ({ products, onTransactionComplete, currentUser }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  
  const activeProducts = useMemo(() => products.filter(p => p.is_active), [products]);
  
  const handleAddToCart = useCallback((product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.productId === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.unitPrice }
            : item
        );
      } else {
        return [
          ...prevCart,
          {
            productId: product.id,
            name: product.name,
            size: product.size,
            quantity: 1,
            unitPrice: product.price,
            subtotal: product.price,
          },
        ];
      }
    });
  }, []);

  const handleUpdateQuantity = useCallback((productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCart(prevCart => prevCart.filter(item => item.productId !== productId));
    } else {
      setCart(prevCart =>
        prevCart.map(item =>
          item.productId === productId
            ? { ...item, quantity: newQuantity, subtotal: newQuantity * item.unitPrice }
            : item
        )
      );
    }
  }, []);

  const handleRemoveFromCart = useCallback((productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.productId !== productId));
  }, []);

  const total = useMemo(() => cart.reduce((sum, item) => sum + item.subtotal, 0), [cart]);

  const handleCompleteTransaction = useCallback(async (paymentMethod: PaymentMethod, amountReceived?: number): Promise<boolean> => {
    if (cart.length === 0 || !currentUser) return false;

    const transactionCode = `NALA-${Date.now()}`;
    const transactionDate = new Date().toISOString();
    
    const { data: insertedTransaction, error: transactionError } = await supabase
      .from('transactions')
      .insert({
        transaction_code: transactionCode,
        date: transactionDate,
        cashier_id: currentUser.id,
        total,
        payment_method: paymentMethod,
        amount_received: amountReceived,
        change: amountReceived ? amountReceived - total : 0,
      })
      .select()
      .single();

    if (transactionError || !insertedTransaction) {
      console.error('Error creating transaction:', transactionError);
      alert('Gagal menyimpan transaksi: ' + transactionError?.message);
      return false;
    }

    const detailsToInsert = cart.map(item => ({
      transaction_id: insertedTransaction.id,
      product_id: item.productId,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      subtotal: item.subtotal,
    }));

    const { error: detailsError } = await supabase
      .from('transaction_details')
      .insert(detailsToInsert);

    if (detailsError) {
      console.error('Error creating transaction details:', detailsError);
      alert('Gagal menyimpan detail transaksi: ' + detailsError.message);
      return false;
    }

    const fullTransaction: Transaction = {
      ...insertedTransaction,
      cashier_name: currentUser.name,
      details: detailsToInsert.map((d, i) => ({...d, id: `temp-${i}`})) // Use inserted data for consistency
    };

    onTransactionComplete(fullTransaction);
    setCart([]);
    return true;
  }, [cart, total, currentUser, onTransactionComplete]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 lg:h-full">
      <div className="lg:col-span-2 lg:h-full overflow-y-auto pr-2">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {activeProducts.map(product => (
                <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
            ))}
            {activeProducts.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center text-gray-500 h-64">
                    <TeaIcon className="w-16 h-16 mb-4"/>
                    <p>Tidak ada produk aktif yang tersedia.</p>
                </div>
            )}
        </div>
      </div>
      <div className="lg:col-span-1 lg:h-full">
        <Cart 
            cart={cart}
            updateQuantity={handleUpdateQuantity}
            removeFromCart={handleRemoveFromCart}
            total={total}
            completeTransaction={handleCompleteTransaction}
        />
      </div>
    </div>
  );
};

export default POSView;