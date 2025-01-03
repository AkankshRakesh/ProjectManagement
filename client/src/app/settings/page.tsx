"use client";
import Header from '@/components/Header';
import React from 'react'
import { signOut } from 'firebase/auth';
import auth from '@/app/firebaseConfig';

const Settings = () => {
    const handleSignOut = async () => {
        try {
          await signOut(auth);
        } catch (error) {
          console.error("Error signing out: ", error);
        }
      };
    const userSettings = {
      username: "Akanksh Rakesh",
      email: "akankshrakesh@gmail.com",
      teamName: "Development Team",
      roleName: "Developer",
    };
    const labelStyles = "block text-sm font-medium dark:text-white mt-5";
    const textStyles =
    "mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 dark:text-white";
    return (
        <div className='p-8'>
            <Header name = "Settings" />
            <div>
                <label className={labelStyles}>Username</label>
                <div className={textStyles}>{userSettings.username}</div>
            </div>
            <div>
                <label className={labelStyles}>Email</label>
                <div className={textStyles}>{userSettings.email}</div>
            </div>
            <div>
                <label className={labelStyles}>Team</label>
                <div className={textStyles}>{userSettings.teamName}</div>
            </div>
            <div>
                <label className={labelStyles}>Role</label>
                <div className={textStyles}>{userSettings.roleName}</div>
            </div>
            <button
            className="md:hidden rounded bg-blue-400 mt-5 px-4 py-2 text-xs font-bold text-white hover:bg-blue-500" 
            onClick={handleSignOut}
          >
            Sign out
          </button>
        </div>
    )
}

export default Settings