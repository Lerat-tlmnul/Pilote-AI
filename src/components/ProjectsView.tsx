import React, { useState } from 'react';
import { 
  FolderKanban, 
  Plus, 
  CheckCircle2, 
  Circle, 
  Calendar, 
  Users, 
  ArrowRight, 
  Sparkles, 
  TrendingUp, 
  Flag,
  MessageSquare,
  Trash2
} from 'lucide-react';
import { Project, Milestone } from '../types';

const LOGO_URL = "https://cdn.fbsbx.com/v/t65.102178-21/841369064_1700174318342564_3271721217476734999_n.jpg/pilote_4k_transparent.png?_nc_ht=cdn.fbsbx.com&_nc_ohc=odcyhxgaYC8Q7kNvwF6bcWV&sdl=0&ccb=14-4&oh=00_AQPGkUgJrahia3JJDnDRKdVEg8rkTFmoALNTHwdL52ZTrg&oe=6AEDA667&_nc_sid=4ee932";

interface ProjectsViewProps {
  onOpenChatWithPrompt: (prompt: string) => void;
  onBackToChat?: () => void;
}

const isBaseProject = (p: Project) => {
  const lower = (p.title || '').toLowerCase();
  return (
    p.id.startsWith('p1') ||
    p.id.startsWith('p2') ||
    p.id.startsWith('p3') ||
    p.id === '1' ||
    p.id === '2' ||
    p.id === '3' ||
    lower.includes('refonte crm') ||
    lower.includes('lancement pilote') ||
    lower.includes('expansion internationale')
  );
};

export const ProjectsView: React.FC<ProjectsViewProps> = ({ onOpenChatWithPrompt, onBackToChat }) => {
  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      // Purge legacy base projects
      const purgeKey = 'pilote_purged_defaults_v4';
      if (localStorage.getItem(purgeKey) !== 'true') {
        localStorage.setItem(purgeKey, 'true');
        localStorage.removeItem('pilote_user_projects');
        return [];
      }
      const saved = localStorage.getItem('pilote_user_projects');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const clean = parsed.filter((p: Project) => !isBaseProject(p));
          localStorage.setItem('pilote_user_projects', JSON.stringify(clean));
          return clean;
        }
      }
    } catch {
      // ignore
    }
    return [];
  });
  const [filter, setFilter] = useState<'all' | 'en_cours' | 'termine'>('all');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newDeadline, setNewDeadline] = useState('');

  const saveProjects = (updated: Project[]) => {
    setProjects(updated);
    try {
      localStorage.setItem('pilote_user_projects', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const handleDeleteProject = (projectId: string) => {
    const updated = projects.filter(p => p.id !== projectId);
    saveProjects(updated);
  };

  const toggleMilestone = (projectId: string, milestoneId: string) => {
    const updated = projects.map(p => {
      if (p.id !== projectId) return p;
      const updatedMilestones = p.milestones.map(m => 
        m.id === milestoneId ? { ...m, done: !m.done } : m
      );
      const doneCount = updatedMilestones.filter(m => m.done).length;
      const newProgress = Math.round((doneCount / updatedMilestones.length) * 100);
      return {
        ...p,
        milestones: updatedMilestones,
        progress: newProgress,
        status: (newProgress === 100 ? 'termine' : 'en_cours') as Project['status'],
      };
    });
    saveProjects(updated);
  };

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newProj: Project = {
      id: `proj-${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory.trim() || 'Général',
      description: newDesc.trim() || 'Planifié avec Pilote 1.',
      progress: 0,
      status: 'en_cours',
      deadline: newDeadline.trim() || 'Fin de trimestre',
      team: ['Vous (Lead)'],
      milestones: [
        { id: `m-${Date.now()}-1`, title: 'Cadrage initial et objectifs', done: false, dueDate: 'Jalon 1' },
        { id: `m-${Date.now()}-2`, title: 'Exécution et suivi des livrables', done: false, dueDate: 'Jalon 2' },
        { id: `m-${Date.now()}-3`, title: 'Clôture et bilan des résultats', done: false, dueDate: 'Jalon 3' },
      ],
    };

    saveProjects([newProj, ...projects]);
    setNewTitle('');
    setNewCategory('');
    setNewDesc('');
    setNewDeadline('');
    setIsNewModalOpen(false);
  };

  const filteredProjects = projects.filter(p => {
    if (filter === 'all') return true;
    return p.status === filter;
  });

  return (
    <div className="w-full max-w-5xl mx-auto px-4 pt-16 md:pt-24 pb-28 md:pb-16 animate-in fade-in duration-300">
      {onBackToChat && (
        <button
          type="button"
          onClick={onBackToChat}
          className="md:hidden inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-white border border-black/[0.08] px-3.5 py-1.5 rounded-full mb-4 shadow-2xs active:scale-95 transition-all cursor-pointer"
        >
          <span>← Revenir au Chat Pilote</span>
        </button>
      )}

      {/* Top Banner of Projects View */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-widest">
              Gestionnaire Stratégique
            </span>
            <span className="text-slate-400">·</span>
            <span className="text-xs font-medium text-emerald-800 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              {projects.length} projets actifs
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <img
              src={LOGO_URL}
              alt="Logo"
              className="h-8 w-auto object-contain"
              referrerPolicy="no-referrer"
            />
            <span>Projets & Grands Chantiers</span>
          </h1>
          <p className="mt-1 text-xs md:text-sm text-slate-700 max-w-xl">
            Pilotez vos opérations complexes, coordonnez vos équipes et suivez chaque jalon stratégique.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onOpenChatWithPrompt("Aide-moi à structurer un nouveau grand projet : j'aimerais définir les objectifs, les 4 jalons clés et le rétroplanning.")}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-800 bg-white/80 hover:bg-white border border-white/80 shadow-xs transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Planifier via Chat</span>
          </button>

          <button
            type="button"
            onClick={() => setIsNewModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 shadow-sm active:scale-98 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nouveau projet</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-6">
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            filter === 'all'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white/60 text-slate-700 hover:bg-white border border-white/60'
          }`}
        >
          Tous les projets ({projects.length})
        </button>
        <button
          type="button"
          onClick={() => setFilter('en_cours')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            filter === 'en_cours'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white/60 text-slate-700 hover:bg-white border border-white/60'
          }`}
        >
          En cours ({projects.filter(p => p.status === 'en_cours').length})
        </button>
        <button
          type="button"
          onClick={() => setFilter('termine')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            filter === 'termine'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white/60 text-slate-700 hover:bg-white border border-white/60'
          }`}
        >
          Terminés ({projects.filter(p => p.status === 'termine').length})
        </button>
      </div>

      {/* Project Cards Grid or Empty State */}
      {filteredProjects.length === 0 ? (
        <div className="rounded-3xl bg-white/80 backdrop-blur-2xl border border-white/80 p-8 sm:p-12 text-center shadow-sm max-w-lg mx-auto my-6">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-600">
            <FolderKanban className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            {filter === 'all' ? 'Aucun projet enregistré' : `Aucun projet « ${filter === 'en_cours' ? 'En cours' : 'Terminé'} »`}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
            Créez votre premier grand projet avec le bouton « + Nouveau Projet » ou confiez la planification à Pilote 1.
          </p>
          <button
            type="button"
            onClick={() => setIsNewModalOpen(true)}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Créer un projet</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredProjects.map((project) => (
          <div
            key={project.id}
            className="rounded-3xl bg-white/90 border border-white/80 p-5 md:p-6 shadow-md backdrop-blur-xl transition-all hover:shadow-lg"
          >
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-semibold text-sky-800 bg-sky-500/10 px-2.5 py-0.5 rounded-full border border-sky-500/20">
                    {project.category}
                  </span>
                  <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Échéance : {project.deadline}
                  </span>
                  {project.budget && (
                    <span className="text-xs text-slate-500 font-medium">
                      · Budget : {project.budget}
                    </span>
                  )}
                </div>

                <h3 className="text-lg md:text-xl font-bold text-slate-900 mt-2">
                  {project.title}
                </h3>
                <p className="mt-1 text-xs md:text-sm text-slate-600 leading-relaxed max-w-2xl">
                  {project.description}
                </p>
              </div>

              {/* Progress Ring / Metric */}
              <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center shrink-0">
                <div className="text-right">
                  <span className="text-2xl font-black text-slate-900 tabular-nums">
                    {project.progress}%
                  </span>
                  <span className="block text-[11px] font-medium text-slate-500">
                    Complété
                  </span>
                </div>
                {/* Visual Progress Bar */}
                <div className="w-32 md:w-28 h-2 rounded-full bg-slate-100 overflow-hidden mt-1.5">
                  <div
                    className="h-full bg-slate-900 rounded-full transition-all duration-500"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Milestones Checklist */}
            <div className="mt-5">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Flag className="w-3.5 h-3.5 text-slate-500" />
                <span>Jalons Stratégiques & Livrables</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {project.milestones.map((milestone) => (
                  <button
                    key={milestone.id}
                    type="button"
                    onClick={() => toggleMilestone(project.id, milestone.id)}
                    className={`flex items-start gap-2.5 p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                      milestone.done
                        ? 'bg-emerald-500/5 border-emerald-500/20 text-slate-800'
                        : 'bg-white hover:bg-slate-50 border-slate-200/70 text-slate-700'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {milestone.done ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-100" />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <span className={`text-xs font-medium block leading-tight ${milestone.done ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                        {milestone.title}
                      </span>
                      <span className="text-[10px] text-slate-600 mt-1 block">
                        Cible : {milestone.dueDate}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Card Footer */}
            <div className="mt-5 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-1.5 text-slate-500">
                <Users className="w-3.5 h-3.5" />
                <span>Équipe : {project.team.join(', ')}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDeleteProject(project.id)}
                  className="flex items-center gap-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer text-xs font-medium py-1 px-2.5 rounded-lg hover:bg-rose-50/80"
                  title="Supprimer ce projet"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Supprimer</span>
                </button>

                <button
                  type="button"
                  onClick={() => onOpenChatWithPrompt(`Faisons un point sur le projet "${project.title}". Quels sont les prochains obstacles et recommandations pour tenir l'échéance du ${project.deadline} ?`)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 hover:text-sky-700 transition-colors cursor-pointer"
                >
                  <span>Demander une analyse</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    )}

      {/* New Project Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md">
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-white/80">
            <h3 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
              <img
                src={LOGO_URL}
                alt="Logo"
                className="h-6 w-auto object-contain"
                referrerPolicy="no-referrer"
              />
              <span>Créer un grand projet</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Renseignez les lignes directrices de votre projet.
            </p>

            <form onSubmit={handleCreateProject} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Titre du projet *</label>
                <input
                  type="text"
                  required
                  placeholder="ex. Expansion marché Asie-Pacifique"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-1 focus:ring-sky-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Catégorie</label>
                  <input
                    type="text"
                    placeholder="ex. Développement Produit"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-1 focus:ring-sky-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Échéance</label>
                  <input
                    type="text"
                    placeholder="ex. 15 Décembre 2026"
                    value={newDeadline}
                    onChange={(e) => setNewDeadline(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-1 focus:ring-sky-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description & Ambition</label>
                <textarea
                  rows={3}
                  placeholder="Décrivez les objectifs et enjeux de ce chantier..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-1 focus:ring-sky-500 focus:outline-hidden"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-medium cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 shadow-sm cursor-pointer"
                >
                  Créer le projet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
