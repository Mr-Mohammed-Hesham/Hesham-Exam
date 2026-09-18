import React from "react";
import { History, X, Trash2, ArrowRight, FileCheck, Calendar, Clock, CloudCheck, User } from "lucide-react";
import { GenerationHistoryItem } from "../types";

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: GenerationHistoryItem[];
  onSelect: (item: GenerationHistoryItem) => void;
  onClear: () => void;
  onDeleteOne: (id: string) => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  history,
  onSelect,
  onClear,
  onDeleteOne,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <History className="w-5 h-5 text-amber-400" />
            <span>سجل الامتحانات السحابي (Cloud Firestore)</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-amber-400 font-semibold border border-slate-700">
              {history.length} امتحان
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content list */}
        <div className="p-5 overflow-y-auto flex-1 space-y-3">
          {history.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <FileCheck className="w-12 h-12 mx-auto text-slate-600 opacity-60" />
              <p className="text-sm font-semibold text-slate-300">
                لا توجد امتحانات محفوظة في Firestore حالياً
              </p>
              <p className="text-xs text-slate-400">
                عند توليد أي امتحان جديد بواسطة حسابك المعتمد، سيتم حفظه تلقائياً في قاعدة بيانات Firestore.
              </p>
            </div>
          ) : (
            history.map((item) => {
              const dateStr = new Date(item.timestamp).toLocaleString("ar-EG", {
                dateStyle: "medium",
                timeStyle: "short",
              });

              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 rounded-xl border border-slate-800 bg-slate-950/60 hover:border-amber-500/40 hover:bg-slate-800/40 transition group"
                >
                  <div className="min-w-0 flex-1 pl-3">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-100 group-hover:text-amber-300 transition truncate">
                        {item.title}
                      </h4>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30">
                        Firestore
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 mt-1.5">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{dateStr}</span>
                      </span>
                      <span>•</span>
                      <span className="text-amber-400 font-semibold">
                        {item.questionsCount} أسئلة
                      </span>
                      {item.creatorEmail && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-slate-400 truncate max-w-[180px]">
                            <User className="w-3 h-3 text-slate-500" />
                            <span>{item.creatorEmail}</span>
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        onSelect(item);
                        onClose();
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-xs transition cursor-pointer"
                    >
                      <span>عرض</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`هل أنت متأكد من حذف امتحان "${item.title}" نهائياً من Firestore؟`)) {
                          onDeleteOne(item.id);
                        }
                      }}
                      className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition cursor-pointer"
                      title="حذف هذا الامتحان من Firestore"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
};
