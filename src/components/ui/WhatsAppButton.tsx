
import React, { useState, useEffect } from 'react';
import { MessageSquare, X } from 'lucide-react';

export const WhatsAppButton: React.FC = () => {
  const [showBubble, setShowBubble] = useState(false);

  // Trigger bubble help hint after short delay, then auto-dismiss almost instantly
  useEffect(() => {
    const showTimer = setTimeout(() => {
      setShowBubble(true);
      const hideTimer = setTimeout(() => setShowBubble(false), 10);
      return () => clearTimeout(hideTimer);
    }, 4000);
    return () => clearTimeout(showTimer);
  }, []);

  const whatsappUrl = "https://wa.me/2250778981456?text=Bonjour%20EPV%20Horizons%20Savants%2C%20je%20souhaite%20des%20renseignements%20pour%20la%20rentr%C3%A9e%202026.";

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end pointer-events-none" id="whatsapp-float-widget">
      {/* Interactive Floating Help Tooltip */}
      {showBubble && (
        <div className="mb-3 bg-white text-brand-dark px-4 py-3 rounded-xl border border-brand-border/80 shadow-premium max-w-xs flex gap-3 items-start animate-slide-up pointer-events-auto" id="whatsapp-tooltip">
          <div className="flex-1 text-xs leading-normal">
            <span className="font-sans font-bold text-brand-blue-deep block mb-0.5 font-sans">Besoin d'aide ? 🇨🇮</span>
            Discutez en direct avec nous:<br />
            <strong>07 78 98 14 56</strong> ou <strong>05 85 41 51 51</strong>
          </div>
          <button
            onClick={() => setShowBubble(false)}
            className="text-brand-muted hover:text-brand-dark p-0.5 rounded cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Floating Action Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => setShowBubble(false)}
        className="text-white bg-green-500 hover:bg-green-600 w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:shadow-premium-lg transition-all duration-300 transform hover:scale-105 active:scale-95 bubble-pulse cursor-pointer pointer-events-auto"
        aria-label="Contacter l'école via WhatsApp"
      >
        {/* Custom SVG inside Lucide block or Standard Lucide message-square */}
        <MessageSquare size={26} strokeWidth={2.4} />
        <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-red-500 hover:bg-red-600 border-2 border-white rounded-full animate-ping" />
        <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-red-500 hover:bg-red-600 border-2 border-white rounded-full" />
      </a>
    </div>
  );
};
