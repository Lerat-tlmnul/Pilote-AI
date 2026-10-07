import { Restaurant } from '../types';

export interface CityData {
  name: string;
  lat: number;
  lng: number;
  restaurants: Restaurant[];
}

export const CITIES_DATA: Record<string, CityData> = {
  paris: {
    name: 'Paris',
    lat: 48.8566,
    lng: 2.3522,
    restaurants: [
      {
        name: 'Septime',
        cuisine: 'Bistronomie Étoilée',
        address: '80 Rue de Charonne, 75011 Paris',
        rating: 4.9,
        priceRange: '€€€€',
        description: 'Menu dégustation engagé, cave remarquable et lumière naturelle sublime.',
        highlight: 'Tartelette asperges vertes & sabayon fumé',
        lat: 48.8534,
        lng: 2.3804,
      },
      {
        name: 'Le Chateaubriand',
        cuisine: 'Haute Bistronomie',
        address: '129 Avenue Parmentier, 75011 Paris',
        rating: 4.7,
        priceRange: '€€€',
        description: 'L\'institution de la néo-bistronomie parisienne. Cuisine libre et précise.',
        highlight: 'Bar de ligne au beurre blanc d\'agrumes',
        lat: 48.8687,
        lng: 2.3705,
      },
      {
        name: 'Ellsworth',
        cuisine: 'Assiettes Partagées & Vins Vivants',
        address: '34 Rue de Richelieu, 75001 Paris',
        rating: 4.8,
        priceRange: '€€€',
        description: 'Cadre chic et discret près du Palais-Royal, parfait pour un moment privilégié.',
        highlight: 'Fried chicken signature & céviche de daurade',
        lat: 48.8661,
        lng: 2.3364,
      },
      {
        name: 'Frenchie',
        cuisine: 'Cuisine Contemporaine',
        address: '5 Rue du Nil, 75002 Paris',
        rating: 4.8,
        priceRange: '€€€€',
        description: 'Rue du Nil, le repaire incontournable des gourmets parisiens.',
        highlight: 'Pigeon rôti & ris de veau croustillant',
        lat: 48.8676,
        lng: 2.3486,
      },
    ],
  },
  lyon: {
    name: 'Lyon',
    lat: 45.7640,
    lng: 4.8357,
    restaurants: [
      {
        name: 'La Mère Brazier',
        cuisine: 'Gastronomie Lyonnaise 2 Étoiles',
        address: '12 Rue Royale, 69001 Lyon',
        rating: 4.9,
        priceRange: '€€€€',
        description: 'Temple de la haute cuisine lyonnaise par Mathieu Viannay, entre tradition et modernité absolue.',
        highlight: 'Volaille de Bresse demi-deuil & artichaut au foie gras',
        lat: 45.7702,
        lng: 4.8364,
      },
      {
        name: 'Le Neuvième Art',
        cuisine: 'Cuisine Créative & Étoilée',
        address: '173 Rue Cuvier, 69006 Lyon',
        rating: 4.8,
        priceRange: '€€€€',
        description: 'Chef Christophe Roure, univers épuré et dressages architecturaux somptueux.',
        highlight: 'Omble chevalier du Léman & morilles fraîches',
        lat: 45.7698,
        lng: 4.8587,
      },
      {
        name: 'Bouchon Tupin',
        cuisine: 'Néo-Bouchon Lyonnais',
        address: '30 Rue Tupin, 69002 Lyon',
        rating: 4.8,
        priceRange: '€€',
        description: 'Les classiques de la gastronomie des gones revisités avec finesse et légèreté.',
        highlight: 'Quenelle de brochet soufflée au coulis d\'écrevisses',
        lat: 45.7631,
        lng: 4.8349,
      },
      {
        name: 'Prairial',
        cuisine: 'Végétale & Terroir Étoilé',
        address: '1 Rue Chavanne, 69001 Lyon',
        rating: 4.7,
        priceRange: '€€€',
        description: 'Étoilé vert, alliance d\'herbes sauvages et de producteurs locaux d\'excellence.',
        highlight: 'Céleri rôti au foin & extraction d\'épicéa',
        lat: 45.7667,
        lng: 4.8329,
      },
    ],
  },
  marseille: {
    name: 'Marseille',
    lat: 43.2965,
    lng: 5.3698,
    restaurants: [
      {
        name: 'AM par Alexandre Mazzia',
        cuisine: 'Gastronomie Triplement Étoilée',
        address: '9 Rue François Rocca, 13008 Marseille',
        rating: 4.9,
        priceRange: '€€€€',
        description: 'Expérience sensorielle unique au monde, torréfaction, piments et iodé marseillais.',
        highlight: 'Anguille fumée au chocolat & framboise harissa',
        lat: 43.2655,
        lng: 5.3853,
      },
      {
        name: 'Chez Fonfon',
        cuisine: 'Bouillabaisse Traditionnelle & Poissons',
        address: '140 Rue du Vallon des Auffes, 13007 Marseille',
        rating: 4.7,
        priceRange: '€€€',
        description: 'Au creux du pittoresque vallon des Auffes, la véritable bouillabaisse face aux pointus.',
        highlight: 'Authentique bouillabaisse au feu de bois & rouille maison',
        lat: 43.2858,
        lng: 5.3522,
      },
      {
        name: 'La Mercerie',
        cuisine: 'Bistronomie Méditerranéenne',
        address: '9 Cours Saint-Louis, 13001 Marseille',
        rating: 4.8,
        priceRange: '€€€',
        description: 'Vins natures, produits du marché de Noailles et créativité débordante.',
        highlight: 'Poulpe snacké au cédrat & jus réduit',
        lat: 43.2974,
        lng: 5.3789,
      },
      {
        name: 'Le Petit Nice Passedat',
        cuisine: 'Haute Gastronomie Marine',
        address: 'Anse de Maldormé, 13007 Marseille',
        rating: 4.9,
        priceRange: '€€€€',
        description: 'Face à la Méditerranée, le royaume des poissons sauvages oubliés.',
        highlight: 'Loup en caravane & anémones de mer croustillantes',
        lat: 43.2829,
        lng: 5.3508,
      },
    ],
  },
  bordeaux: {
    name: 'Bordeaux',
    lat: 44.8378,
    lng: -0.5792,
    restaurants: [
      {
        name: 'Le Pressoir d\'Argent - Gordon Ramsay',
        cuisine: 'Gastronomie 2 Étoiles',
        address: '2-5 Place de la Comédie, 33000 Bordeaux',
        rating: 4.8,
        priceRange: '€€€€',
        description: 'Face à l\'Opéra de Bordeaux, le mythique homard pressé et accords grands crus classés.',
        highlight: 'Homard bleu au pressoir d\'argent & truffes',
        lat: 44.8427,
        lng: -0.5744,
      },
      {
        name: 'Miles',
        cuisine: 'Cuisine du Monde Voyageuse',
        address: '33 Rue du Cancera, 33000 Bordeaux',
        rating: 4.8,
        priceRange: '€€€',
        description: 'Quatre chefs complices issus de pays différents, cuisine ouverte et inventive.',
        highlight: 'Maigre de ligne mariné au ponzu & émulsion maïs',
        lat: 44.8392,
        lng: -0.5701,
      },
      {
        name: 'L\'Atelier des Faures',
        cuisine: 'Bistronomie Vivante',
        address: '48 Rue des Faures, 33000 Bordeaux',
        rating: 4.7,
        priceRange: '€€',
        description: 'Quartier Saint-Michel, ambiance chaleureuse et assiettes vibrantes du terroir.',
        highlight: 'Joue de bœuf braisée au vin rouge & purée au beurre noisette',
        lat: 44.8344,
        lng: -0.5678,
      },
    ],
  },
  toulouse: {
    name: 'Toulouse',
    lat: 43.6047,
    lng: 1.4442,
    restaurants: [
      {
        name: 'Michel Sarran',
        cuisine: 'Haute Gastronomie du Sud-Ouest',
        address: '21 Boulevard Armand Duportal, 31000 Toulouse',
        rating: 4.9,
        priceRange: '€€€€',
        description: 'L\'adresse de référence à Toulouse, cuisine d\'émotion et de générosité absolue.',
        highlight: 'Foie gras de canard en soupe tiède à l\'huître Belon',
        lat: 43.6092,
        lng: 1.4335,
      },
      {
        name: 'Une Table à Deux',
        cuisine: 'Bistronomie Créative',
        address: '10 Rue de la Pleau, 31000 Toulouse',
        rating: 4.8,
        priceRange: '€€€',
        description: 'Cadre intimiste dans une ruelle historique des Carmes, accords mets et vins pointus.',
        highlight: 'Cochon noir de Bigorre confit & carottes glacées au miel de bruyère',
        lat: 43.5992,
        lng: 1.4439,
      },
    ],
  },
  nice: {
    name: 'Nice',
    lat: 43.7102,
    lng: 7.2620,
    restaurants: [
      {
        name: 'Chantecler - Le Negresco',
        cuisine: 'Gastronomie Azuréenne Étoilée',
        address: '37 Promenade des Anglais, 06000 Nice',
        rating: 4.9,
        priceRange: '€€€€',
        description: 'Dans le cadre légendaire du Negresco, cuisine d\'orfèvre célébrant la Riviera.',
        highlight: 'Rouget barbet de roche rôti & socca croustillante',
        lat: 43.6946,
        lng: 7.2588,
      },
      {
        name: 'La Merenda',
        cuisine: 'Cuisine Authentique Niçoise',
        address: '4 Rue Raoul Bosio, 06300 Nice',
        rating: 4.7,
        priceRange: '€€',
        description: 'Tenue par Dominique Le Stanc, ancien 2 étoiles, la quintessence des recettes nissardes.',
        highlight: 'Pâtes au pistou pilonné au mortier & daube de bœuf',
        lat: 43.6961,
        lng: 7.2741,
      },
    ],
  },
  nantes: {
    name: 'Nantes',
    lat: 47.2184,
    lng: -1.5536,
    restaurants: [
      {
        name: 'Lulu Rouget',
        cuisine: 'Gastronomie Nantaise & Marine Étoilée',
        address: '4 Place Albert Camus, 44200 Nantes',
        rating: 4.9,
        priceRange: '€€€€',
        description: 'Sur l\'Île de Nantes, Ludovic Pouzelgues sublime les trésors de l\'Atlantique et de la Loire.',
        highlight: 'Turbot sauvage cuit sur l\'arête & beurre blanc d\'agrumes',
        lat: 47.2045,
        lng: -1.5583,
      },
      {
        name: 'Roza',
        cuisine: 'Bistronomie Contemporaine',
        address: '3 Place de la Monnaie, 44000 Nantes',
        rating: 4.8,
        priceRange: '€€€',
        description: 'Ambiance feutrée, produits du terroir ligérien et créativité moderne.',
        highlight: 'Pigeon de Pornic & betteraves fumées au sarment',
        lat: 47.2125,
        lng: -1.5645,
      },
    ],
  },
  strasbourg: {
    name: 'Strasbourg',
    lat: 48.5734,
    lng: 7.7521,
    restaurants: [
      {
        name: 'Au Crocodile',
        cuisine: 'Gastronomie Alsacienne Étoilée',
        address: '10 Rue de l\'Outre, 67000 Strasbourg',
        rating: 4.8,
        priceRange: '€€€€',
        description: 'Haut lieu de la gastronomie d\'Alsace au cœur de la Grande Île.',
        highlight: 'Foie gras d\'Alsace poêlé & sandre au pinot noir',
        lat: 48.5831,
        lng: 7.7485,
      },
      {
        name: 'Chez Yvonne',
        cuisine: 'Winstub Traditionnelle',
        address: '10 Rue du Sanglier, 67000 Strasbourg',
        rating: 4.6,
        priceRange: '€€',
        description: 'La winstub préférée des personnalités et gourmands, chaleureuse et boiseries d\'antan.',
        highlight: 'Véritable choucroute garnie royale & baeckeoffe',
        lat: 48.5821,
        lng: 7.7508,
      },
    ],
  },
  lille: {
    name: 'Lille',
    lat: 50.6292,
    lng: 3.0573,
    restaurants: [
      {
        name: 'Le Cerisier en Ville',
        cuisine: 'Haute Gastronomie Étoilée du Nord',
        address: '14 Avenue du Peuple Belge, 59800 Lille',
        rating: 4.8,
        priceRange: '€€€€',
        description: 'Au cœur du Vieux-Lille, cuisine précise valorisant les maraîchers des Flandres.',
        highlight: 'Anguille fumée & volaille de Licques truffée',
        lat: 50.6432,
        lng: 3.0645,
      },
      {
        name: 'Bloempot',
        cuisine: 'Cuisine Flamande Contemporaine',
        address: '22 Rue des Bouchers, 59800 Lille',
        rating: 4.8,
        priceRange: '€€€',
        description: 'Florent Ladeyn, cantine flamande brute, feu de bois et 100% locavore.',
        highlight: 'Frites cuites au gras de bœuf & glace au foin',
        lat: 50.6385,
        lng: 3.0592,
      },
    ],
  },
  montpellier: {
    name: 'Montpellier',
    lat: 43.6108,
    lng: 3.8767,
    restaurants: [
      {
        name: 'Le Jardin des Sens - Pourcel',
        cuisine: 'Gastronomie Méditerranéenne Étoilée',
        address: '17 Boulevard Louis Blanc, 34000 Montpellier',
        rating: 4.9,
        priceRange: '€€€€',
        description: 'Hôtel Richer de Belleval, le grand retour des frères Pourcel au sommet de leur art.',
        highlight: 'Loup de Méditerranée & émulsion coquillages au safran de l\'Hérault',
        lat: 43.6135,
        lng: 3.8789,
      },
      {
        name: 'Pastis Restaurant',
        cuisine: 'Bistronomie Sélective',
        address: '3 Rue Valedau, 34000 Montpellier',
        rating: 4.8,
        priceRange: '€€€',
        description: 'Chef Jean-Philippe Borget, cuisine de marché raffinée dans l\'Écusson.',
        highlight: 'Thon rouge snacké & déclinaison d\'artichauts poivrade',
        lat: 43.6105,
        lng: 3.8732,
      },
    ],
  },
};

/**
 * Detects a mentioned city in a text string.
 */
export function detectCityInText(text: string): CityData | null {
  const normalized = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  for (const [key, city] of Object.entries(CITIES_DATA)) {
    const cityNameNormalized = city.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    // Check whole word boundary
    const regex = new RegExp(`\\b${cityNameNormalized}\\b`, 'i');
    if (regex.test(normalized)) {
      return city;
    }
  }
  return null;
}

/**
 * Returns restaurants for a city name or coordinates.
 */
export function getRestaurantsForCity(cityName?: string, lat?: number, lng?: number): { city: string; lat: number; lng: number; restaurants: Restaurant[] } {
  if (cityName) {
    const found = detectCityInText(cityName);
    if (found) {
      return {
        city: found.name,
        lat: found.lat,
        lng: found.lng,
        restaurants: found.restaurants,
      };
    }
  }

  // If coordinates are provided, find closest known city
  if (lat && lng) {
    let closestCity = CITIES_DATA.paris;
    let minDistance = Infinity;

    for (const city of Object.values(CITIES_DATA)) {
      const dLat = city.lat - lat;
      const dLng = city.lng - lng;
      const dist = dLat * dLat + dLng * dLng;
      if (dist < minDistance) {
        minDistance = dist;
        closestCity = city;
      }
    }

    // If within reasonable distance (~0.3 degrees approx 30km)
    if (minDistance < 0.2) {
      return {
        city: closestCity.name,
        lat: lat,
        lng: lng,
        restaurants: closestCity.restaurants,
      };
    }

    // Otherwise generate dynamic spots around user coordinates
    return {
      city: cityName || 'Votre localisation',
      lat,
      lng,
      restaurants: [
        {
          name: 'L\'Atelier Gastronomique',
          cuisine: 'Bistronomie de Saison',
          address: `À proximité de votre position (${cityName || 'Centre-ville'})`,
          rating: 4.8,
          priceRange: '€€€',
          description: 'Cuisine de marché raffinée, produits locaux et ambiance intimiste.',
          highlight: 'Filet de bœuf rôti au beurre d\'herbes & jus réduit',
          lat: lat + 0.002,
          lng: lng + 0.003,
        },
        {
          name: 'La Terrasse du Chef',
          cuisine: 'Cuisine Contemporaine & Vins Vivants',
          address: `Quartier central, ${cityName || 'Centre'}`,
          rating: 4.9,
          priceRange: '€€€€',
          description: 'Cadre feutré, terrasse ombragée et accords mets-vins remarquables.',
          highlight: 'Pêche du jour & légumes maraîchers glacés',
          lat: lat - 0.003,
          lng: lng - 0.002,
        },
        {
          name: 'Le Comptoir & Saveurs',
          cuisine: 'Assiettes Créatives & Terroir',
          address: `Place principale, ${cityName || 'Centre'}`,
          rating: 4.7,
          priceRange: '€€',
          description: 'Atmosphère conviviale, produits d\'artisans et desserts signatures.',
          highlight: 'Risotto crémeux aux champignons sauvages',
          lat: lat + 0.004,
          lng: lng - 0.003,
        },
      ],
    };
  }

  // Default to Paris
  return {
    city: 'Paris',
    lat: CITIES_DATA.paris.lat,
    lng: CITIES_DATA.paris.lng,
    restaurants: CITIES_DATA.paris.restaurants,
  };
}
