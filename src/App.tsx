import React, { useState } from 'react';
import { Copy, RefreshCw } from 'lucide-react';

// Listes enrichies pour la génération aléatoire
const FIRST_NAMES = [
 'Emma', 'Lucas', 'Léa', 'Hugo', 'Chloé', 'Louis', 'Jade', 'Gabriel', 'Louise', 'Jules',
  'Alice', 'Arthur', 'Lina', 'Noah', 'Inès', 'Adam', 'Léna', 'Raphaël', 'Sarah', 'Ethan',
  'Mila', 'Paul', 'Julia', 'Nathan', 'Eva', 'Théo', 'Anna', 'Tom', 'Rose', 'Axel',
  'Camille', 'Maxime', 'Nina', 'Antoine', 'Luna', 'Enzo', 'Zoé', 'Léo', 'Sofia', 'Victor',
  'Olivia', 'Samuel', 'Charlotte', 'Mathis', 'Juliette', 'Oscar', 'Agathe', 'Sacha', 'Lola', 'Simon',
  'Ambre', 'Nolan', 'Elena', 'Robin', 'Clara', 'Gabin', 'Manon', 'Martin', 'Lucie', 'Thomas',
  'Ava', 'Eliott', 'Malo', 'Alix', 'Basile', 'Céleste', 'Eden', 'Félix', 'Gaël', 'Isis',
  'Johan', 'Kylian', 'Lior', 'Maël', 'Naël', 'Owen', 'Paloma', 'Quentin', 'Romy', 'Soline',
  'Amélie', 'Benoît', 'Catherine', 'David', 'Élodie', 'François', 'Geneviève', 'Henri', 'Isabelle', 'Jacques',
  'Karine', 'Laurent', 'Monique', 'Nathalie', 'Olivier', 'Patrice', 'René', 'Sylvie', 'Thierry', 'Valérie',
  'Yannick', 'Zoé', 'Adrien', 'Brice', 'Cédric', 'Dorian', 'Estelle', 'Fanny', 'Gérald', 'Hélène',
  'Ingrid', 'Jules', 'Kevin', 'Laure', 'Matthieu', 'Noémie', 'Océane', 'Philippe', 'Quentin', 'Régis',
  'Sophie', 'Tristan', 'Ugo', 'Violette', 'William', 'Xavier', 'Yasmine', 'Zacharie', 'Aurélien', 'Bastien',
  'Chantal', 'Dominique', 'Éric', 'Fabienne', 'Gilles', 'Hugo', 'Irène', 'Jean', 'Katia', 'Lucien',
  'Mireille', 'Norbert', 'Orianne', 'Pascal', 'Raymond', 'Séverine', 'Thiébaud', 'Véronique', 'Wilfried', 'Yvonne',
  'Alban', 'Brigitte', 'Clément', 'Denis', 'Éliane', 'Florian', 'Gustave', 'Hector', 'Ivana', 'Jocelyn',
  'Karim', 'Léon', 'Marianne', 'Nicolas', 'Omar', 'Paulette', 'Raphaëlle', 'Sylvain', 'Tiffany', 'Victorine',
  'Wendy', 'Xenia', 'Yvan', 'Zora', 'Alfred', 'Béatrice', 'Claude', 'Daphné', 'Emmanuel', 'Fabrice',
  'Geoffrey', 'Hortense', 'Igor', 'Josiane', 'Kendra', 'Ludovic', 'Marcel', 'Nelly', 'Orlando', 'Priscilla',
  'Roland', 'Sandrine', 'Thérèse', 'Ulysse', 'Vladimir', 'Wilma', 'Xavière', 'Yolande', 'Zéphyr', 'Abel',
  'Bernadette', 'Christophe', 'Delphine', 'Émile', 'Fatima', 'Gaston', 'Hélène', 'Ibrahim', 'Jessica', 'Kévin',
  'Lionel', 'Maurice', 'Nina', 'Ophélie', 'Pierre', 'Rita', 'Sylvia', 'Tahar', 'Ursula', 'Vanessa',
  'Wassim', 'Ximena', 'Yanis', 'Zoila', 'Amandine', 'Boris', 'Constance', 'Damien', 'Éva', 'Florent',
  'Guillaume', 'Hanna', 'Idriss', 'Jean-Baptiste', 'Kassandra', 'Luc', 'Magalie', 'Nour', 'Othman', 'Patricia',
  'Rémy', 'Sabine', 'Théodore', 'Ugo', 'Valentin', 'Wafa', 'Xander', 'Yara', 'Zayn', 'Aïcha',
  'Balthazar', 'Cynthia', 'Djamila', 'Éric', 'Farid', 'Ghada', 'Hicham', 'Imane', 'Jibril', 'Karima',
  'Lamia', 'Malik', 'Nadia', 'Omar', 'Pierre-Louis', 'Rania', 'Sami', 'Toufik', 'Ugo', 'Wassim',
  'Anis', 'Samira', 'Yacine', 'Fatou', 'Nabil', 'Amira', 'Hana', 'Mehdi', 'Nora', 'Idris',
  'Lamia', 'Soraya', 'Bachir', 'Fadwa', 'Reda', 'Nassima', 'Karim', 'Youssef', 'Latifa', 'Fouad',
  'Imran', 'Siham', 'Jawad', 'Safia', 'Amine', 'Rachid', 'Amina', 'Zakaria', 'Salma', 'Adil'
];

];

const LAST_NAMES = [
  'Martin', 'Bernard', 'Thomas', 'Petit', 'Robert', 'Richard', 'Durand', 'Dubois', 'Moreau', 'Laurent',
  'Simon', 'Michel', 'Garcia', 'David', 'Bertrand', 'Roux', 'Vincent', 'Fournier', 'Morel', 'Girard',
  'Andre', 'Lefevre', 'Mercier', 'Dupont', 'Lambert', 'Bonnet', 'Francois', 'Martinez', 'Legrand', 'Garnier',
  'Faure', 'Rousseau', 'Blanc', 'Guerin', 'Muller', 'Henry', 'Roussel', 'Nicolas', 'Perrin', 'Morin',
  'Mathieu', 'Clement', 'Gauthier', 'Dumont', 'Lopez', 'Fontaine', 'Chevalier', 'Robin', 'Masson', 'Meyer',
  'Benoit', 'Pires', 'Vasseur', 'Barbier', 'Chauvin', 'Lemoine', 'Bailly', 'Piquet', 'Joly', 'Dufresne',
  'Thibault', 'Lemoine', 'Delacroix', 'Boucher', 'Bailly', 'Allard', 'Clerc', 'Baron', 'Brun', 'Caron',
  'Lemoine', 'Gosse', 'Coudray', 'Lemoine', 'Ravot', 'Deleuze', 'Salmon', 'Moulin', 'Laurent', 'Joubert',
  'Dufresne', 'Pires', 'Rousselet', 'Klein', 'Thibault', 'Dufour', 'Lemoine', 'Leblanc', 'Charron', 'Vidal',
  'Chamberlain', 'Dumas', 'Vuitton', 'Lemoine', 'Bonnard', 'Prigent', 'Pasquier', 'Leclerc', 'Fournier', 'Cheval',
  'Mercier', 'Roussel', 'Tanguy', 'Gauthier', 'Lemoine', 'Dufresne', 'Claudel', 'Georges', 'Roch', 'Lemoine',
  'Fournier', 'Hamon', 'Demarais', 'Gosset', 'Millet', 'Duval', 'Mercier', 'Casanova', 'Blanchard', 'Brunet',
  'Delahaye', 'Chapelle', 'Collet', 'Bertin', 'Vachon', 'Tanguy', 'Lemoine', 'Fouquet', 'Labbe', 'Verger',
  'Abadie', 'Accorsi', 'Agnelli', 'Alvarez', 'Amato', 'Andersson', 'Andreasson', 'Angeli', 'Anselme', 'Arnaud',
  'Asselin', 'Audran', 'Aubert', 'Barthélémy', 'Baroni', 'Bartoli', 'Baugé', 'Beaufort', 'Beauregard', 'Beck',
  'Benoist', 'Berger', 'Berruyer', 'Besson', 'Biazzi', 'Billard', 'Blanchet', 'Blanchon', 'Bonin', 'Bordier',
  'Boyer', 'Branger', 'Branly', 'Bresson', 'Briand', 'Briquet', 'Brillant', 'Bruel', 'Cailleux', 'Caron', 'Carette',
  'Carlier', 'Carpentier', 'Castaing', 'Chapelain', 'Chapuis', 'Chauvet', 'Cipriani', 'Clément', 'Collin', 'Cormier',
  'Coudon', 'Courtois', 'Crémieux', 'Cruz', 'Culot', 'Curie', 'Dacquin', 'Dautresme', 'Davidson', 'Delmas', 'Delors',
  'Dervin', 'Deville', 'Didiot', 'Dominici', 'Dubert', 'Dufresne', 'Durieux', 'Duron', 'Dupin', 'Duval', 'Echinard',
  'Faure', 'Farel', 'Farine', 'Fauchon', 'Favre', 'Fayolle', 'Félix', 'Ferro', 'Fèvre', 'Filliol', 'Flament', 'Fleury',
  'Forêt', 'Fortin', 'Fradin', 'Fremont', 'Garcia', 'Gaudin', 'Gauthier', 'Gayer', 'Gilbert', 'Girault', 'Godet', 'Gougeon',
  'Granger', 'Grandjean', 'Grelier', 'Grison', 'Guichard', 'Guillemet', 'Guiraud', 'Gustave', 'Hamelin', 'Harmon',
  'Hebert', 'Hébert', 'Hilaire', 'Hubert', 'Humbert', 'Jamin', 'Jarry', 'Jouan', 'Jourdain', 'Juge', 'Laforge', 'Lamberts',
  'Lemoine', 'Lenoir', 'Leroy', 'Lescure', 'Lemoine', 'Leveque', 'Lévesque', 'Liévin', 'Lemoine', 'Lemoignan', 'Loiseau',
  'Lombard', 'Lemoine', 'Lepage', 'Lepointe', 'Liger', 'Léger', 'Lemoine', 'Lecocq', 'Lacoste', 'Lavoine', 'Leclerc',
  'Lepelletier', 'Lemoine', 'Lemoine', 'Masson', 'Mallet', 'Malet', 'Marlier', 'Marceau', 'Marchand', 'Marion', 'Martel',
  'Martin', 'Marty', 'Masson', 'Mathieu', 'Mauche', 'Maignan', 'Maury', 'Mele', 'Mélis', 'Ménard', 'Monnier', 'Morizet',
  'Morel', 'Moulin', 'Muller', 'Ménard', 'Nicolas', 'Noyelles', 'Olive', 'Olivier', 'Ortega', 'Paillet', 'Parra', 'Pascal',
  'Perot', 'Pernot', 'Perrin', 'Philippe', 'Planchon', 'Pires', 'Poirier', 'Poisson', 'Prigent', 'Rabin', 'Ragot', 'Rames',
  'Renaud', 'Rivière', 'Robert', 'Roche', 'Rodriguez', 'Rolin', 'Roussel', 'Roux', 'Salmon', 'Sauvage', 'Sébastien', 'Serre',
  'Simon', 'Smet', 'Sourioux', 'Sutton', 'Tanguy', 'Tricot', 'Vacher', 'Vallée', 'Viale', 'Vincent', 'Virey', 'Vitali', 'Vivier',
  'Voisin', 'Voulant', 'Wagner', 'Worms', 'Zouari', 'Zuber', 'Vega', 'Vivant', 'Vasseur', 'Vaillant', 'Verdier', 'Voland',
  'Voyer', 'Weller', 'Zigler', 'Auber', 'Azoulay', 'Baudry', 'Baumann', 'Bautista', 'Beau', 'Becker', 'Bedouet', 'Bellanger',
  'Benoist', 'Bernat', 'Berthier', 'Bertrand', 'Bessiere', 'Besset', 'Boutin', 'Bouchet', 'Boudier', 'Bourdon', 'Bourgeois',
  'Boucher', 'Boudet', 'Carlier', 'Chabaud', 'Clement', 'Casanova', 'Clerc', 'Cottet', 'Chambard', 'Chin', 'Chautard', 'Chapel',
  'Corbier', 'Degrange', 'Delfosse', 'Deschamps', 'Desmarais', 'Derenne', 'Deledicq', 'Devin', 'Dupuis', 'Duprey', 'Duteil',
  'Fages', 'Faure', 'Feliot', 'Ferro', 'Fleury', 'Fortier', 'Fournier', 'Gallot', 'Gendron', 'Gensac', 'Georges', 'Givry'
];

const GAMING_PREFIXES = [
  'Dark', 'Shadow', 'Crystal', 'Storm', 'Frost', 'Dragon', 'Star', 'Night', 'Thunder', 'Fire',
  'Cyber', 'Neon', 'Quantum', 'Cosmic', 'Ghost', 'Steel', 'Blood', 'Moon', 'Solar', 'Void',
  'Echo', 'Chaos', 'Mystic', 'Phoenix', 'Omega', 'Alpha', 'Nova', 'Astro', 'Hyper', 'Ultra',
  'Pixel', 'Nexus', 'Zero', 'Blade', 'Pulse', 'Flux', 'Vapor', 'Nether', 'Aether', 'Prime'
];

const GAMING_SUFFIXES = [
  'Slayer', 'Hunter', 'Master', 'Knight', 'Warrior', 'Legend', 'Phoenix', 'Runner', 'Walker', 'Blade',
  'Reaper', 'Guardian', 'Ninja', 'Assassin', 'King', 'Queen', 'Lord', 'Ghost', 'Striker', 'Sage',
  'Mage', 'Titan', 'Beast', 'Dragon', 'Hawk', 'Wolf', 'Eagle', 'Lion', 'Tiger', 'Bear',
  'Phantom', 'Shadow', 'Spirit', 'Soul', 'Heart', 'Mind', 'Storm', 'Flame', 'Frost', 'Thunder'
];

const GAMING_CONNECTORS = ['', '_', '.', 'Of', 'The'];
const NUMBERS = ['', ...Array.from({ length: 999 }, (_, i) => (i + 1).toString())];

function generateSimplePassword() {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

function getRandomElement(array: string[]) {
  return array[Math.floor(Math.random() * array.length)];
}

function generateGamingUsername() {
  const prefix = getRandomElement(GAMING_PREFIXES);
  const suffix = getRandomElement(GAMING_SUFFIXES);
  const connector = getRandomElement(GAMING_CONNECTORS);
  const number = getRandomElement(NUMBERS);
  
  return `${prefix}${connector}${suffix}${number}`;
}

function CopyableField({ label, value }: { label: string; value: string }) {
  const handleCopy = () => {
    navigator.clipboard.writeText(value);
  };

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-white/80 mb-2">{label}</label>
      <div className="flex">
        <input
          type="text"
          readOnly
          value={value}
          className="flex-1 p-4 border rounded-l bg-white/10 backdrop-blur-sm text-white font-medium text-lg"
        />
        <button
          onClick={handleCopy}
          className="px-6 py-4 bg-white/20 text-white rounded-r hover:bg-white/30 transition-colors"
          title="Copier"
        >
          <Copy size={24} />
        </button>
      </div>
    </div>
  );
}

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-300/90 via-indigo-300/90 to-purple-400/90 animate-gradient relative overflow-hidden">
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
        
        <div className="grid md:grid-cols-2 gap-8">
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
        </div>

        <div className="mt-12 text-center">
          <button
            onClick={regenerateAll}
            className="inline-flex items-center px-12 py-6 bg-white/10 hover:bg-white/20 text-white text-2xl font-bold rounded-2xl transition-all duration-300 gap-3 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 backdrop-blur-sm border border-white/20"
          >
            <RefreshCw size={32} />
            Générer une nouvelle identité
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;