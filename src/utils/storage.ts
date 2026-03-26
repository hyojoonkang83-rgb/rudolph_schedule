import { Project } from '../types/project';

const PROJECTS_KEY = 'rudolph_schedule_data';
const OLD_PROJECTS_KEY = 'design_agency_projects';
const DASHBOARD_CONFIG_KEY = 'rudolph_dashboard_config';

export interface DashboardConfig {
  title: string;
  description: string;
}

const DEFAULT_CONFIG: DashboardConfig = {
  title: '프로젝트 대시보드',
  description: '에이전시의 모든 디자인 프로젝트를 한눈에 관리하세요.'
};

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
  try {
    const data = localStorage.getItem(PROJECTS_KEY);
    
    // Migration logic
    if (!data) {
      const oldData = localStorage.getItem(OLD_PROJECTS_KEY);
      if (oldData) {
        localStorage.setItem(PROJECTS_KEY, oldData);
        localStorage.removeItem(OLD_PROJECTS_KEY);
        return JSON.parse(oldData);
      }
      
      // Initialize with samples if no data exists at all
      localStorage.setItem(PROJECTS_KEY, JSON.stringify(SAMPLE_PROJECTS));
      return SAMPLE_PROJECTS;
    }

    const projects = JSON.parse(data);
    if (!Array.isArray(projects)) {
      return SAMPLE_PROJECTS;
    }
    
    const validatedProjects = projects.filter(p => p && typeof p === 'object' && p.id && p.projectName);
    
    if (validatedProjects.length !== projects.length) {
      localStorage.setItem(PROJECTS_KEY, JSON.stringify(validatedProjects));
    }
    
    return validatedProjects;
  } catch (error) {
    // Robust error recovery: return samples but don't overwrite user data unless completely corrupted
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
      ...projectData,
      id: `proj_${crypto.randomUUID().split('-')[0]}_${Date.now().toString(36).slice(-4)}`,
      clientName: (projectData.clientName || 'Unnamed Client').trim(),
      projectName: (projectData.projectName || 'Untitled Project').trim(),
      schedules: projectData.schedules ?? [],
    };
    updatedProjects = [...projects, newProject];
  }

  try {
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(updatedProjects));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
  return updatedProjects;
};

export const deleteProject = (id: string): Project[] => {
  const projects = getProjects().filter(p => p.id !== id);
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  return projects;
};

export const getDashboardConfig = (): DashboardConfig => {
  try {
    const data = localStorage.getItem(DASHBOARD_CONFIG_KEY);
    if (!data) return DEFAULT_CONFIG;
    return JSON.parse(data);
  } catch {
    return DEFAULT_CONFIG;
  }
};

export const saveDashboardConfig = (config: DashboardConfig): void => {
  try {
    localStorage.setItem(DASHBOARD_CONFIG_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save dashboard config:', e);
  }
};
