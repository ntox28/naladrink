import React from 'react';
import { User } from '../types';
import { LogoutIcon } from './Icons';

interface FooterProps {
    currentUser: User;
    onLogout: () => void;
}

const Footer: React.FC<FooterProps> = ({ currentUser, onLogout }) => {
  return (
    <footer className="bg-amber-900 text-white flex justify-between items-center p-4">
      <p className="text-sm">
        &copy; {new Date().getFullYear()} Naladrink. All Rights Reserved. Powered by Nalamedia.
      </p>
      <div className="flex items-center space-x-4">
        <span className="font-medium">Hi, {currentUser.name}</span>
        <button onClick={onLogout} title="Logout" className="p-2 rounded-full hover:bg-amber-700/60 transition-colors">
            <LogoutIcon className="w-6 h-6" />
        </button>
      </div>
    </footer>
  );
};

export default Footer;