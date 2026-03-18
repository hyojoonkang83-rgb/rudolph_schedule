import React, { useState } from 'react';
import { getProjects, saveProject, deleteProject } from './utils/storage';
import Dashboard from './components/Dashboard';
import ProjectScheduler from './components/scheduler/ProjectScheduler';
import { AnimatePresence, motion } from 'framer-motion';
import { Project } from './types/project';

const App: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>(() => getProjects());
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const handleAddProject = (newProject: { clientName: string; projectName: string }) => {
    const updatedProjects = saveProject(newProject);
    setProjects(updatedProjects);
  };

  const handleUpdateProject = (updatedProject: Project) => {
    const updatedProjects = saveProject(updatedProject);
    setProjects(updatedProjects);
    setSelectedProject(updatedProject);
  };

  const handleDeleteProject = (id: string) => {
    const updatedProjects = deleteProject(id);
    setProjects(updatedProjects);
    if (selectedProject?.id === id) {
      setSelectedProject(null);
    }
  };

  return (
    <div className="App font-sans selection:bg-primary/20">
      <AnimatePresence mode="wait">
        {!selectedProject ? (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <Dashboard 
              projects={projects} 
              onAddProject={handleAddProject} 
              onSelectProject={setSelectedProject} 
              onDeleteProject={handleDeleteProject}
            />
          </motion.div>
        ) : (
          <motion.div
            key="scheduler"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 180 }}
          >
            <ProjectScheduler 
              project={selectedProject} 
              onBack={() => setSelectedProject(null)} 
              onUpdateProject={handleUpdateProject}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
