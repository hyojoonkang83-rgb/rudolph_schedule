import React, { useState } from 'react';
import { getProjects, saveProject, deleteProject } from './utils/storage';
import Dashboard from './components/Dashboard';
import ProjectScheduler from './components/scheduler/ProjectScheduler';
import ErrorBoundary from './components/ErrorBoundary';
import { AnimatePresence, motion } from 'framer-motion';
import { Project } from './types/project';

const App: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>(() => getProjects());
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('rudolph_theme');
      if (saved === 'light' || saved === 'dark') return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  React.useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('rudolph_theme', theme);
  }, [theme]);

  const toggleTheme = React.useCallback(() => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  }, []);

  const handleAddProject = React.useCallback((newProject: { clientName: string; projectName: string }) => {
    const updatedProjects = saveProject(newProject);
    setProjects(updatedProjects);
  }, []);

  const handleUpdateProject = React.useCallback((updatedProject: Project) => {
    const updatedProjects = saveProject(updatedProject);
    setProjects(updatedProjects);
    setSelectedProject(updatedProject);
  }, []);

  const handleDeleteProject = React.useCallback((id: string) => {
    const updatedProjects = deleteProject(id);
    setProjects(updatedProjects);
    setSelectedProject(prev => prev?.id === id ? null : prev);
  }, []);

  return (
    <ErrorBoundary>
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
              theme={theme}
              onToggleTheme={toggleTheme}
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
    </ErrorBoundary>
  );
}

export default App;
