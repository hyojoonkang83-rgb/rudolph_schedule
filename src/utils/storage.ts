import { Project } from '../types/project';

const PROJECTS_KEY = 'design_agency_projects';

const SAMPLE_PROJECTS: Project[] = [
  {
    id: '1',
    clientName: 'Google',
    projectName: '브랜드 리뉴얼 프로젝트',
    schedules: [
      { 
        id: 's1', 
        title: '킥오프 미팅', 
        startDate: new Date().toISOString().split('T')[0] || '',
        endDate: new Date().toISOString().split('T')[0] || '',
        isAllDay: true,
        color: 'blue',
        type: 'meeting' 
      }
    ]
  },
  {
    id: '2',
    clientName: 'Apple',
    projectName: '신제품 런칭 캠페인',
    schedules: []
  }
];

export const getProjects = (): Project[] => {
  const data = localStorage.getItem(PROJECTS_KEY);
  if (!data) {
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(SAMPLE_PROJECTS));
    return SAMPLE_PROJECTS;
  }
  
  try {
    const projects = JSON.parse(data);
    if (!Array.isArray(projects)) {
      console.warn('Storage data is not an array, resetting to sample.');
      localStorage.setItem(PROJECTS_KEY, JSON.stringify(SAMPLE_PROJECTS));
      return SAMPLE_PROJECTS;
    }
    
    // 필수 필드(id, projectName)가 있는 프로젝트만 필터링
    const validatedProjects = projects.filter(p => p && typeof p === 'object' && p.id && p.projectName);
    
    if (validatedProjects.length !== projects.length) {
      console.warn('Included invalid projects in storage, filtering...');
      localStorage.setItem(PROJECTS_KEY, JSON.stringify(validatedProjects));
    }
    
    return validatedProjects;
  } catch (error) {
    console.error('Failed to parse storage data:', error);
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(SAMPLE_PROJECTS));
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
      clientName: projectData.clientName || 'Unknown Client',
      projectName: projectData.projectName || 'Untitled Project',
      schedules: [],
      ...projectData
    };
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
