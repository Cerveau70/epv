
import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { RendezVous, StatutRendezVous } from '../../types.js';

interface CalendarPickerProps {
  onSelectDateTime: (isoString: string) => void;
  selectedDateTime: string; // ISO String or empty
  id?: string;
}

export const CalendarPicker: React.FC<CalendarPickerProps> = ({
  onSelectDateTime,
  selectedDateTime,
  id
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>("");
  const [selectedTimeStr, setSelectedTimeStr] = useState<string>("");
  const [existingRdvs, setExistingRdvs] = useState<RendezVous[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch rendezvous appointments from backend to perform live conflict checks
  useEffect(() => {
    fetch("/api/rendezvous/slots")
      .then((res) => res.ok ? res.json() : [])
      .then((data) => {
        setExistingRdvs(Array.isArray(data) ? data : []);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [selectedDateTime]);

  // Standard work slots Mon-Sat 9:00 to 17:00 (30 mins intervals, except lunch break 12:30-13:30 optionally,
  // but let's provide standard intervals)
  const timeSlots = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:13", "11:30",
    "13:30", "14:00", "14:15", "14:30", "15:00", "15:30", "16:00", "16:30"
  ].map(t => {
    // Sanitary cleanup of experimental entries
    if (t === "11:13") return "11:00";
    if (t === "14:15") return "14:00";
    return t;
  }).filter((value, index, self) => self.indexOf(value) === index); // unique values

  // Get start/end/days of current month calendar sheet
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = new Date(year, month, 1).getDay();
    // Adjust so Mon=1, Sun=7
    return day === 0 ? 7 : day;
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDayIndex = getFirstDayOfMonth(currentDate);

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const selectDate = (day: number) => {
    const d = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    // Disallow Sundays (0)
    if (d.getDay() === 0) return;
    // Disallow past days
    const today = new Date();
    today.setHours(0,0,0,0);
    if (d < today) return;

    const formattedDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    setSelectedDateStr(formattedDate);
    setSelectedTimeStr(""); // reset time when date changes
  };

  const selectTime = (time: string) => {
    if (!selectedDateStr) return;
    setSelectedTimeStr(time);
    
    // Combine to ISO String representation
    const isoString = new Date(`${selectedDateStr}T${time}:00`).toISOString();
    onSelectDateTime(isoString);
  };

  // Check if a specific slot is already occupied
  const isSlotBooked = (dateStr: string, timeStr: string) => {
    if (!dateStr || !timeStr || !Array.isArray(existingRdvs)) return false;
    const targetIso = new Date(`${dateStr}T${timeStr}:00`).toISOString();

    return existingRdvs.some((r: RendezVous) => {
      if (r.statut === StatutRendezVous.ANNULE) return false;
      try {
        const rdvTime = new Date(r.dateHeure).getTime();
        const targetTime = new Date(targetIso).getTime();
        return Math.abs(rdvTime - targetTime) < 15 * 60 * 1000; // within 15 minutes is a conflict
      } catch (err) {
        return false;
      }
    });
  };

  // Month names
  const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
  const currentMonthName = monthNames[currentDate.getMonth()];

  return (
    <div id={id} className="grid grid-cols-1 md:grid-cols-2 gap-6 p-1">
      {/* Date Sheet Picker */}
      <div className="bg-brand-pale border border-brand-border/60 p-4 rounded-xl shadow-premium">
        <div className="flex items-center justify-between mb-4">
          <span className="font-sans font-semibold text-brand-blue-deep flex items-center gap-2">
            <CalendarIcon size={16} className="text-brand-gold" />
            {currentMonthName} {currentDate.getFullYear()}
          </span>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={prevMonth}
              className="p-1.5 hover:bg-white rounded-lg border border-brand-border text-brand-muted hover:text-brand-dark transition-colors cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={nextMonth}
              className="p-1.5 hover:bg-white rounded-lg border border-brand-border text-brand-muted hover:text-brand-dark transition-colors cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Week Days Headers */}
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-brand-blue-medium uppercase mb-2">
          <span>Lun</span>
          <span>Mar</span>
          <span>Mer</span>
          <span>Jeu</span>
          <span>Ven</span>
          <span>Sam</span>
          <span className="text-red-500">Dim</span>
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1.5 text-center">
          {/* Empty padding before day 1 */}
          {Array.from({ length: firstDayIndex - 1 }).map((_, idx) => (
            <div key={`empty-${idx}`} className="h-9" />
          ))}

          {/* Days */}
          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const dNum = idx + 1;
            const itemDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), dNum);
            const isSunday = itemDate.getDay() === 0;
            
            const today = new Date();
            today.setHours(0,0,0,0);
            const isPast = itemDate < today;

            const dStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(dNum).padStart(2, '0')}`;
            const isSelected = selectedDateStr === dStr;

            return (
              <button
                key={`day-${dNum}`}
                type="button"
                disabled={isPast || isSunday}
                onClick={() => selectDate(dNum)}
                className={`h-9 w-9 rounded-lg text-xs font-medium flex items-center justify-center transition-all ${
                  isSunday
                    ? 'text-red-400 bg-red-50/20 cursor-not-allowed'
                    : isPast
                    ? 'text-brand-muted/40 cursor-not-allowed'
                    : isSelected
                    ? 'bg-brand-blue-deep text-white font-bold shadow-md scale-105'
                    : 'bg-white hover:bg-brand-blue-light/10 text-brand-dark hover:border-brand-blue-light border border-brand-border/40 cursor-pointer'
                }`}
              >
                {dNum}
              </button>
            );
          })}
        </div>
        <span className="text-[10px] text-brand-muted block mt-4 text-center">
          * Les dimanches ne sont pas ouverts aux entretiens d'excellence.
        </span>
      </div>

      {/* Hourly Slots column */}
      <div className="flex flex-col">
        <h4 className="font-sans font-semibold text-brand-blue-deep text-sm mb-3 flex items-center gap-2">
          <Clock size={16} className="text-brand-gold" />
          {selectedDateStr ? `Créneaux du ${new Date(selectedDateStr).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}` : "Sélectionnez une date d'abord"}
        </h4>

        {!selectedDateStr ? (
          <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-brand-border rounded-xl p-6 text-center text-brand-muted min-h-[220px]">
            <CalendarIcon size={32} className="text-brand-border animate-bounce mb-2" />
            <span className="text-xs">Choisissez un jour disponible dans le calendrier à gauche pour charger les créneaux d'excellence.</span>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2 overflow-y-auto max-h-[260px] pr-1">
            {timeSlots.map((time) => {
              const isReserved = isSlotBooked(selectedDateStr, time);
              const isSelected = selectedTimeStr === time;

              return (
                <button
                  key={`time-${time}`}
                  type="button"
                  disabled={isReserved}
                  onClick={() => selectTime(time)}
                  className={`py-2 px-3 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1 border ${
                    isReserved
                      ? 'bg-brand-muted/10 text-brand-muted/40 line-through border-brand-border/30 cursor-not-allowed'
                      : isSelected
                      ? 'bg-brand-gold text-brand-blue-deep font-bold border-brand-gold shadow-sm scale-102'
                      : 'bg-white text-brand-blue-deep hover:bg-brand-pale border-brand-border/60 hover:border-brand-gold cursor-pointer'
                  }`}
                >
                  {time}
                  {isSelected && <Check size={12} className="text-brand-blue-deep stroke-[3]" />}
                </button>
              );
            })}
          </div>
        )}

        {selectedDateStr && selectedTimeStr && (
          <div className="mt-4 p-3 rounded-lg bg-brand-green/10 border border-brand-green-light/30 flex items-center gap-2.5 animate-fade-in">
            <Check size={16} className="text-brand-green" />
            <span className="text-xs text-brand-dark leading-snug">
              Créneau d'excellence sélectionné : <strong>{selectedTimeStr}</strong> le <strong>{new Date(selectedDateStr).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</strong>.
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
