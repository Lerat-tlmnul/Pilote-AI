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
  MessageSquare
} from 'lucide-react';
import { Project, Milestone } from '../types';

const LOGO_URL = "https://cdn.fbsbx.com/v/t65.102178-21/841369064_1700174318342564_3271721217476734999_n.jpg/pilote_4k_transparent.png?_nc_ht=cdn.fbsbx.com&_nc_ohc=odcyhxgaYC8Q7kNvwF6bcWV&sdl=0&ccb=14-4&oh=00_AQPGkUgJrahia3JJDnDRKdVEg8rkTFmoALNTHwdL52ZTrg&oe=6AEDA667&_nc_sid=4ee932";

interface ProjectsViewProps {
  onOpenChatWithPrompt: (prompt: string) => void;
}

const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    title: 'Lancement Commercial Europe 2026',
    category: 'Stratégie & Croissance',
    description: 'Déploiement de la nouvelle offre haut de gamme sur 4 marchés clés : France, Suisse, Belgique et Luxembourg.',
    progress: 65,
    status: 'en_cours',
    deadline: '15 Décembre 2026',
    budget: '120 000 €',
    team: ['Alexandre (Lead)', 'Sarah (Comms)', 'Marc (Ops)'],
    milestones: [
      { id: 'm-1', title: 'Étude d\'impact et localisation des offres', done: true, dueDate: 'Sept 2026' },
      { id: 'm-2', title: 'Partenariats avec les relais d\'influence', done: true, dueDate: 'Oct 2026' },
      { id: 'm-3', title: 'Soirée de lancement et relations presse', done: false, dueDate: 'Nov 2026' },
      { id: 'm-4', title: 'Bilan d\'acquisition premier mois', done: false, dueDate: 'Déc 2026' },
    ],
  },
  {
    id: 'proj-2',
    title: 'Ouverture du Lieu Éphémère & Expérience Gastronomique',
    category: 'Événementiel & Art de Vivre',
    description: 'Conception d\'une table d\'hôtes confidentielle avec chefs invités et accords mets & vins exclusifs.',
    progress: 40,
    status: 'en_cours',
    deadline: '28 Novembre 2026',
    budget: '45 000 €',
    team: ['Chef invité', 'Clara (Scéno)', 'Équipe Sommelier'],
    milestones: [
      { id: 'm-21', title: 'Sélection et privatisation de l\'espace patrimonial', done: true, dueDate: 'Octobre 2026' },
      { id: 'm-22', title: 'Validation du menu 7 temps et des accords', done: true, dueDate: 'Octobre 2026' },
      { id: 'm-23', title: 'Envoi des invitations VIP aux 50 convives', done: false, dueDate: 'Début Nov 2026' },
      { id: 'm-24', title: 'Service et captation éditoriale', done: false, dueDate: '28 Nov 2026' },
    ],
  },
  {
    id: 'proj-3',
    title: 'Refonte de l\'Identité Visuelle & Studio Web',
    category: 'Direction Artistique',
    description: 'Modernisation intégrale des supports, typographies et plateformes numériques vers une esthétique minimaliste.',
    progress: 90,
    status: 'en_cours',
    deadline: '25 Octobre 2026',
    budget: '32 000 €',
    team: ['Studio Pilote', 'Directeur Artistique'],
    milestones: [
      { id: 'm-31', title: 'Définition du manifeste de marque & charte', done: true, dueDate: 'Août 2026' },
      { id: 'm-32', title: 'Maquettes interactives et design system', done: true, dueDate: 'Sept 2026' },
      { id: 'm-33', title: 'Recette technique et animations de transition', done: true, dueDate: 'Oct 2026' },
      { id: 'm-34', title: 'Mise en ligne finale et annonces', done: false, dueDate: '25 Oct 2026' },
    ],
  },
];

export const ProjectsView: React.FC<ProjectsViewProps> = ({ onOpenChatWithPrompt }) => {
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [filter, setFilter] = useState<'all' | 'en_cours' | 'termine'>('all');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newDeadline, setNewDeadline] = useState('');

  const toggleMilestone = (projectId: string, milestoneId: string) => {
    setProjects(prev => prev.map(p => {
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
        status: newProgress === 100 ? 'termine' : 'en_cours',
      };
    }));
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

    setProjects([newProj, ...projects]);
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
    <div className="w-full max-w-5xl mx-auto px-4 pt-20 md:pt-24 pb-28 md:pb-16 animate-in fade-in duration-300">
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

      {/* Project Cards Grid */}
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

              <button
                type="button"
                onClick={() => onOpenChatWithPrompt(`Faisons un point sur le projet "${project.title}". Quels sont les prochains obstacles et recommandations pour tenir l'échéance du ${project.deadline} ?`)}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 hover:text-sky-700 transition-colors cursor-pointer"
              >
                <span>Demander une analyse détaillée</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

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
