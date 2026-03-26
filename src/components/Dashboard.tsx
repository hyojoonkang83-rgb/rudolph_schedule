import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, LayoutGrid, Trash2, FolderOpen, Sun, Moon, MoreHorizontal, Edit2, Share2, Upload, X, ChevronRight } from 'lucide-react';
import Modal from './Modal';
import ConfirmModal from './ConfirmModal';
import { Project } from '../types/project';
import { DashboardConfig } from '../utils/storage';

interface DashboardProps {
  projects: Project[];
  onSaveProject: (project: Partial<Project> & { id?: string }) => void;
  onSelectProject: (project: Project) => void;
  onDeleteProject: (id: string) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  dashboardConfig: DashboardConfig;
  onUpdateDashboardConfig: (config: DashboardConfig) => void;
}

const EditableText: React.FC<{
  value: string;
  onSave: (newValue: string) => void;
  className?: string;
  isTextArea?: boolean;
}> = ({ value, onSave, className, isTextArea }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);

  useEffect(() => {
    if (!isEditing) {
      setTempValue(value);
    }
  }, [value, isEditing]);

  const handleBlur = () => {
    setIsEditing(false);
    if (tempValue.trim() !== value) {
      onSave(tempValue.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isTextArea) {
      handleBlur();
    }
    if (e.key === 'Escape') {
      setTempValue(value);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    const commonProps = {
      autoFocus: true,
      value: tempValue,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setTempValue(e.target.value),
      onBlur: handleBlur,
      onKeyDown: handleKeyDown,
      className: `w-full bg-transparent outline-none border-b-2 border-primary/30 focus:border-primary transition-all p-0 ${className}`
    };

    return isTextArea ? <textarea {...commonProps} rows={2} /> : <input type="text" {...commonProps} />;
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      className={`cursor-pointer hover:bg-primary/5 rounded-md px-1 -mx-1 transition-colors ${className}`}
    >
      {value}
    </div>
  );
};

const Dashboard: React.FC<DashboardProps> = ({ 
  projects, 
  onSaveProject, 
  onSelectProject, 
  onDeleteProject,
  theme,
  onToggleTheme,
  dashboardConfig,
  onUpdateDashboardConfig
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Project | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [newProject, setNewProject] = useState({ clientName: '', projectName: '', imageUrl: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setActiveMenuId(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clientName = newProject.clientName.trim();
    const projectName = newProject.projectName.trim();
    
    if (clientName && projectName) {
      if (editingProject) {
        onSaveProject({ ...editingProject, clientName, projectName, imageUrl: newProject.imageUrl }); 
      } else {
        onSaveProject({ clientName, projectName, imageUrl: newProject.imageUrl });
      }
      handleCloseModal();
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProject(null);
    setNewProject({ clientName: '', projectName: '', imageUrl: '' });
  };

  const handleEditClick = (project: Project) => {
    setEditingProject(project);
    setNewProject({ 
      clientName: project.clientName, 
      projectName: project.projectName,
      imageUrl: project.imageUrl || ''
    });
    setIsModalOpen(true);
    setActiveMenuId(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = 60;
          canvas.height = 60;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            const size = Math.min(img.width, img.height);
            const offsetX = (img.width - size) / 2;
            const offsetY = (img.height - size) / 2;
            ctx.drawImage(img, offsetX, offsetY, size, size, 0, 0, 60, 60);
            setNewProject({ ...newProject, imageUrl: canvas.toDataURL('image/png') });
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleShareClick = (project: Project) => {
    const url = window.location.origin; // For now, share the main URL
    navigator.clipboard.writeText(`${url}?project=${project.id}`).then(() => {
      alert('프로젝트 공유 링크가 클립보드에 복사되었습니다.');
    });
    setActiveMenuId(null);
  };

  return (
    <div className="min-h-screen bg-background px-6 py-12 lg:px-24">
      <div className="mx-auto max-w-5xl relative">
        <header className="mb-12 flex items-center justify-between">
          <div className="flex-1 mr-8">
            <div className="mb-2 flex items-center gap-2">
              <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-bold text-primary ring-1 ring-inset ring-primary/20">
                v0.5.0-Stable
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-medium text-foreground/40 uppercase tracking-tighter">System Online</span>
            </div>
            <EditableText 
              value={dashboardConfig.title}
              onSave={(val) => onUpdateDashboardConfig({ ...dashboardConfig, title: val })}
              className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
            />
            <EditableText 
              value={dashboardConfig.description}
              onSave={(val) => onUpdateDashboardConfig({ ...dashboardConfig, description: val })}
              className="mt-2 text-foreground/60 text-sm sm:text-base"
              isTextArea
            />
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={onToggleTheme}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-card/50 border border-border shadow-sm transition-all hover:bg-card active:scale-95"
              aria-label={theme === 'light' ? '다크 모드로 전환' : '라이트 모드로 전환'}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={theme}
                  initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
                  animate={{ opacity: 1, rotate: 0, scale: 1 }}
                  exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
                  transition={{ duration: 0.2 }}
                >
                  {theme === 'light' ? <Moon className="h-4.5 w-4.5 text-foreground/70" /> : <Sun className="h-4.5 w-4.5 text-foreground/70" />}
                </motion.div>
              </AnimatePresence>
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              aria-label="새로운 프로젝트 등록하기"
              className="hidden sm:flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-white shadow-[0_10px_20px_-5px_rgba(0,87,255,0.3)] transition-all hover:bg-primary-dark hover:shadow-xl active:scale-95"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              새 프로젝트 등록
            </button>
          </div>
        </header>

        {projects.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 rounded-[2rem] border-2 border-dashed border-border bg-card/30 shadow-sm text-center"
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
                  whileHover={{ y: -6, boxShadow: theme === 'dark' ? "0 20px 25px -5px rgb(0 0 0 / 0.5)" : "0 20px 25px -5px rgb(0 0 0 / 0.1)" }}
                  className="group relative cursor-pointer overflow-hidden rounded-3xl bg-card p-7 border border-border transition-all duration-300 hover:border-primary/20"
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
                      <div className="flex h-12 w-12 overflow-hidden items-center justify-center rounded-2xl bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                        {project.imageUrl ? (
                          <img src={project.imageUrl} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <LayoutGrid className="h-6 w-6" />
                        )}
                      </div>
                    </div>
                    <div className="mt-auto">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary bg-primary/5 px-2.5 py-1 rounded-md">
                        {project.clientName}
                      </span>
                      <h3 className="mt-3 text-xl font-bold text-foreground leading-tight transition-colors group-hover:text-primary">
                        {project.projectName}
                      </h3>
                      <div className="mt-4 flex items-center justify-between text-[11px] font-medium text-card-foreground/30">
                        <div className="flex items-center gap-2">
                          <span>{project.schedules.length}개의 일정</span>
                          <span className="h-1 w-1 rounded-full bg-border" />
                          <span>영업일 기준</span>
                        </div>
                        <ChevronRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="absolute top-6 right-6">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuId(activeMenuId === project.id ? null : project.id);
                      }}
                      aria-label="더 보기"
                      className="rounded-full p-2 text-foreground/20 transition-all hover:bg-muted group-hover:text-foreground/60"
                    >
                      <MoreHorizontal className="h-5 w-5" />
                    </button>

                    <AnimatePresence>
                      {activeMenuId === project.id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -10 }}
                          className="absolute right-0 mt-2 w-36 overflow-hidden rounded-2xl border border-border bg-card shadow-xl z-20"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="p-1.5 flex flex-col">
                            <button
                              onClick={() => handleEditClick(project)}
                              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-foreground/70 hover:bg-primary/5 hover:text-primary transition-all overflow-hidden whitespace-nowrap"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                              수정하기
                            </button>
                            <button
                              onClick={() => handleShareClick(project)}
                              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-foreground/70 hover:bg-primary/5 hover:text-primary transition-all overflow-hidden whitespace-nowrap"
                            >
                              <Share2 className="h-3.5 w-3.5" />
                              공유하기
                            </button>
                            <div className="my-1 h-px bg-border/50" />
                            <button
                              onClick={() => {
                                setConfirmDelete(project);
                                setActiveMenuId(null);
                              }}
                              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-50 transition-all overflow-hidden whitespace-nowrap"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              삭제하기
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
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
        onClose={handleCloseModal}
        title={editingProject ? "프로젝트 정보 수정" : "새 프로젝트 등록"}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex flex-col items-center gap-4 py-2">
            <div className="relative group">
              <div className="h-[60px] w-[60px] overflow-hidden rounded-2xl bg-muted flex items-center justify-center border-2 border-dashed border-border group-hover:border-primary/50 transition-colors">
                {newProject.imageUrl ? (
                  <img src={newProject.imageUrl} alt="Preview" className="h-full w-full object-cover" />
                ) : (
                  <Upload className="h-5 w-5 text-foreground/20" />
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity text-white text-[8px] font-bold leading-tight px-1 text-center"
              >
                {newProject.imageUrl ? '이미지 변경' : '이미지 업로드'}
              </button>
              {newProject.imageUrl && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setNewProject({ ...newProject, imageUrl: '' });
                  }}
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg border-2 border-white hover:bg-red-600 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleImageChange}
            />
            <p className="text-[11px] text-foreground/40 font-medium">60px X 60px 권장</p>
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wider font-extrabold text-foreground/40 mb-2 ml-1">클라이언트 명</label>
            <input
              autoFocus
              required
              type="text"
              placeholder="예: Google"
              value={newProject.clientName}
              onChange={(e) => setNewProject({ ...newProject, clientName: e.target.value })}
              className="w-full rounded-2xl border border-border bg-muted px-5 py-4 text-sm font-bold text-foreground transition-focus focus:border-primary focus:bg-muted focus:outline-none focus:ring-4 focus:ring-primary/10 placeholder:text-foreground/20"
            />
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-wider font-extrabold text-foreground/40 mb-2 ml-1">프로젝트 명</label>
            <input
              required
              type="text"
              placeholder="예: 브랜드 리뉴얼"
              value={newProject.projectName}
              onChange={(e) => setNewProject({ ...newProject, projectName: e.target.value })}
              className="w-full rounded-2xl border border-border bg-muted px-5 py-4 text-sm font-bold text-foreground transition-focus focus:border-primary focus:bg-muted focus:outline-none focus:ring-4 focus:ring-primary/10 placeholder:text-foreground/20"
            />
          </div>
          <div className="pt-2">
            <button
              type="submit"
              className="w-full rounded-2xl bg-primary py-4.5 text-sm font-bold text-white shadow-xl shadow-primary/20 transition-all hover:bg-primary-dark active:scale-[0.98]"
            >
              {editingProject ? "정보 수정하기" : "프로젝트 생성"}
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
