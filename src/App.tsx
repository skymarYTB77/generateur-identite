import React, { useState, useEffect } from 'react';
import { Copy, RefreshCw, Save, Search, ChevronRight, ChevronLeft, Trash2, LogIn, LogOut } from 'lucide-react';
import { collection, addDoc, query, orderBy, limit, getDocs, where, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { db, auth } from './firebase';
import toast, { Toaster } from 'react-hot-toast';

// Constants for generating identities
const GAMING_PREFIXES = ['Dark', 'Shadow', 'Crystal', 'Star', 'Dragon', 'Ghost', 'Storm', 'Fire', 'Ice', 'Thunder'];
const GAMING_SUFFIXES = ['Hunter', 'Slayer', 'Master', 'Knight', 'Lord', 'Warrior', 'King', 'Queen', 'Legend', 'Phoenix'];
const GAMING_CONNECTORS = ['Of', 'The', '', 'X', '_'];
const NUMBERS = ['', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

const FIRST_NAMES = ['Emma', 'Lucas', 'Léa', 'Hugo', 'Chloé', 'Louis', 'Jade', 'Gabriel', 'Louise', 'Raphaël'];
const LAST_NAMES = ['Martin', 'Bernard', 'Thomas', 'Petit', 'Robert', 'Richard', 'Durand', 'Dubois', 'Moreau', 'Laurent'];

interface SavedIdentity {
  id: string;
  name: string;
  gaming: {
    username: string;
    password: string;
  };
  real: {
    firstName: string;
    lastName: string;
  };
  createdAt: Date;
  userId: string;
}

// Utility functions
const getRandomElement = <T,>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

const generateGamingUsername = (): string => {
  const prefix = getRandomElement(GAMING_PREFIXES);
  const suffix = getRandomElement(GAMING_SUFFIXES);
  const connector = getRandomElement(GAMING_CONNECTORS);
  const number = getRandomElement(NUMBERS);
  return `${prefix}${connector}${suffix}${number}`;
};

const generateSimplePassword = (): string => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

const CopyableField = ({ label, value }: { label: string; value: string }) => {
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success('Copié !');
    } catch (err) {
      toast.error('Erreur lors de la copie');
    }
  };

  return (
    <div className="mb-6">
      <label className="block text-white/80 font-medium mb-2">{label}</label>
      <div className="flex">
        <div className="flex-1 bg-white/10 rounded-l p-4 text-white">
          {value}
        </div>
        <button
          onClick={copyToClipboard}
          className="px-6 py-4 bg-white/20 text-white rounded-r hover:bg-white/30 transition-colors"
        >
          <Copy size={24} />
        </button>
      </div>
    </div>
  );
};

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
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        loadRecentIdentities();
      } else {
        setSavedIdentities([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const loadRecentIdentities = async () => {
    if (!auth.currentUser) {
      setSavedIdentities([]);
      return;
    }

    try {
      const identitiesRef = collection(db, 'identities');
      const q = query(
        identitiesRef,
        where('userId', '==', auth.currentUser.uid),
        orderBy('createdAt', 'desc'),
        limit(10)
      );
      const querySnapshot = await getDocs(q);
      const identities = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt)
        };
      }) as SavedIdentity[];
      setSavedIdentities(identities);
    } catch (error) {
      console.error('Error loading identities:', error);
      toast.error('Erreur lors du chargement des identités');
    }
  };

  const searchIdentities = async () => {
    if (!auth.currentUser) return;
    
    if (!searchTerm.trim()) {
      await loadRecentIdentities();
      return;
    }

    try {
      const identitiesRef = collection(db, 'identities');
      const q = query(
        identitiesRef,
        where('userId', '==', auth.currentUser.uid),
        where('name', '>=', searchTerm),
        where('name', '<=', searchTerm + '\uf8ff'),
        limit(10)
      );
      const querySnapshot = await getDocs(q);
      const identities = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt)
        };
      }) as SavedIdentity[];
      setSavedIdentities(identities);
    } catch (error) {
      console.error('Error searching identities:', error);
      toast.error('Erreur lors de la recherche');
    }
  };

  const saveIdentity = async () => {
    if (!auth.currentUser) {
      toast.error('Veuillez vous connecter pour sauvegarder une identité');
      return;
    }

    if (!saveName.trim()) {
      toast.error('Veuillez entrer un nom pour l\'identité');
      return;
    }

    try {
      const identitiesRef = collection(db, 'identities');
      await addDoc(identitiesRef, {
        name: saveName,
        gaming: identity.gaming,
        real: identity.real,
        createdAt: new Date(),
        userId: auth.currentUser.uid
      });
      
      setShowSaveDialog(false);
      setSaveName('');
      toast.success('Identité sauvegardée !');
      await loadRecentIdentities();
    } catch (error) {
      console.error('Error saving identity:', error);
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const deleteIdentity = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'identities', id));
      toast.success('Identité supprimée !');
      await loadRecentIdentities();
    } catch (error) {
      console.error('Error deleting identity:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleAuth = async () => {
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
        toast.success('Compte créé avec succès !');
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success('Connexion réussie !');
      }
      setShowAuthDialog(false);
      setEmail('');
      setPassword('');
      await loadRecentIdentities();
    } catch (error) {
      console.error('Auth error:', error);
      toast.error(isSignUp ? 'Erreur lors de la création du compte' : 'Erreur lors de la connexion');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast.success('Déconnexion réussie !');
      setSavedIdentities([]);
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Erreur lors de la déconnexion');
    }
  };

  const regenerateAll = () => {
    setIdentity({
      gaming: {
        username: generateGamingUsername(),
        password: generateSimplePassword(),
      },
      real: {
        firstName: getRandomElement(FIRST_NAMES),
        lastName: getRandomElement(LAST_NAMES),
      }
    });
  };

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

        <div className="absolute top-4 right-4">
          {auth.currentUser ? (
            <button
              onClick={handleSignOut}
              className="inline-flex items-center px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors gap-2 backdrop-blur-sm border border-white/20"
            >
              <LogOut size={20} />
              Déconnexion
            </button>
          ) : (
            <button
              onClick={() => setShowAuthDialog(true)}
              className="inline-flex items-center px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors gap-2 backdrop-blur-sm border border-white/20"
            >
              <LogIn size={20} />
              Connexion
            </button>
          )}
        </div>
        
        <div className="relative flex gap-8">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white/10 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-white/20">
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

            <div className="md:col-span-2 flex gap-4 justify-center mt-8">
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
                <div
                  key={saved.id}
                  className="bg-white/10 p-4 rounded-xl border border-white/20 hover:bg-white/20 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-white">{saved.name}</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => loadIdentity(saved)}
                        className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                      >
                        <Copy size={20} />
                      </button>
                      <button
                        onClick={() => deleteIdentity(saved.id)}
                        className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                  <p className="text-white/80">
                    Gaming: {saved.gaming.username}
                  </p>
                  <p className="text-white/80">
                    Réel: {saved.real.firstName} {saved.real.lastName}
                  </p>
                  <p className="text-sm text-white/60 mt-2">
                    Sauvegardé le: {saved.createdAt.toLocaleDateString()}
                  </p>
                </div>
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

      {showAuthDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-20">
          <div className="bg-white/10 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-white/20 max-w-md w-full mx-4">
            <h3 className="text-2xl font-bold text-white mb-4">
              {isSignUp ? 'Créer un compte' : 'Se connecter'}
            </h3>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email..."
              className="w-full p-4 rounded bg-white/10 backdrop-blur-sm text-white border border-white/20 mb-4"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mot de passe..."
              className="w-full p-4 rounded bg-white/10 backdrop-blur-sm text-white border border-white/20 mb-4"
            />
            <div className="flex flex-col gap-4">
              <button
                onClick={handleAuth}
                className="w-full px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl transition-colors"
              >
                {isSignUp ? 'Créer un compte' : 'Se connecter'}
              </button>
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-white/80 hover:text-white transition-colors"
              >
                {isSignUp ? 'Déjà un compte ? Se connecter' : 'Pas de compte ? S\'inscrire'}
              </button>
              <button
                onClick={() => setShowAuthDialog(false)}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;