export const CATEGORY_DESCRIPTIONS = {
  soc: 'Security Operations Center – Surveillance continue de votre SI, détection des incidents et réponse aux menaces en temps réel.',
  edr: 'Endpoint Detection & Response – Protection avancée de vos postes de travail et serveurs contre les menaces modernes.',
  xdr: "Extended Detection & Response – Corrélation des menaces sur l'ensemble de votre infrastructure hybride."
};

export const CATEGORY_ICONS = { soc: '🛡️', edr: '💻', xdr: '🔍' };

export const CATEGORY_FEATURES = {
  soc: ['Surveillance 24/7/365', 'Détection des menaces en temps réel', 'Réponse aux incidents < 15 min', 'Tableau de bord centralisé', 'Rapports mensuels détaillés', 'Support technique dédié'],
  edr: ['Protection multi-terminaux', 'IA comportementale avancée', 'Confinement automatique', 'Investigation forensique', 'Intégration SOC native', 'Support 24/7'],
  xdr: ['Corrélation multi-sources', 'SIEM intégré', 'Playbooks automatisés', 'API ouverte', 'SLA garanti 99.9%', 'Équipe dédiée']
};

// Dégradés utilisés pour les tuiles illustratives du carrousel produit (pas de vraies photos en base).
// Format RN : tableaux de couleurs pour <LinearGradient colors={[...]}>, plus d'angle CSS ici,
// on gère la direction directement via les props start/end du composant LinearGradient.
export const CATEGORY_GRADIENTS = {
  soc: [
    ['#0D0B3B', '#1E1B74'],
    ['#13104A', '#312E9B'],
    ['#1E1B74', '#4C3FE4']
  ],
  edr: [
    ['#0F1B3B', '#1E3A74'],
    ['#10244A', '#2E5C9B'],
    ['#1B2E74', '#3F7BE4']
  ],
  xdr: [
    ['#2B0B3B', '#5C1B74'],
    ['#3B104A', '#7B2E9B'],
    ['#4A1B74', '#A855F7']
  ]
};