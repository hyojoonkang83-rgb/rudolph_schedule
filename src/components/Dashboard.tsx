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
      <div className="mx-auto max-w-5xl relative">
        <header className="mb-12 flex items-center justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary ring-1 ring-inset ring-primary/20">
                v1.0.0 Stable
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-medium text-foreground/40 uppercase tracking-tighter">System Online</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">프로젝트 대시보드</h1>
            <p className="mt-2 text-foreground/60 text-sm sm:text-base">에이전시의 모든 디자인 프로젝트를 한눈에 관리하세요.</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            aria-label="새로운 프로젝트 등록하기"
            className="hidden sm:flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-white shadow-[0_10px_20px_-5px_rgba(0,87,255,0.3)] transition-all hover:bg-primary-dark hover:shadow-xl active:scale-95"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            새 프로젝트 등록
          </button>
        </header>

        {projects.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 rounded-[2rem] border-2 border-dashed border-border bg-white shadow-sm text-center"
          >
            <div className="h-20 w-20 text-primary/10 mb-6 bg-primary/5 rounded-3xl flex items-center justify-center">
              <FolderOpen className="h-10 w-10 text-primary/30" />
            </div>
            <h3 className="text-xl font-bold text-foreground">활성 프로젝트가 없습니다</h3>
            <p className="text-sm text-foreground/40 mt-2 max-w-xs mx-auto">새 프로젝트를 생성하여 팀의 일정을 효율적으로 운영해 보세요.</p>
            <button
               onClick={() => setIsModalOpen(true)}
               className="mt-8 px-8 py-3 rounded-xl bg-primary/5 text-sm font-bold text-primary hover:bg-primary/10 transition-colors"
            >
              첫 프로젝트 시작하기
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {projects.map((project, index) => (
                <motion.div
                  key={project.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -6, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)" }}
                  className="group relative cursor-pointer overflow-hidden rounded-3xl bg-white p-7 border border-border transition-all duration-300 hover:border-primary/20"
                >
                  <div 
                    className="flex flex-col h-full" 
                    onClick={() => onSelectProject(project)}
                    role="button"
                    tabIndex={0}
                    aria-label={`${project.clientName}의 ${project.projectName} 프로젝트 관리하기`}
                    onKeyDown={(e) => e.key === 'Enter' && onSelectProject(project)}
                  >
                    <div className="mb-6 flex items-center justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                        <LayoutGrid className="h-6 w-6" />
                      </div>
                      <div className="flex -space-x-2 overflow-hidden opacity-40 group-hover:opacity-100 transition-opacity">
                        <div className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-muted" />
                        <div className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-muted" />
                      </div>
                    </div>
                    <div className="mt-auto">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary bg-primary/5 px-2.5 py-1 rounded-md">
                        {project.clientName}
                      </span>
                      <h3 className="mt-3 text-xl font-bold text-foreground leading-tight transition-colors group-hover:text-primary">
                        {project.projectName}
                      </h3>
                      <div className="mt-4 flex items-center gap-2 text-[11px] font-medium text-foreground/30">
                        <span>{project.schedules.length}개의 일정</span>
                        <span className="h-1 w-1 rounded-full bg-border" />
                        <span>영업일 기준</span>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setConfirmDelete(project);
                    }}
                    aria-label={`${project.projectName} 프로젝트 삭제`}
                    className="absolute top-6 right-6 rounded-full p-2 text-foreground/5 transition-all hover:bg-red-50 hover:text-red-500 opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
            
            <button
              onClick={() => setIsModalOpen(true)}
              className="group flex flex-col items-center justify-center gap-4 rounded-3xl border-2 border-dashed border-border p-8 transition-all hover:border-primary/40 hover:bg-primary/[0.02] min-h-[220px]"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-foreground/20 group-hover:bg-primary/10 group-hover:text-primary transition-all duration-300">
                <Plus className="h-7 w-7" />
              </div>
              <div className="text-center">
                <span className="block text-sm font-bold text-foreground/40 group-hover:text-primary transition-colors">새 프로젝트 추가</span>
                <span className="mt-1 block text-[11px] text-foreground/20">새로운 여정을 시작하세요</span>
              </div>
            </button>
          </div>
        )}

        <footer className="mt-20 pt-8 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[11px] font-medium text-foreground/20 italic">© 2026 Rudolph Schedule. Built for Excellence.</p>
          <div className="flex items-center gap-6">
            <span className="text-[10px] font-bold text-foreground/30 hover:text-primary cursor-pointer transition-colors">Documentation</span>
            <span className="text-[10px] font-bold text-foreground/30 hover:text-primary cursor-pointer transition-colors">Support</span>
          </div>
        </footer>
      </div>

      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex sm:hidden h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-2xl active:scale-95"
        aria-label="모바일에서 새 프로젝트 추가"
      >
        <Plus className="h-6 w-6" />
      </button>

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
