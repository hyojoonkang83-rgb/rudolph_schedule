import React, { useState } from 'react';
import { getProjects, saveProject, deleteProject, getDashboardConfig, saveDashboardConfig, DashboardConfig } from './utils/storage';
import Dashboard from './components/Dashboard';
import ProjectScheduler from './components/scheduler/ProjectScheduler';
import ErrorBoundary from './components/ErrorBoundary';
import { AnimatePresence, motion } from 'framer-motion';
import { Project } from './types/project';

const App: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>(() => getProjects());
  const [dashboardConfig, setDashboardConfig] = useState<DashboardConfig>(() => getDashboardConfig());
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

  // Sync state with URL for browser navigation support
  React.useEffect(() => {
    const handleInitialUrl = () => {
      const searchParams = new URLSearchParams(window.location.search);
      const projectId = searchParams.get('project');
      if (projectId) {
        const project = projects.find(p => p.id === projectId);
        if (project) {
          setSelectedProject(project);
        }
      }
    };
    handleInitialUrl();
  }, [projects]);

  const handleSelectProject = React.useCallback((project: Project | null) => {
    setSelectedProject(project);
    const url = new URL(window.location.href);
    if (project) {
      url.searchParams.set('project', project.id);
    } else {
      url.searchParams.delete('project');
    }
    window.history.pushState({}, '', url.toString());
  }, []);

  React.useEffect(() => {
    const handlePopState = () => {
      const searchParams = new URLSearchParams(window.location.search);
      const projectId = searchParams.get('project');
      if (projectId) {
        const project = projects.find(p => p.id === projectId);
        setSelectedProject(project || null);
      } else {
        setSelectedProject(null);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [projects]);

  const toggleTheme = React.useCallback(() => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  }, []);

  const handleSaveProject = React.useCallback((projectData: Partial<Project> & { id?: string }) => {
    const updatedProjects = saveProject(projectData);
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

  const handleUpdateDashboardConfig = React.useCallback((newConfig: DashboardConfig) => {
    saveDashboardConfig(newConfig);
    setDashboardConfig(newConfig);
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
              onSaveProject={handleSaveProject} 
              onSelectProject={handleSelectProject} 
              onDeleteProject={handleDeleteProject}
              theme={theme}
              onToggleTheme={toggleTheme}
              dashboardConfig={dashboardConfig}
              onUpdateDashboardConfig={handleUpdateDashboardConfig}
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
              onBack={() => handleSelectProject(null)} 
              onUpdateProject={handleUpdateProject}
              theme={theme}
              onToggleTheme={toggleTheme}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </ErrorBoundary>
  );
}

export default App;
