import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, ChevronRight, LayoutGrid, Trash2, FolderOpen } from 'lucide-react';
import Modal from './Modal';
import ConfirmModal from './ConfirmModal';
import { Project } from '../types/project';

interface DashboardProps {
  projects: Project[];
  onAddProject: (project: { clientName: string; projectName: string }) => void;
  onSelectProject: (project: Project) => void;
  onDeleteProject: (id: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  projects, 
  onAddProject, 
  onSelectProject, 
  onDeleteProject 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Project | null>(null);
  const [newProject, setNewProject] = useState({ clientName: '', projectName: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProject.clientName && newProject.projectName) {
      onAddProject(newProject);
      setNewProject({ clientName: '', projectName: '' });
      setIsModalOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 px-6 py-12 lg:px-24">
      <div className="mx-auto max-w-5xl">
        <header className="mb-12 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">프로젝트 대시보드</h1>
            <p className="mt-2 text-foreground/60 text-sm">에이전시의 모든 디자인 프로젝트를 한눈에 관리하세요.</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            aria-label="새 프로젝트 등록 시작"
            className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-primary-dark hover:shadow-lg active:scale-95"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            새 프로젝트 등록
          </button>
        </header>

        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 rounded-3xl border-2 border-dashed border-border bg-white/50 text-center">
            <div className="h-16 w-16 text-foreground/10 mb-4">
              <FolderOpen className="h-full w-full" />
            </div>
            <h3 className="text-lg font-semibold text-foreground/40">등록된 프로젝트가 없습니다</h3>
            <p className="text-sm text-foreground/30 mt-1 max-w-xs">새 프로젝트를 등록하여 체계적인 일정을 관리해 보세요.</p>
            <button
               onClick={() => setIsModalOpen(true)}
               className="mt-6 text-sm font-bold text-primary hover:underline"
            >
              지금 바로 등록하기
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence>
              {projects.map((project) => (
                <motion.div
                  key={project.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ y: -4 }}
                  className="group relative cursor-pointer overflow-hidden rounded-2xl bg-white p-6 border border-border transition-all hover:shadow-xl"
                >
                  <div 
                    className="flex flex-col h-full" 
                    onClick={() => onSelectProject(project)}
                    role="button"
                    tabIndex={0}
                    aria-label={`${project.clientName}의 ${project.projectName} 프로젝트 관리하기`}
                    onKeyDown={(e) => e.key === 'Enter' && onSelectProject(project)}
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <LayoutGrid className="h-5 w-5" />
                      </div>
                      <ChevronRight className="h-4 w-4 text-foreground/20 transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                    </div>
                    <div className="mt-auto">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-primary/70 bg-primary/5 px-2 py-0.5 rounded-full">
                        {project.clientName}
                      </span>
                      <h3 className="mt-2 text-lg font-bold text-foreground leading-tight transition-colors group-hover:text-primary">
                        {project.projectName}
                      </h3>
                    </div>
                  </div>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setConfirmDelete(project);
                    }}
                    aria-label={`${project.projectName} 프로젝트 삭제`}
                    className="absolute top-4 right-4 rounded-full p-2 text-foreground/10 transition-all hover:bg-red-50 hover:text-red-500 opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
            
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-border p-6 transition-colors hover:border-primary/50 hover:bg-primary/5 min-h-[160px]"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-foreground/30">
                <Plus className="h-6 w-6" />
              </div>
              <span className="text-sm font-medium text-foreground/40">새 프로젝트 추가</span>
            </button>
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="새 프로젝트 등록"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-foreground/70 mb-1.5 ml-1">클라이언트 명</label>
            <input
              autoFocus
              required
              type="text"
              placeholder="예: Google, Apple"
              value={newProject.clientName}
              onChange={(e) => setNewProject({ ...newProject, clientName: e.target.value })}
              className="w-full rounded-xl border border-border bg-muted/50 px-4 py-3.5 text-sm transition-focus focus:border-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/10"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-foreground/70 mb-1.5 ml-1">프로젝트 명</label>
            <input
              required
              type="text"
              placeholder="예: 브랜드 리뉴얼"
              value={newProject.projectName}
              onChange={(e) => setNewProject({ ...newProject, projectName: e.target.value })}
              className="w-full rounded-xl border border-border bg-muted/50 px-4 py-3.5 text-sm transition-focus focus:border-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/10"
            />
          </div>
          <div className="pt-2">
            <button
              type="submit"
              className="w-full rounded-xl bg-primary py-4 text-sm font-bold text-white shadow-[0_10px_20px_-5px_rgba(0,87,255,0.3)] transition-all hover:bg-primary-dark active:scale-[0.98]"
            >
              프로젝트 생성
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => confirmDelete && onDeleteProject(confirmDelete.id)}
        title="프로젝트 삭제"
        message={`[${confirmDelete?.clientName}] ${confirmDelete?.projectName} 프로젝트를 삭제하시겠습니까? 모든 일정 정보가 영구적으로 삭제됩니다.`}
        confirmText="완전 삭제"
      />
    </div>
  );
};

export default Dashboard;
