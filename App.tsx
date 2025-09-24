import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Product, Transaction, View, Expense, User, UserRole, TransactionDetail } from './types';
import POSView from './components/POSView';
import ProductManagementView from './components/ProductManagementView';
import ExpensesView from './components/ExpensesView';
import ReportsView from './components/ReportsView';
import SettingsView from './components/SettingsView';
import DataManagementView from './components/DataManagementView';
import LoginView from './components/LoginView';
import ReceiptModal from './components/ReceiptModal';
import Footer from './components/Footer';
import { TeaIcon, PackageIcon, ChartBarIcon, ReceiptRefundIcon, CogIcon, MenuIcon, ArchiveBoxIcon } from './components/Icons';
import { supabase } from './lib/supabaseClient';
import { AuthUser } from '@supabase/supabase-js';


interface HeaderProps {
    currentView: View;
    setView: (view: View) => void;
    currentUser: User;
}

const Header: React.FC<HeaderProps> = ({ currentView, setView, currentUser }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    
    const allNavItems = [
        { view: View.POS, label: 'Kasir', icon: <TeaIcon />, roles: [UserRole.ADMIN, UserRole.KASIR] },
        { view: View.EXPENSES, label: 'Pengeluaran', icon: <ReceiptRefundIcon />, roles: [UserRole.ADMIN, UserRole.KASIR] },
        { view: View.PRODUCTS, label: 'Produk', icon: <PackageIcon />, roles: [UserRole.ADMIN] },
        { view: View.REPORTS, label: 'Laporan', icon: <ChartBarIcon />, roles: [UserRole.ADMIN] },
        { view: View.DATA_MANAGEMENT, label: 'Manajemen Data', icon: <ArchiveBoxIcon />, roles: [UserRole.ADMIN] },
        { view: View.SETTINGS, label: 'Pengaturan', icon: <CogIcon />, roles: [UserRole.ADMIN] },
    ];

    const navItems = useMemo(() => {
        if (!currentUser) return [];
        return allNavItems.filter(item => item.roles.includes(currentUser.role));
    }, [currentUser]);

    const currentNavItem = useMemo(() => navItems.find(item => item.view === currentView), [navItems, currentView]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);
    
    return (
        <header className="bg-amber-800 text-white shadow-lg flex justify-between items-center px-6 h-20">
            <div className="flex items-center space-x-4">
                <img src="https://wqgbkwujfxdwlywxrjup.supabase.co/storage/v1/object/public/publik/aladrink.png" alt="Naladrink Logo" className="h-12 w-auto" />
                <h1 className="text-2xl font-bold">Naladrink</h1>
            </div>
            
            {currentUser && <div className="relative" ref={dropdownRef}>
                <button 
                    onClick={() => setIsDropdownOpen(prev => !prev)}
                    className="flex items-center space-x-2 px-4 py-2 rounded-full transition-colors duration-200 bg-amber-900/50 hover:bg-amber-700/60"
                >
                    <span className="font-semibold">{currentNavItem?.label}</span>
                    <MenuIcon className="w-5 h-5" />
                </button>
                
                {isDropdownOpen && (
                     <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                        <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                            {navItems.map(item => (
                                <button
                                    key={item.view}
                                    onClick={() => {
                                        setView(item.view);
                                        setIsDropdownOpen(false);
                                    }}
                                    className={`flex items-center w-full text-left px-4 py-2 text-sm transition-colors ${currentView === item.view ? 'bg-amber-100 text-amber-900' : 'text-gray-700 hover:bg-gray-100'}`}
                                    role="menuitem"
                                >
                                    {React.cloneElement(item.icon, { className: 'w-5 h-5 mr-3' })}
                                    <span>{item.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>}
        </header>
    );
};

const LoadingOverlay: React.FC = () => (
    <div className="fixed inset-0 bg-white bg-opacity-80 flex flex-col justify-center items-center z-[999]">
         <img src="https://wqgbkwujfxdwlywxrjup.supabase.co/storage/v1/object/public/publik/aladrink.png" alt="Naladrink Logo" className="h-20 w-auto animate-pulse" />
        <p className="text-amber-800 font-semibold mt-4">Memuat data...</p>
    </div>
);


const App: React.FC = () => {
  const [view, setView] = useState<View>(View.POS);
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [latestTransaction, setLatestTransaction] = useState<Transaction | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Main effect for application initialization and auth state management
  useEffect(() => {
    const initializeApp = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
            try {
                const { data: userProfile, error: profileError } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();

                if (profileError || !userProfile) throw profileError || new Error("User profile not found.");
                
                setCurrentUser(userProfile as User);

                const [usersRes, productsRes, transactionsRes, expensesRes] = await Promise.all([
                    supabase.from('users').select('*').order('name', { ascending: true }),
                    supabase.from('products').select('*').order('name', { ascending: true }),
                    supabase.from('transactions').select('*, transaction_details(*)').order('date', { ascending: false }),
                    supabase.from('expenses').select('*').order('date', { ascending: false }),
                ]);

                if (usersRes.error) throw usersRes.error;
                if (productsRes.error) throw productsRes.error;
                if (transactionsRes.error) throw transactionsRes.error;
                if (expensesRes.error) throw expensesRes.error;
                
                const fetchedUsers = usersRes.data as User[];
                setUsers(fetchedUsers);
                setProducts(productsRes.data as Product[]);
                setExpenses(expensesRes.data as Expense[]);
                
                const populatedTransactions = transactionsRes.data.map(t => {
                    const cashier = fetchedUsers.find(u => u.id === t.cashier_id);
                    return { ...t, details: t.transaction_details as TransactionDetail[], cashier_name: cashier?.name || 'Unknown' };
                });
                setTransactions(populatedTransactions as Transaction[]);

            } catch (error) {
                console.error("Initialization error:", error);
                await supabase.auth.signOut();
                setCurrentUser(null);
                alert("Gagal memuat data. Silakan coba login kembali.");
            }
        }
        setLoading(false);
    };

    initializeApp();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
        // If the session is gone, the user logged out. Clear all state.
        if (!session?.user) {
            setCurrentUser(null);
            setProducts([]);
            setTransactions([]);
            setExpenses([]);
            setUsers([]);
        }
    });

    return () => {
        authListener.subscription.unsubscribe();
    };
  }, []);

  // Effect for setting up real-time listeners after initial data is ready.
  useEffect(() => {
      if (!currentUser || users.length === 0) {
        return;
      }
      
      const productsChannel = supabase.channel('products-realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, payload => {
            if (payload.eventType === 'INSERT') {
                setProducts(prev => [...prev, payload.new as Product].sort((a,b) => a.name.localeCompare(b.name)));
            }
            if (payload.eventType === 'UPDATE') {
                setProducts(prev => prev.map(p => p.id === payload.new.id ? payload.new as Product : p));
            }
            if (payload.eventType === 'DELETE') {
                setProducts(prev => prev.filter(p => p.id !== (payload.old as Product).id));
            }
        }).subscribe();

      const expensesChannel = supabase.channel('expenses-realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'expenses' }, payload => {
            if (payload.eventType === 'INSERT') {
                setExpenses(prev => [payload.new as Expense, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
            }
            if (payload.eventType === 'UPDATE') {
                setExpenses(prev => prev.map(e => e.id === payload.new.id ? payload.new as Expense : e));
            }
            if (payload.eventType === 'DELETE') {
                setExpenses(prev => prev.filter(e => e.id !== (payload.old as Expense).id));
            }
        }).subscribe();
        
      const transactionsChannel = supabase.channel('transactions-realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, async (payload) => {
            // Transaction updates are less frequent and can rely on real-time fetches
            // to ensure full relational data (cashier name) is present.
            if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
                const { data: changedTransaction, error } = await supabase
                    .from('transactions').select('*, transaction_details(*)').eq('id', payload.new.id).single();
                if (error || !changedTransaction) return console.error('Gagal mengambil transaksi baru/terupdate:', error);
                
                const cashier = users.find(u => u.id === changedTransaction.cashier_id);
                const populatedTransaction = { ...changedTransaction, details: changedTransaction.transaction_details as TransactionDetail[], cashier_name: cashier?.name || 'Unknown' };

                if (payload.eventType === 'INSERT') {
                    setTransactions(prev => [populatedTransaction as Transaction, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
                } else {
                    setTransactions(prev => prev.map(t => t.id === payload.new.id ? populatedTransaction as Transaction : t));
                }
            }
            if (payload.eventType === 'DELETE') {
                setTransactions(prev => prev.filter(t => t.id !== (payload.old as Transaction).id));
            }
        }).subscribe();

      return () => {
          supabase.removeChannel(productsChannel);
          supabase.removeChannel(expensesChannel);
          supabase.removeChannel(transactionsChannel);
      };
  }, [currentUser, users]);

  const handleTransactionComplete = (transaction: Transaction) => {
    const completedTransaction = { ...transaction, cashier_name: currentUser?.name || 'Unknown' };
    setLatestTransaction(completedTransaction);
  };

  const handleSaveProduct = async (productData: Product | Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> => {
      try {
        if ('id' in productData && productData.id) { // Update
            const { id, ...updateData } = productData;
            const { data, error } = await supabase.from('products').update(updateData).eq('id', id).select().single();
            if (error || !data) throw error;
            // No need for local state update, real-time will handle it
        } else { // Create
            const { data, error } = await supabase.from('products').insert(productData).select().single();
            if (error || !data) throw error;
            // No need for local state update, real-time will handle it
        }
        return true;
      } catch(error: any) {
        alert('Gagal menyimpan produk: ' + error.message);
        return false;
      }
  };
  
  const handleDeleteProduct = async (productId: string): Promise<boolean> => {
      const { error } = await supabase.from('products').delete().eq('id', productId);
      if (error) {
          alert('Gagal menghapus produk: ' + error.message);
          return false;
      }
      // No need for local state update, real-time will handle it
      return true;
  };
  
  const handleDeleteTransaction = async (transactionId: string): Promise<boolean> => {
    const { error } = await supabase.from('transactions').delete().eq('id', transactionId);
    if (error) {
        alert('Gagal menghapus transaksi: ' + error.message);
        return false;
    }
    // Real-time listener will remove it from the UI.
    return true;
  };

  const handleSaveExpense = async (expenseData: Expense | Omit<Expense, 'id' | 'created_at'>): Promise<boolean> => {
      try {
        if ('id' in expenseData && expenseData.id) { // Update
            const { id, ...updateData } = expenseData;
            const { data, error } = await supabase.from('expenses').update({ description: updateData.description, amount: updateData.amount, category: updateData.category }).eq('id', id).select().single();
            if (error || !data) throw error;
            // No need for local state update, real-time will handle it
        } else { // Create
            const { data, error } = await supabase.from('expenses').insert(expenseData).select().single();
            if (error || !data) throw error;
            // No need for local state update, real-time will handle it
        }
        return true;
      } catch (error: any) {
        alert('Gagal menyimpan pengeluaran: ' + error.message);
        return false;
      }
  };

  const handleDeleteExpense = async (expenseId: string): Promise<boolean> => {
    const { error } = await supabase.from('expenses').delete().eq('id', expenseId);
    if (error) {
        alert('Gagal menghapus pengeluaran: ' + error.message);
        return false;
    }
    // No need for local state update, real-time will handle it
    return true;
  };

  if (loading) {
      return <LoadingOverlay />;
  }

  if (!currentUser) {
    return <LoginView onLoginSuccess={() => {
        setLoading(true); // Show loading screen while we re-initialize
        window.location.reload(); // Easiest way to trigger a full, clean re-initialization
    }} />;
  }

  const renderView = () => {
    switch (view) {
      case View.POS:
        return <POSView products={products} onTransactionComplete={handleTransactionComplete} currentUser={currentUser}/>;
      case View.EXPENSES:
        return <ExpensesView 
            expenses={expenses} 
            onSaveExpense={handleSaveExpense}
            onDeleteExpense={handleDeleteExpense}
        />;
      case View.PRODUCTS:
        return currentUser.role === UserRole.ADMIN ? <ProductManagementView 
            products={products} 
            onSaveProduct={handleSaveProduct}
            onDeleteProduct={handleDeleteProduct}
        /> : null;
      case View.REPORTS:
        return currentUser.role === UserRole.ADMIN ? <ReportsView transactions={transactions} products={products} expenses={expenses} /> : null;
      case View.DATA_MANAGEMENT:
        return currentUser.role === UserRole.ADMIN ? <DataManagementView 
            transactions={transactions} 
            products={products}
            onDeleteTransaction={handleDeleteTransaction}
            onDeleteProduct={handleDeleteProduct}
        /> : null;
      case View.SETTINGS:
          return currentUser.role === UserRole.ADMIN ? <SettingsView users={users} /> : null;
      default:
        return <POSView products={products} onTransactionComplete={handleTransactionComplete} currentUser={currentUser} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header currentView={view} setView={setView} currentUser={currentUser} />
      <main className="flex-grow">
        {renderView()}
      </main>
      <Footer currentUser={currentUser} onLogout={() => supabase.auth.signOut()} />
      <ReceiptModal 
        transaction={latestTransaction}
        products={products}
        onClose={() => setLatestTransaction(null)}
      />
    </div>
  );
};

export default App;