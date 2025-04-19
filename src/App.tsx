import React, { useState, useEffect } from 'react';
import { Copy, RefreshCw, Save, Search, ChevronRight, ChevronLeft, Trash2, LogIn, LogOut, ChevronDown, ChevronUp } from 'lucide-react';
import { collection, addDoc, query, orderBy, getDocs, where, deleteDoc, doc, Timestamp, updateDoc, writeBatch } from 'firebase/firestore';
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
  category?: string;
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

interface Category {
  id: string;
  name: string;
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
    <div className="mb-4">
      <label className="block text-white/80 font-medium mb-2">{label}</label>
      <div className="flex">
        <div className="flex-1 bg-white/10 rounded-l p-3 text-white text-sm">
          {value}
        </div>
        <button
          onClick={copyToClipboard}
          className="px-4 py-3 bg-white/20 text-white rounded-r hover:bg-white/30 transition-colors"
        >
          <Copy size={20} />
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

  const [identities, setIdentities] = useState<SavedIdentity[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [saveName, setSaveName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(() => {
    return localStorage.getItem('lastCategory') || '';
  });
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [showDeleteCategoryDialog, setShowDeleteCategoryDialog] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [targetCategory, setTargetCategory] = useState<string>('');
  const [deleteOption, setDeleteOption] = useState<'delete' | 'move'>('delete');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        loadIdentities();
        loadCategories();
      } else {
        setIdentities([]);
        setCategories([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const loadCategories = async () => {
    if (!auth.currentUser) return;

    try {
      const categoriesRef = collection(db, 'categories');
      const q = query(
        categoriesRef,
        where('userId', '==', auth.currentUser.uid),
        orderBy('name')
      );
      const querySnapshot = await getDocs(q);
      const loadedCategories = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Category[];
      setCategories(loadedCategories);
    } catch (error) {
      console.error('Error loading categories:', error);
      toast.error('Erreur lors du chargement des catégories');
    }
  };

  const loadIdentities = async () => {
    if (!auth.currentUser) {
      setIdentities([]);
      return;
    }

    try {
      const identitiesRef = collection(db, 'identities');
      const q = query(
        identitiesRef,
        where('userId', '==', auth.currentUser.uid),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const loadedIdentities = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt)
        };
      }) as SavedIdentity[];
      setIdentities(loadedIdentities);
    } catch (error) {
      console.error('Error loading identities:', error);
      toast.error('Erreur lors du chargement des identités');
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
        category: selectedCategory,
        gaming: identity.gaming,
        real: identity.real,
        createdAt: new Date(),
        userId: auth.currentUser.uid
      });
      
      localStorage.setItem('lastCategory', selectedCategory);
      setShowSaveDialog(false);
      setSaveName('');
      toast.success('Identité sauvegardée !');
      await loadIdentities();
    } catch (error) {
      console.error('Error saving identity:', error);
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const addNewCategory = async () => {
    if (!auth.currentUser) {
      toast.error('Veuillez vous connecter pour créer une catégorie');
      return;
    }

    if (newCategory.trim() && !categories.find(cat => cat.name === newCategory.trim())) {
      try {
        const categoriesRef = collection(db, 'categories');
        await addDoc(categoriesRef, {
          name: newCategory.trim(),
          userId: auth.currentUser.uid
        });
        
        setSelectedCategory(newCategory.trim());
        localStorage.setItem('lastCategory', newCategory.trim());
        setNewCategory('');
        setShowNewCategoryInput(false);
        await loadCategories();
        toast.success('Catégorie créée !');
      } catch (error) {
        console.error('Error creating category:', error);
        toast.error('Erreur lors de la création de la catégorie');
      }
    }
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete || !auth.currentUser) return;

    try {
      const batch = writeBatch(db);
      
      // Delete the category
      const categoryRef = doc(db, 'categories', categoryToDelete);
      batch.delete(categoryRef);

      // Handle identities based on selected option
      const identitiesInCategory = identities.filter(identity => identity.category === categories.find(cat => cat.id === categoryToDelete)?.name);
      
      for (const identity of identitiesInCategory) {
        const identityRef = doc(db, 'identities', identity.id);
        if (deleteOption === 'delete') {
          batch.delete(identityRef);
        } else if (deleteOption === 'move') {
          batch.update(identityRef, { category: targetCategory });
        }
      }

      await batch.commit();

      setShowDeleteCategoryDialog(false);
      setCategoryToDelete(null);
      setTargetCategory('');
      setDeleteOption('delete');
      
      await Promise.all([loadCategories(), loadIdentities()]);
      toast.success('Catégorie supprimée !');
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Erreur lors de la suppression de la catégorie');
    }
  };

  const deleteIdentity = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'identities', id));
      toast.success('Identité supprimée !');
      await loadIdentities();
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
      await Promise.all([loadIdentities(), loadCategories()]);
    } catch (error) {
      console.error('Auth error:', error);
      toast.error(isSignUp ? 'Erreur lors de la création du compte' : 'Erreur lors de la connexion');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast.success('Déconnexion réussie !');
      setIdentities([]);
      setCategories([]);
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

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const filteredIdentities = identities.filter(identity => {
    if (searchTerm.trim() === '') return true;
    
    const search = searchTerm.toLowerCase();
    return (
      identity.name.toLowerCase().includes(search) ||
      identity.gaming.username.toLowerCase().includes(search) ||
      identity.real.firstName.toLowerCase().includes(search) ||
      identity.real.lastName.toLowerCase().includes(search) ||
      (identity.category || '').toLowerCase().includes(search)
    );
  });

  const groupedIdentities = filteredIdentities.reduce((acc, identity) => {
    const category = identity.category || 'Sans catégorie';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(identity);
    return acc;
  }, {} as Record<string, SavedIdentity[]>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-300/90 via-indigo-300/90 to-purple-400/90 animate-gradient relative overflow-hidden">
      <Toaster position="top-right" />
      <div className="wave" />
      <div className="relative w-full max-w-7xl mx-auto min-h-screen flex flex-col justify-center p-2 sm:p-4">
        <div className="text-center mb-6 sm:mb-12">
          <h1 className="text-4xl sm:text-7xl font-bold text-white mb-2 sm:mb-4 drop-shadow-lg">
            Générateur d'Identité
          </h1>
          <p className="text-white/90 text-lg sm:text-xl font-medium">
            Générez une identité complète en un clic
          </p>
        </div>

        <div className="absolute top-2 sm:top-4 right-2 sm:right-4">
          {auth.currentUser ? (
            <button
              onClick={handleSignOut}
              className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors gap-2 backdrop-blur-sm border border-white/20 text-sm sm:text-base"
            >
              <LogOut size={18} />
              Déconnexion
            </button>
          ) : (
            <button
              onClick={() => setShowAuthDialog(true)}
              className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors gap-2 backdrop-blur-sm border border-white/20 text-sm sm:text-base"
            >
              <LogIn size={18} />
              Connexion
            </button>
          )}
        </div>
        
        <div className="relative flex gap-4 sm:gap-8">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
            <div className="bg-white/10 backdrop-blur-md p-4 sm:p-8 rounded-3xl shadow-2xl border border-white/20">
              <div className="flex justify-between items-center mb-4 sm:mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-white drop-shadow-md">
                  Identité Gaming
                </h2>
                <div className="text-white/80 font-medium text-sm sm:text-base">
                  {(GAMING_PREFIXES.length * GAMING_SUFFIXES.length * GAMING_CONNECTORS.length * NUMBERS.length).toLocaleString()} combinaisons
                </div>
              </div>
              <CopyableField label="Pseudonyme" value={identity.gaming.username} />
              <CopyableField label="Mot de passe" value={identity.gaming.password} />
            </div>

            <div className="bg-white/10 backdrop-blur-md p-4 sm:p-8 rounded-3xl shadow-2xl border border-white/20">
              <div className="flex justify-between items-center mb-4 sm:mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-white drop-shadow-md">
                  Identité Réelle
                </h2>
                <div className="text-white/80 font-medium text-sm sm:text-base">
                  {(FIRST_NAMES.length * LAST_NAMES.length).toLocaleString()} combinaisons
                </div>
              </div>
              <CopyableField label="Prénom" value={identity.real.firstName} />
              <CopyableField label="Nom" value={identity.real.lastName} />
            </div>

            <div className="md:col-span-2 flex gap-4 justify-center mt-4 sm:mt-8">
              <button
                onClick={regenerateAll}
                className="inline-flex items-center px-6 py-3 sm:px-8 sm:py-4 bg-white/10 hover:bg-white/20 text-white text-lg sm:text-xl font-bold rounded-2xl transition-all duration-300 gap-2 sm:gap-3 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 backdrop-blur-sm border border-white/20"
              >
                <RefreshCw size={20} />
                Générer
              </button>
              <button
                onClick={() => setShowSaveDialog(true)}
                className="inline-flex items-center px-6 py-3 sm:px-8 sm:py-4 bg-white/10 hover:bg-white/20 text-white text-lg sm:text-xl font-bold rounded-2xl transition-all duration-300 gap-2 sm:gap-3 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 backdrop-blur-sm border border-white/20"
              >
                <Save size={20} />
                Sauvegarder
              </button>
            </div>
          </div>

          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="fixed right-2 top-1/2 -translate-y-1/2 z-10 md:relative md:right-0 md:top-0 md:translate-y-0 bg-white/10 hover:bg-white/20 text-white rounded-l-xl md:rounded-xl p-2 transition-colors backdrop-blur-sm border border-white/20"
          >
            {showSidebar ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>

          <div className={`fixed right-0 top-0 h-full w-full md:w-96 bg-white/10 backdrop-blur-md p-4 sm:p-8 shadow-2xl border-l border-white/20 transition-transform duration-300 transform ${showSidebar ? 'translate-x-0' : 'translate-x-full'} z-[5] overflow-y-auto`}>
            <h2 className="text-2xl sm:text-3xl font-bold text-white drop-shadow-md mb-6">
              Identités Sauvegardées
            </h2>
            
            <div className="flex gap-2 mb-6">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher une identité..."
                className="w-full p-3 rounded bg-white/10 backdrop-blur-sm text-white border border-white/20 text-sm"
              />
            </div>

            <div className="space-y-4">
              {Object.entries(groupedIdentities).map(([category, identities]) => (
                <div key={category} className="bg-white/10 rounded-xl border border-white/20">
                  <button
                    onClick={() => toggleCategory(category)}
                    className="w-full flex items-center justify-between p-3 hover:bg-white/10 transition-colors rounded-xl"
                  >
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-white/90">{category}</h3>
                      <span className="text-sm text-white/60">({identities.length})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {category !== 'Sans catégorie' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const categoryObj = categories.find(cat => cat.name === category);
                            if (categoryObj) {
                              setCategoryToDelete(categoryObj.id);
                              setShowDeleteCategoryDialog(true);
                            }
                          }}
                          className="p-1 hover:bg-white/20 text-white rounded-lg transition-colors"
                          title="Supprimer la catégorie"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                      {expandedCategories[category] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                  </button>
                  {expandedCategories[category] && (
                    <div className="p-3 space-y-2 border-t border-white/10">
                      {identities.map((saved) => (
                        <div
                          key={saved.id}
                          className="bg-white/10 p-3 rounded-xl border border-white/20 hover:bg-white/20 transition-colors"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-lg font-bold text-white">{saved.name}</h3>
                            <div className="flex gap-2">
                              <button
                                onClick={() => loadIdentity(saved)}
                                className="p-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                              >
                                <Copy size={18} />
                              </button>
                              <button
                                onClick={() => deleteIdentity(saved.id)}
                                className="p-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </div>
                          <p className="text-white/80 text-sm">
                            Gaming: {saved.gaming.username}
                          </p>
                          <p className="text-white/80 text-sm">
                            Réel: {saved.real.firstName} {saved.real.lastName}
                          </p>
                          <p className="text-xs text-white/60 mt-2">
                            Sauvegardé le: {saved.createdAt.toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-20 p-4">
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl shadow-2xl border border-white/20 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">Sauvegarder l'identité</h3>
            
            <div className="mb-4">
              <label className="block text-white/80 font-medium mb-2">Catégorie</label>
              <div className="flex gap-2 flex-wrap">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.name)}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      selectedCategory === cat.name
                        ? 'bg-white/30 text-white'
                        : 'bg-white/10 text-white/80 hover:bg-white/20'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
                {!showNewCategoryInput && (
                  <button
                    onClick={() => setShowNewCategoryInput(true)}
                    className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white/80 rounded-lg text-sm transition-colors"
                  >
                    + Nouvelle
                  </button>
                )}
              </div>
            </div>

            {showNewCategoryInput && (
              <div className="mb-4">
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Nouvelle catégorie..."
                  className="w-full p-3 rounded bg-white/10 backdrop-blur-sm text-white border border-white/20 text-sm mb-2"
                />
                <div className="flex gap-2">
                  <button
                    onClick={addNewCategory}
                    className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg text-sm transition-colors"
                  >
                    Ajouter
                  </button>
                  <button
                    onClick={() => {
                      setShowNewCategoryInput(false);
                      setNewCategory('');
                    }}
                    className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}

            <input
              type="text"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              placeholder="Nom de l'identité..."
              className="w-full p-3 rounded bg-white/10 backdrop-blur-sm text-white border border-white/20 text-sm mb-4"
            />

            <div className="flex gap-4 justify-end">
              <button
                onClick={() => setShowSaveDialog(false)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors text-sm"
              >
                Annuler
              </button>
              <button
                onClick={saveIdentity}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl transition-colors text-sm"
              >
                Sauvegarder
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteCategoryDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-20 p-4">
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl shadow-2xl border border-white/20 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">Supprimer la catégorie</h3>
            
            <div className="mb-6">
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setDeleteOption('delete')}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm transition-colors ${
                    deleteOption === 'delete'
                      ? 'bg-white/30 text-white'
                      : 'bg-white/10 text-white/80 hover:bg-white/20'
                  }`}
                >
                  Supprimer les identités
                </button>
                <button
                  onClick={() => setDeleteOption('move')}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm transition-colors ${
                    deleteOption === 'move'
                      ? 'bg-white/30 text-white'
                      : 'bg-white/10 text-white/80 hover:bg-white/20'
                  }`}
                >
                  Déplacer les identités
                </button>
              </div>

              {deleteOption === 'move' && (
                <div className="mb-4">
                  <label className="block text-white/80 font-medium mb-2">
                    Déplacer vers la catégorie
                  </label>
                  <select
                    value={targetCategory}
                
                    onChange={(e) => setTargetCategory(e.target.value)}
                    className="w-full p-3 rounded bg-white/10 backdrop-blur-sm text-white border border-white/20 text-sm"
                  >
                    <option value="">Sans catégorie</option>
                    {categories
                      .filter(cat => cat.id !== categoryToDelete)
                      .map(cat => (
                        <option key={cat.id} value={cat.name}>
                          {cat.name}
                        </option>
                      ))
                    }
                  </select>
                </div>
              )}
            </div>

            <div className="flex gap-4 justify-end">
              <button
                onClick={() => {
                  setShowDeleteCategoryDialog(false);
                  setCategoryToDelete(null);
                  setTargetCategory('');
                  setDeleteOption('delete');
                }}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors text-sm"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteCategory}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl transition-colors text-sm"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {showAuthDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-20 p-4">
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl shadow-2xl border border-white/20 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">
              {isSignUp ? 'Créer un compte' : 'Se connecter'}
            </h3>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email..."
              className="w-full p-3 rounded bg-white/10 backdrop-blur-sm text-white border border-white/20 text-sm mb-4"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mot de passe..."
              className="w-full p-3 rounded bg-white/10 backdrop-blur-sm text-white border border-white/20 text-sm mb-4"
            />
            <div className="flex flex-col gap-4">
              <button
                onClick={handleAuth}
                className="w-full px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl transition-colors text-sm"
              >
                {isSignUp ? 'Créer un compte' : 'Se connecter'}
              </button>
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-white/80 hover:text-white transition-colors text-sm"
              >
                {isSignUp ? 'Déjà un compte ? Se connecter' : 'Pas de compte ? S\'inscrire'}
              </button>
              <button
                onClick={() => setShowAuthDialog(false)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors text-sm"
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