'use client';

import React, { useEffect, useRef } from 'react';
import ClientPortal from './ClientPortal';

interface ExampleModalProps {
  isOpen: boolean;
  title: string;
  content: string | null;
  onClose: () => void;
}

const ExampleModal: React.FC<ExampleModalProps> = ({
  isOpen,
  title,
  content,
  onClose,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Focus on the close button when modal opens
  useEffect(() => {
    if (isOpen && closeButtonRef.current) {
      closeButtonRef.current.focus();
    }
  }, [isOpen]);

  // Handle escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden'; // Prevent scrolling behind modal
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = ''; // Restore scrolling
    };
  }, [isOpen, onClose]);

  // Handle click outside modal
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      // Use setTimeout to avoid triggering immediately after opening
      const timeoutId = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 100);

      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen, onClose]);

  // Don't render anything if not open
  if (!isOpen) return null;

  return (
    <ClientPortal>
      <div 
        className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center animate-fadeIn"
        aria-modal="true"
        role="dialog"
        aria-labelledby="modal-title"
      >
      {/* Backdrop with animation */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 animate-fadeIn"
        style={{ backdropFilter: 'blur(2px)' }}
      />
      
      {/* Modal content with animation */}
      <div
        ref={modalRef}
        className="relative bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto m-4 shadow-xl animate-slideIn"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 id="modal-title" className="text-lg font-semibold">Example Output: {title}</h3>
          <button 
            ref={closeButtonRef}
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Close modal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <div className="bg-gray-50 border border-gray-200 rounded-md p-4 text-sm text-gray-700 overflow-y-auto">
          {content ? (
            <pre className="whitespace-pre-wrap">{content}</pre>
          ) : (
            <p className="text-gray-500 italic">No example output available</p>
          )}
        </div>
      </div>
      </div>
    </ClientPortal>
  );
};

export default ExampleModal;
