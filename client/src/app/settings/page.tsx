"use client";
import Header from '@/components/Header';
import React, { useEffect, useState } from 'react';
import { signOut } from 'firebase/auth';
import auth from '@/app/firebaseConfig';
import { useGetUserQuery } from '@/state/api'; // Import the API hook

const Settings = () => {
  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const [userSettings, setUserSettings] = useState({
    username: '',
    email: '',
    teamName: 'Quantum Innovations',
    roleName: 'Developer',
    profilePictureUrl: '', // Add field for profile picture URL
  });

  const [uid, setUid] = useState<string | null>(null);

  // Fetch Firebase user's UID on mount
  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUid(currentUser.uid);
      setUserSettings((prev) => ({
        ...prev,
        email: currentUser.email || '',
      }));
    }
  }, []);

  // Fetch user details from API
  const { data: userData, isLoading, error } = useGetUserQuery(uid || '', {
    skip: !uid, // Skip query if UID is not set
  });

  useEffect(() => {
    if (userData) {
      setUserSettings((prev) => ({
        ...prev,
        username: userData.username,
        profilePictureUrl: userData.profilePictureUrl || 'userDefault.jpg', // Set the profile picture URL or default
      }));
    }
  }, [userData]);

  const labelStyles = "block text-sm font-medium dark:text-white mt-5";
  const textStyles =
    "mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 dark:text-white";

  return (
    <div className="p-8">
      <Header name="Settings" />
      {isLoading ? (
        <p className={labelStyles}>Loading...</p>
      ) : error ? (
        <p className={labelStyles}>Error fetching user data.</p>
      ) : (
        <>
          {/* Profile Picture Section */}
          <div>
            <label className={labelStyles}>Profile Picture</label>
            <div className="mt-2">
              <img
                src={userSettings?.profilePictureUrl && userSettings.profilePictureUrl.startsWith('http') 
                  ? userSettings.profilePictureUrl 
                  : `/${userSettings?.profilePictureUrl}`}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover"
              />
            </div>
          </div>
          <div>
            <label className={labelStyles}>Username</label>
            <div className={textStyles}>{userSettings.username || 'N/A'}</div>
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
        </>
      )}
      <button
        className="md:hidden rounded bg-blue-400 mt-5 px-4 py-2 text-xs font-bold text-white hover:bg-blue-500"
        onClick={handleSignOut}
      >
        Sign out
      </button>
    </div>
  );
};

export default Settings;
