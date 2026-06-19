
import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface AccordionItem {
  title: string;
  content: React.ReactNode;
}

interface AccordionProps {
  items: AccordionItem[];
  id?: string;
}

export const Accordion: React.FC<AccordionProps> = ({ items, id }) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleItem = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div id={id} className="space-y-3">
      {items.map((item, index) => {
        const isOpen = activeIndex === index;
        return (
          <div
            key={index}
            className="border border-brand-border rounded-xl bg-white overflow-hidden shadow-sm transition-all duration-300"
          >
            <button
              onClick={() => toggleItem(index)}
              className="w-full flex items-center justify-between px-6 py-4 text-left font-sans font-medium text-brand-blue-deep hover:bg-brand-pale/50 transition-colors cursor-pointer"
            >
              <span>{item.title}</span>
              <ChevronDown
                size={18}
                className={`text-brand-gold transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
              />
            </button>
            <div
              className={`transition-all duration-300 ease-in-out ${
                isOpen ? 'max-h-[500px] border-t border-brand-border opacity-100 py-4 px-6' : 'max-h-0 opacity-0 overflow-hidden'
              }`}
            >
              <div className="text-sm text-brand-dark/90 leading-relaxed font-serif">
                {item.content}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
