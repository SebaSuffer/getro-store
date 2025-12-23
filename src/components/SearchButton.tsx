import { useState } from 'react';
import SearchModal from './SearchModal';

const SearchButton = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsSearchOpen(true)}
        className="hidden md:flex size-10 items-center justify-center text-white/80 hover:text-white transition-colors" 
        aria-label="Buscar"
      >
        <span className="material-symbols-outlined" style={{ fontSize: '20px', fontWeight: 300 }}>search</span>
      </button>
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};

export default SearchButton;

