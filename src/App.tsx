import React, { useState, useEffect } from 'react';
import { Copy, RefreshCw, Save, Search, ChevronRight, ChevronLeft } from 'lucide-react';
import { collection, addDoc, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import { db } from './firebase';
import toast, { Toaster } from 'react-hot-toast';

// Garder toutes les constantes (FIRST_NAMES, LAST_NAMES, etc.) et les fonctions utilitaires...
[...previous constants and utility functions remain exactly the same...]

function App() {
  const [identity, setIdentity] = useState({
    gaming: {
      username: generateGamingUsername(),
      password: generateSimplePassword(),
    },
    real: {
      firstName: getRandomElement(FIRST_NAMES),
      lastName: getRandomElement(LAST_NAMES),
    }
  });

  const [savedIdentities, setSavedIdentities] = useState<SavedIdentity[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [saveName, setSaveName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);

  useEffect(() => {
    loadRecentIdentities();
  }, []);

  // Garder toutes les fonctions existantes (loadRecentIdentities, searchIdentities, etc.)...
  [...previous functions remain exactly the same...]

  const loadIdentity = (saved: SavedIdentity) => {
    setIdentity({
      gaming: saved.gaming,
      real: saved.real
    });
    toast.success('Identité chargée !');
    if (window.innerWidth < 768) {
      setShowSidebar(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-300/90 via-indigo-300/90 to-purple-400/90 animate-gradient relative overflow-hidden">
      <Toaster position="top-right" />
      <div className="wave" />
      <div className="relative w-full max-w-7xl mx-auto min-h-screen flex flex-col justify-center p-4">
        <div className="text-center mb-12">
          <h1 className="text-7xl font-bold text-white mb-4 drop-shadow-lg">
            Générateur d'Identité
          </h1>
          <p className="text-white/90 text-xl font-medium">
            Générez une identité complète en un clic
          </p>
        </div>
        
        <div className="relative flex gap-8">
          <div className="flex-1">
            <div className="bg-white/10 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-white/20 mb-8">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-white drop-shadow-md">
                  Identité Gaming
                </h2>
                <div className="text-white/80 font-medium">
                  {(GAMING_PREFIXES.length * GAMING_SUFFIXES.length * GAMING_CONNECTORS.length * NUMBERS.length).toLocaleString()} combinaisons
                </div>
              </div>
              <CopyableField label="Pseudonyme" value={identity.gaming.username} />
              <CopyableField label="Mot de passe" value={identity.gaming.password} />
            </div>

            <div className="bg-white/10 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-white/20">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-white drop-shadow-md">
                  Identité Réelle
                </h2>
                <div className="text-white/80 font-medium">
                  {(FIRST_NAMES.length * LAST_NAMES.length).toLocaleString()} combinaisons
                </div>
              </div>
              <CopyableField label="Prénom" value={identity.real.firstName} />
              <CopyableField label="Nom" value={identity.real.lastName} />
            </div>

            <div className="mt-8 flex gap-4 justify-center">
              <button
                onClick={regenerateAll}
                className="inline-flex items-center px-8 py-4 bg-white/10 hover:bg-white/20 text-white text-xl font-bold rounded-2xl transition-all duration-300 gap-3 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 backdrop-blur-sm border border-white/20"
              >
                <RefreshCw size={24} />
                Générer
              </button>
              <button
                onClick={() => setShowSaveDialog(true)}
                className="inline-flex items-center px-8 py-4 bg-white/10 hover:bg-white/20 text-white text-xl font-bold rounded-2xl transition-all duration-300 gap-3 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 backdrop-blur-sm border border-white/20"
              >
                <Save size={24} />
                Sauvegarder
              </button>
            </div>
          </div>

          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="fixed right-4 top-1/2 -translate-y-1/2 z-10 md:relative md:right-0 md:top-0 md:translate-y-0 bg-white/10 hover:bg-white/20 text-white rounded-l-xl md:rounded-xl p-2 transition-colors backdrop-blur-sm border border-white/20"
          >
            {showSidebar ? <ChevronRight size={24} /> : <ChevronLeft size={24} />}
          </button>

          <div className={`fixed right-0 top-0 h-full w-full md:w-96 bg-white/10 backdrop-blur-md p-8 shadow-2xl border-l border-white/20 transition-transform duration-300 transform ${showSidebar ? 'translate-x-0' : 'translate-x-full'} z-[5]`}>
            <h2 className="text-3xl font-bold text-white drop-shadow-md mb-8">
              Identités Sauvegardées
            </h2>
            
            <div className="flex gap-2 mb-6">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher une identité..."
                className="flex-1 p-4 rounded-l bg-white/10 backdrop-blur-sm text-white border border-white/20"
              />
              <button
                onClick={searchIdentities}
                className="px-6 py-4 bg-white/20 text-white rounded-r hover:bg-white/30 transition-colors"
              >
                <Search size={24} />
              </button>
            </div>

            <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-16rem)]">
              {savedIdentities.map((saved) => (
                <button
                  key={saved.id}
                  onClick={() => loadIdentity(saved)}
                  className="w-full text-left bg-white/10 p-4 rounded-xl border border-white/20 hover:bg-white/20 transition-colors"
                >
                  <h3 className="text-xl font-bold text-white mb-2">{saved.name}</h3>
                  <p className="text-white/80">
                    Gaming: {saved.gaming.username}
                  </p>
                  <p className="text-white/80">
                    Réel: {saved.real.firstName} {saved.real.lastName}
                  </p>
                  <p className="text-sm text-white/60 mt-2">
                    Sauvegardé le: {saved.createdAt.toLocaleDateString()}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-20">
          <div className="bg-white/10 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-white/20 max-w-md w-full mx-4">
            <h3 className="text-2xl font-bold text-white mb-4">Sauvegarder l'identité</h3>
            <input
              type="text"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              placeholder="Nom de l'identité..."
              className="w-full p-4 rounded bg-white/10 backdrop-blur-sm text-white border border-white/20 mb-4"
            />
            <div className="flex gap-4 justify-end">
              <button
                onClick={() => setShowSaveDialog(false)}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={saveIdentity}
                className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl transition-colors"
              >
                Sauvegarder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;