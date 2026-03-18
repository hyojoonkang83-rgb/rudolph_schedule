import { Project } from '../types/project';

const PROJECTS_KEY = 'design_agency_projects';

export const getProjects = (): Project[] => {
  const data = localStorage.getItem(PROJECTS_KEY);
  if (!data) {
    // Sample Data
    const samples: Project[] = [
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
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(samples));
    return samples;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    console.error('Failed to parse projects from localStorage', e);
    return [];
  }
};

export const saveProject = (projectData: Partial<Project> & { id?: string }): Project[] => {
  const projects = getProjects();
  if (projectData.id) {
    // Updating existing project
    const index = projects.findIndex(p => p.id === projectData.id);
    if (index >= 0) {
      projects[index] = { ...projects[index], ...projectData } as Project;
    }
  } else {
    // Creating new project
    const newProject: Project = {
      clientName: projectData.clientName || '',
      projectName: projectData.projectName || '',
      id: `proj_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      schedules: projectData.schedules || []
    };
    projects.push(newProject);
  }
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  return projects;
};

export const deleteProject = (id: string): Project[] => {
  const projects = getProjects().filter(p => p.id !== id);
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  return projects;
};
