export type Product = {
  id: number;
  name: string;
  price: number;
  category: string;
  emoji: string;
  badge?: string;
  description: string;
  details: string[];
  rating: number;
  reviews: number;
};

export const PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Veste Cuir Noir",
    price: 249,
    category: "Vêtements",
    emoji: "🧥",
    badge: "Nouveau",
    description: "Veste en cuir véritable, coupe slim, doublure en soie.",
    details: ["100% cuir véritable", "Doublure soie", "Coupe slim", "Tailles XS–XXL"],
    rating: 4.8,
    reviews: 124,
  },
  {
    id: 2,
    name: "Sneakers Blanc",
    price: 129,
    category: "Chaussures",
    emoji: "👟",
    badge: "Bestseller",
    description: "Sneakers iconiques en cuir blanc, semelle coussinée.",
    details: ["Cuir pleine fleur", "Semelle EVA", "Pointures 36–46", "Fabriqué en Italie"],
    rating: 4.9,
    reviews: 310,
  },
  {
    id: 3,
    name: "Montre Minimaliste",
    price: 399,
    category: "Accessoires",
    emoji: "⌚",
    badge: "Exclusif",
    description: "Montre Swiss made, verre saphir, bracelet cuir.",
    details: ["Mouvement Swiss", "Verre saphir", "Étanche 50m", "Bracelet cuir"],
    rating: 4.7,
    reviews: 89,
  },
  {
    id: 4,
    name: "Sac Tote Premium",
    price: 89,
    category: "Accessoires",
    emoji: "👜",
    description: "Tote bag en toile de coton bio, anses renforcées.",
    details: ["Coton bio certifié", "Anses cuir", "42×38cm", "Poche intérieure"],
    rating: 4.6,
    reviews: 203,
  },
  {
    id: 5,
    name: "Pantalon Tailoring",
    price: 179,
    category: "Vêtements",
    emoji: "👖",
    badge: "Soldes",
    description: "Pantalon de tailleur en laine mélangée, coupe droite.",
    details: ["70% laine, 30% polyester", "Coupe droite", "Ceinture ajustable", "Tailles 36–48"],
    rating: 4.5,
    reviews: 67,
  },
  {
    id: 6,
    name: "Parfum Signature",
    price: 195,
    category: "Beauté",
    emoji: "🧴",
    badge: "Nouveau",
    description: "Eau de parfum 100ml, notes boisées et florales.",
    details: ["100ml EDP", "Notes: Cèdre, Rose, Musc", "Vaporisateur", "Coffret cadeau"],
    rating: 4.8,
    reviews: 156,
  },
  {
    id: 7,
    name: "Casquette Structurée",
    price: 59,
    category: "Accessoires",
    emoji: "🧢",
    description: "Casquette 6 panneaux, broderie ton sur ton.",
    details: ["100% coton", "Taille réglable", "Broderie premium", "Taille unique"],
    rating: 4.4,
    reviews: 78,
  },
  {
    id: 8,
    name: "Pull Cachemire",
    price: 319,
    category: "Vêtements",
    emoji: "🧶",
    badge: "Luxe",
    description: "Pull 100% cachemire grade A, col rond.",
    details: ["100% Cachemire Grade A", "Col rond", "12 coloris", "Tailles XS–XL"],
    rating: 4.9,
    reviews: 201,
  },
];

export const CATEGORIES = ["Tous", "Vêtements", "Chaussures", "Accessoires", "Beauté"];

export const BADGE_COLORS: Record<string, string> = {
  Nouveau: "#1a6b45",
  Bestseller: "#6d28d9",
  Exclusif: "#b45309",
  Soldes: "#dc2626",
  Luxe: "#0e4f8e",
};
