const PROJECTS_KEY = 'design_agency_projects';

export const getProjects = () => {
  const data = localStorage.getItem(PROJECTS_KEY);
  if (!data) {
    // Sample Data
    const samples = [
      {
        id: '1',
        clientName: 'Google',
        projectName: '브랜드 리뉴얼 프로젝트',
        schedules: [
          { id: 's1', title: '킥오프 미팅', date: new Date().toISOString(), type: 'meeting' }
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
  return JSON.parse(data);
};

export const saveProject = (projectData) => {
  const projects = getProjects();
  if (projectData.id) {
    // Updating existing project
    const index = projects.findIndex(p => p.id === projectData.id);
    if (index >= 0) {
      projects[index] = { ...projects[index], ...projectData };
    }
  } else {
    // Creating new project
    const newProject = {
      ...projectData,
      id: `proj_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      schedules: projectData.schedules || []
    };
    projects.push(newProject);
  }
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  return projects;
};

export const deleteProject = (id) => {
  const projects = getProjects().filter(p => p.id !== id);
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  return projects;
};
