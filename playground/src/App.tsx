import { useState, useRef, useEffect, KeyboardEvent } from 'react';

const Disclosure = ({ title, content }: { title: string; content: string }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  return (
    <div className="mb-4 border p-2">
      <button
        aria-expanded={isOpen}
        aria-controls="disclosure-content"
        id="disclosure-header"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left font-bold"
      >
        {title} {isOpen ? '[-]' : '[+]'}
      </button>
      <div
        id="disclosure-content"
        role="region"
        aria-labelledby="disclosure-header"
        hidden={!isOpen}
        className="mt-2"
      >
        {content}
      </div>
    </div>
  );
};

const Modal = ({ isOpen, onClose, children }: { isOpen: boolean; onClose: () => void; children: React.ReactNode }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      modalRef.current?.focus();
    } else {
      previousFocusRef.current?.focus();
    }
  }, [isOpen]);

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'Tab' && modalRef.current) {
      const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        ref={modalRef}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        className="bg-white p-6 rounded shadow-lg max-w-sm w-full outline-none"
      >
        {children}
        <button onClick={onClose} className="mt-4 bg-red-500 text-white px-4 py-2 rounded">
          Close
        </button>
      </div>
    </div>
  );
};

const Tabs = ({ tabs }: { tabs: { id: string; label: string; content: string }[] }) => {
  const [activeTab, setActiveTab] = useState<number>(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let newIndex = index;
    if (e.key === 'ArrowRight') {
      newIndex = (index + 1) % tabs.length;
    } else if (e.key === 'ArrowLeft') {
      newIndex = (index - 1 + tabs.length) % tabs.length;
    }
    if (newIndex !== index) {
      setActiveTab(newIndex);
      tabRefs.current[newIndex]?.focus();
    }
  };

  return (
    <div className="mb-8">
      <div role="tablist" aria-label="Sample Tabs" className="flex gap-2 border-b">
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            ref={(el) => { tabRefs.current[index] = el; }}
            role="tab"
            aria-selected={activeTab === index}
            aria-controls={`panel-${tab.id}`}
            id={`tab-${tab.id}`}
            tabIndex={activeTab === index ? 0 : -1}
            onClick={() => setActiveTab(index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={`px-4 py-2 ${activeTab === index ? 'border-b-2 border-blue-500 font-bold' : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {tabs.map((tab, index) => (
        <div
          key={tab.id}
          id={`panel-${tab.id}`}
          role="tabpanel"
          aria-labelledby={`tab-${tab.id}`}
          hidden={activeTab !== index}
          tabIndex={0}
          className="p-4 border border-t-0"
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
};

export default function App() {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">A11y Playground (FE-05)</h1>
      
      <h2 className="text-xl font-semibold mb-2">1. Disclosure</h2>
      <Disclosure title="Click to expand details" content="This is the hidden content accessible via keyboard (Enter/Space)." />

      <h2 className="text-xl font-semibold mb-2 mt-6">2. Tabs</h2>
      <Tabs tabs={[
        { id: 't1', label: 'Tab 1', content: 'Content for Tab 1. Use arrow keys to navigate.' },
        { id: 't2', label: 'Tab 2', content: 'Content for Tab 2. Focus is managed automatically.' }
      ]} />

      <h2 className="text-xl font-semibold mb-2 mt-6">3. Modal</h2>
      <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded">
        Open Accessible Modal
      </button>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <h2 id="modal-title" className="text-lg font-bold">Modal Title</h2>
        <p className="mt-2">Try pressing Tab. The focus is trapped inside this modal until you close it via the button or the Escape key.</p>
      </Modal>
    </div>
  );
}