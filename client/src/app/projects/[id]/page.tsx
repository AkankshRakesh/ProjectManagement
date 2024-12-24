"use client";
import React, { useState } from 'react'
import ProjectHeader from "@/app/projects/ProjectHeader";
type Props = {
    params: {id : string};
}

const page = ({params}: Props) => {
  const { id } = params;
  const [activeTab, setActiveTab] = useState('Board');
  const [isModalNewTaskOpen, setIsModalNewTaskOpen] = useState(false);
  return (
    <div>
        <ProjectHeader activeTab={activeTab} setActiveTab={setActiveTab} />
        {/* { activeTab === 'Board' && <Board projectId={id} /> } */}
    </div>
  )
}

export default page