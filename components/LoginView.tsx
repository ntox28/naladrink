import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { AuthUser } from '@supabase/supabase-js';

interface LoginViewProps {
    onLoginSuccess: () => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError(error.message || 'Email atau password salah.');
        } else if (data.user) {
            onLoginSuccess();
        }
        setLoading(false);
    };

    return (
        <div className="bg-orange-50 min-h-screen flex flex-col items-center justify-center">
            <div className="w-full max-w-sm mx-auto">
                 <img src="https://wqgbkwujfxdwlywxrjup.supabase.co/storage/v1/object/public/publik/aladrink.png" alt="Naladrink Logo" className="h-28 w-auto mx-auto mb-6" />
                <form onSubmit={handleSubmit} className="bg-white shadow-2xl rounded-2xl px-8 pt-6 pb-8 mb-4">
                    <h1 className="text-center text-2xl font-bold text-amber-900 mb-6">Login</h1>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            placeholder="user@naladrink.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="shadow border rounded-lg w-full py-3 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-amber-500"
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="shadow appearance-none border rounded-lg w-full py-3 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-amber-500"
                            required
                        />
                         {error && <p className="text-red-500 text-xs italic">{error}</p>}
                    </div>
                    <div className="flex items-center justify-between">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-amber-700 hover:bg-amber-800 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-colors disabled:bg-gray-400"
                        >
                            {loading ? 'Memproses...' : 'Masuk'}
                        </button>
                    </div>
                </form>
                 <p className="text-center text-gray-500 text-xs">
                    &copy;2024 Naladrink. All rights reserved.
                </p>
            </div>
        </div>
    );
};

export default LoginView;