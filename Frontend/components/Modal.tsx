import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center p-4">
      <div className="bg-smartfix-dark w-full max-w-lg rounded-xl shadow-2xl border border-smartfix-medium transform transition-all duration-300" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center p-6 border-b border-smartfix-dark">
          <h3 className="text-2xl font-bold text-smartfix-lightest">{title}</h3>
          <button onClick={onClose} className="text-smartfix-light hover:text-smartfix-lightest transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;