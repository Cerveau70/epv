
import React from 'react';
import { ArrowLeft, ArrowRight, UserPlus, FileText, Phone, MapPin, Layers } from 'lucide-react';
import { Prospect, StatutProspect } from '../../types.js';

interface KanbanBoardProps {
  prospects: Prospect[];
  onStatusChange: (id: string, newStatut: StatutProspect) => void;
  id?: string;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ prospects, onStatusChange, id }) => {
  // Define columns
  const columns = [
    { title: "Prospects", key: StatutProspect.PROSPECT, color: "border-brand-blue-light bg-[#F0F7FF]" },
    { title: "Pré-inscrits", key: StatutProspect.PRE_INSCRIT, color: "border-brand-gold bg-[#FFFBEB]" },
    { title: "Inscrits Confirmés", key: StatutProspect.INSCRIT, color: "border-brand-green bg-[#F0FDF4]" },
    { title: "Archivés", key: StatutProspect.ARCHIVE, color: "border-brand-border bg-brand-pale" }
  ];

  const getFiltered = (statut: StatutProspect) => {
    return prospects.filter((p) => p.statut === statut);
  };

  const handleMoveLeft = (prospect: Prospect) => {
    if (prospect.statut === StatutProspect.PRE_INSCRIT) {
      onStatusChange(prospect.id, StatutProspect.PROSPECT);
    } else if (prospect.statut === StatutProspect.INSCRIT) {
      onStatusChange(prospect.id, StatutProspect.PRE_INSCRIT);
    } else if (prospect.statut === StatutProspect.ARCHIVE) {
      onStatusChange(prospect.id, StatutProspect.PROSPECT);
    }
  };

  const handleMoveRight = (prospect: Prospect) => {
    if (prospect.statut === StatutProspect.PROSPECT) {
      onStatusChange(prospect.id, StatutProspect.PRE_INSCRIT);
    } else if (prospect.statut === StatutProspect.PRE_INSCRIT) {
      onStatusChange(prospect.id, StatutProspect.INSCRIT);
    } else if (prospect.statut === StatutProspect.INSCRIT) {
      onStatusChange(prospect.id, StatutProspect.ARCHIVE);
    }
  };

  return (
    <div id={id} className="relative overflow-x-auto pb-4 no-scrollbar">
      {/* Scrollable multi-columns setup */}
      <div className="flex gap-4 min-w-[900px] select-none">
        {columns.map((column) => {
          const colProspects = getFiltered(column.key);

          return (
            <div
              key={column.key}
              className={`flex-1 flex flex-col rounded-xl border border-brand-border/80 shadow-premium p-4 ${column.color} min-h-[500px] h-[550px] overflow-y-auto`}
            >
              {/* Header metrics */}
              <div className="flex items-center justify-between mb-4 border-b border-brand-border/40 pb-2">
                <span className="font-sans font-bold text-sm text-brand-blue-deep">
                  {column.title}
                </span>
                <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-white border border-brand-border/50 text-brand-blue-medium font-bold">
                  {colProspects.length}
                </span>
              </div>

              {/* Cards block */}
              <div className="space-y-3 flex-1 overflow-y-auto pr-1 no-scrollbar">
                {colProspects.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 opacity-40 text-center">
                    <Layers size={24} className="mb-2 text-brand-blue-deep" />
                    <span className="text-[10px] uppercase font-bold text-brand-muted tracking-wider">Aucun dossier</span>
                  </div>
                ) : (
                  colProspects.map((prospect) => (
                    <div
                      key={prospect.id}
                      className="bg-white border border-brand-border/50 rounded-lg p-3 shadow-sm hover:shadow-md transition-all duration-300"
                    >
                      {/* Name of Child */}
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-sans font-bold text-xs text-brand-blue-deep">
                          {prospect.prenomEnfant} {prospect.nomEnfant}
                        </span>
                        <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded bg-brand-blue-deep/5 text-brand-blue-deep leading-none border border-brand-blue-deep/10">
                          {prospect.sectionVisee}
                        </span>
                      </div>

                      {/* Parent details snippet */}
                      <div className="space-y-1.5 text-[10px] text-brand-muted mb-3 leading-normal font-serif">
                        <p className="flex items-center gap-1">
                          <UserPlus size={10} className="text-brand-gold shrink-0" />
                          <span>{prospect.prenomParent} {prospect.nomParent} ({prospect.lienParente})</span>
                        </p>
                        <p className="flex items-center gap-1 font-mono text-[9px]">
                          <Phone size={10} className="text-brand-blue-light shrink-0" />
                          <span>{prospect.telephone}</span>
                        </p>
                        <p className="flex items-center gap-1">
                          <MapPin size={10} className="text-brand-green shrink-0" />
                          <span>{prospect.commune}</span>
                        </p>
                        {prospect.notesAdmin && (
                          <div className="bg-brand-pale p-1.5 rounded text-[9px] text-brand-dark/80 italic font-sans max-h-12 overflow-hidden text-ellipsis">
                            {prospect.notesAdmin}
                          </div>
                        )}
                      </div>

                      {/* Action buttons inside card */}
                      <div className="flex justify-between items-center border-t border-brand-border/50 pt-2 shrink-0">
                        <button
                          title="Faire reculer le dossier"
                          disabled={column.key === StatutProspect.PROSPECT}
                          onClick={() => handleMoveLeft(prospect)}
                          className="p-1 rounded bg-brand-pale text-brand-muted hover:text-brand-blue-deep disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                        >
                          <ArrowLeft size={12} />
                        </button>
                        <span />
                        <button
                          title="Faire avancer le dossier"
                          disabled={column.key === StatutProspect.ARCHIVE}
                          onClick={() => handleMoveRight(prospect)}
                          className="p-1 rounded bg-brand-pale text-brand-muted hover:text-brand-blue-deep disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                        >
                          <ArrowRight size={12} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
