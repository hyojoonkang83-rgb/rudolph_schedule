import { Project } from '../types/project';

const PROJECTS_KEY = 'rudolph_schedule_data';
const OLD_PROJECTS_KEY = 'design_agency_projects';

const SAMPLE_PROJECTS: Project[] = [
  {
    id: 'rudolph-sample-1',
    clientName: 'Rudolph Agency',
    projectName: '2026 브랜드 비전 수립',
    schedules: [
      { 
        id: 'sample-s1', 
        title: '신규 비전 킥오프', 
        startDate: new Date().toISOString().split('T')[0] || '',
        endDate: new Date().toISOString().split('T')[0] || '',
        isAllDay: true,
        color: 'blue',
        type: 'meeting' 
      }
    ]
  }
];

export const getProjects = (): Project[] => {
  let data = localStorage.getItem(PROJECTS_KEY);
  
  // Migration logic
  if (!data) {
    const oldData = localStorage.getItem(OLD_PROJECTS_KEY);
    if (oldData) {
      console.info('Migrating data from old storage key...');
      localStorage.setItem(PROJECTS_KEY, oldData);
      localStorage.removeItem(OLD_PROJECTS_KEY);
      data = oldData;
    }
  }

  if (!data) {
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(SAMPLE_PROJECTS));
    return SAMPLE_PROJECTS;
  }
  
  try {
    const projects = JSON.parse(data);
    if (!Array.isArray(projects)) {
      console.warn('Storage data is not an array, resetting to sample.');
      return SAMPLE_PROJECTS;
    }
    
    const validatedProjects = projects.filter(p => p && typeof p === 'object' && p.id && p.projectName);
    
    if (validatedProjects.length !== projects.length) {
      console.warn('Filtered out invalid projects from storage.');
      localStorage.setItem(PROJECTS_KEY, JSON.stringify(validatedProjects));
    }
    
    return validatedProjects;
  } catch (error) {
    console.error('Failed to parse storage data:', error);
    return SAMPLE_PROJECTS;
  }
};

export const saveProject = (projectData: Partial<Project> & { id?: string }): Project[] => {
  const projects = getProjects();
  let updatedProjects: Project[];

  if (projectData.id) {
    updatedProjects = projects.map(p => 
      p.id === projectData.id ? { ...p, ...projectData } as Project : p
    );
  } else {
    const newProject: Project = {
      id: `proj_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      clientName: projectData.clientName || 'Unnamed Client',
      projectName: projectData.projectName || 'Untitled Project',
      schedules: [],
      ...projectData
    } as Project;
    updatedProjects = [...projects, newProject];
  }

  localStorage.setItem(PROJECTS_KEY, JSON.stringify(updatedProjects));
  return updatedProjects;
};

export const deleteProject = (id: string): Project[] => {
  const projects = getProjects().filter(p => p.id !== id);
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  return projects;
};
