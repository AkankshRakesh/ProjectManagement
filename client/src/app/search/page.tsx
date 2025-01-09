"use client";
import Header from '@/components/Header';
import ProjectCard from '@/components/ProjectCard';
import TaskCard from '@/components/TaskCard';
import UserCard from '@/components/UserCard';
import { useSearchQuery } from '@/state/api';
import { debounce } from 'lodash';
import { useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react'


const Search = () => {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('query') || '';
  const [searchTerm, setSearchTerm] = useState('');
  const { data: searchResults, isLoading, isError } = useSearchQuery(searchTerm, {
    skip: searchTerm.length < 3
  });

  const handleSearch = debounce((event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  }, 500);
  useEffect(() => {
    setSearchTerm(initialQuery);
  }, [initialQuery]);
  useEffect(() => {
    return handleSearch.cancel;
  })
  return (
    <div className="p-8 ">
      <Header name="Search" />
      <div>
      <input
      type="text"
      placeholder="Search..."
      className="w-full md:w-1/2 lg:w-1/3 mx-auto p-3 rounded-lg shadow-lg border focus:ring-2 focus:ring-blue-500 transition-all duration-300"
      onChange={(e) => setSearchTerm(e.target.value)}
    />
      </div>
      <div className='p-5 dark:text-white'>
        {isLoading && <p className='dark:text-white'>Loading...</p>}
        {isError && <p className='dark:text-white'>Error occurred while fetching search results.</p>} 
        {!isLoading && !isError && searchResults && (
            <div>
                {searchResults.tasks && searchResults.tasks.length > 0 && (
                    <h2 className="text-2xl font-semibold mb-3">Tasks</h2>
                )}
                {searchResults.tasks?.map((task) => (
                    <TaskCard key={task.id} task={task} />
                ))}

                {searchResults.projects && searchResults.projects?.length > 0 && (
                    <h2 className="text-2xl font-semibold mb-3">Projects</h2>
                )}
                {searchResults.projects?.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                ))}
                {searchResults.users && searchResults.users?.length > 0 && (
                    <h2 className="text-2xl font-semibold mb-3">Users</h2>
                )}
                {searchResults.users?.map((user) => (
                    <UserCard key={user.userId} user={user} />
                ))}

            </div>
        )} 
      </div>  
    </div>
  )
}

export default Search