import React, { useEffect, useState } from 'react'
import {Menu, Moon, Search, Settings, Sun} from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/app/redux";
import { setIsDarkMode, setIsSidebarCollapsed } from "@/state";
import { onAuthStateChanged, signOut } from 'firebase/auth';
import auth from '@/app/firebaseConfig';
import Link from "next/link"
import { useGetUserQuery } from "@/state/api";
import Image from 'next/image';
const UserDetails = ({ userId }: { userId: string }) => {
  const { data: user, isLoading, error } = useGetUserQuery(userId);

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error fetching user details</p>;
  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };
  return (
    <div className="items-center justify-between flex">
        <Link
          href="/settings">
          <div className="align-center flex h-9 w-9 justify-center mx-2 md:mx-0">
              <Image
                src={`/${user?.profilePictureUrl}`}
                alt={user?.username || "User Profile Picture"}
                width={100}
                height={50}
                className="h-full rounded-full object-cover"
              />
          </div>
          </Link>
          <span className="hidden md:block mx-3 text-gray-800 dark:text-white ">
            {user?.username}
          </span>
          <button
            className="rounded bg-blue-400 px-4 py-2 text-xs font-bold text-white hover:bg-blue-500"
            onClick={handleSignOut}
          >
            Sign out
          </button>
    </div>
  );
};
const Navbar = () => {
  const dispatch = useAppDispatch();
  const isSidebarCollapsed = useAppSelector(
    (state) => state.global.isSidebarCollapsed,
  );
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user); // Dynamically update the current user
    });

    return () => unsubscribe(); // Clean up the listener
  }, []);

  if (!currentUser) {
    return <p>Loading...</p>; // Render a placeholder while loading
  }
  return (
    <div className='flex items-center justify-between bg-white px-4 py-3 dark:bg-black dark:px-4 dark:py-3'>
      <div className='flex items-center gap-8'>
      {!isSidebarCollapsed ? null : (
          <button
            onClick={() => dispatch(setIsSidebarCollapsed(!isSidebarCollapsed))}
          >
            <Menu className="h-8 w-8 dark:text-white" />
          </button>
        )}
        <div className='relative flex h-min w-[200px]'>
        <Search className="absolute left-[4px] top-1/2 mr-2 h-5 w-5 -translate-y-1/2 transform cursor-pointer dark:text-white" />
        <input
            className="w-full rounded border-none bg-gray-100 p-2 pl-8 placeholder-gray-500 focus:border-transparent focus:outline-none dark:bg-gray-700 dark:text-white dark:placeholder-white"
            type="search"
            placeholder="Search..."
          />
        </div>
      </div>
      <div className="flex items-center">
      <button
          onClick={() => dispatch(setIsDarkMode(!isDarkMode))}
          className={
            isDarkMode
              ? `rounded p-2 dark:hover:bg-gray-700`
              : `rounded p-2 hover:bg-gray-100`
          }
        >
          {isDarkMode ? (
            <Sun className="h-6 w-6 cursor-pointer dark:text-white" />
          ) : (
            <Moon className="h-6 w-6 cursor-pointer dark:text-white" />
          )}
        </button>
        <Link
          href="/settings"
          className={
            isDarkMode
              ? `h-min w-min rounded md:p-2 dark:hover:bg-gray-700`
              : `h-min w-min rounded md:p-2 hover:bg-gray-100`
          }
        >
          <Settings className="hidden md:block h-6 w-6 cursor-pointer dark:text-white" />
        </Link>
        <div className="ml-2 mr-5 hidden min-h-[2em] w-[0.1rem] bg-gray-200 md:inline-block"></div>
        <UserDetails userId={currentUser.uid} />
        {/* <p>{currentUser?.uid}</p> */}
      </div>
    </div>
  )
}

export default Navbar