import React from 'react';
import { User, UserRole } from '../types';
import { PlusIcon, EditIcon, TrashIcon } from './Icons';

interface SettingsViewProps {
  users: User[];
}

const SettingsView: React.FC<SettingsViewProps> = ({ users }) => {

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-amber-900">Manajemen Pengguna</h1>
         {/* 
            NOTE: User management (create, update, delete) requires server-side admin privileges 
            for security and should be handled via Supabase Edge Functions or a secure backend.
            Client-side buttons are disabled to prevent exposing sensitive operations.
        */}
        <button disabled className="flex items-center space-x-2 bg-gray-400 text-white px-4 py-2 rounded-lg shadow-md cursor-not-allowed">
          <PlusIcon className="w-5 h-5" />
          <span>Tambah Pengguna</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-100">
            <tr>
              <th scope="col" className="px-6 py-3">Nama Pengguna</th>
              <th scope="col" className="px-6 py-3">Peran</th>
              <th scope="col" className="px-6 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} className="bg-white border-b hover:bg-gray-50">
                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                  {user.name}
                </th>
                <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.role === UserRole.ADMIN ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                        {user.role}
                    </span>
                </td>
                <td className="px-6 py-4 text-right text-gray-400">
                    <span className="inline-block mr-4" title="Edit dinonaktifkan"><EditIcon className="w-5 h-5" /></span>
                    <span className="inline-block" title="Hapus dinonaktifkan"><TrashIcon className="w-5 h-5" /></span>
                </td>
              </tr>
            ))}
             {users.length === 0 && (
                <tr>
                    <td colSpan={3} className="text-center py-8 text-gray-500">Belum ada pengguna terdaftar.</td>
                </tr>
             )}
          </tbody>
        </table>
        <div className="p-4 bg-gray-50 border-t text-sm text-gray-600">
            <strong>Info:</strong> Manajemen pengguna dilakukan melalui dashboard Supabase untuk keamanan.
        </div>
      </div>
      
    </div>
  );
};

export default SettingsView;
