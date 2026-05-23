<?php

namespace App\Service;

class ChatbotService
{
    private array $faq = [
        [
            'keywords' => ['modifier', 'changer', 'upgrade', 'downgrade', 'plan', 'formule'],
            'answer'   => 'Pour modifier votre abonnement, rendez-vous dans votre espace client > "Mes abonnements" puis cliquez sur "Modifier le plan". Le changement prend effet au prochain cycle de facturation. Si vous souhaitez passer à un plan supérieur immédiatement, contactez notre support.',
        ],
        [
            'keywords' => ['paiement', 'payer', 'carte', 'virement', 'cb', 'visa', 'mastercard', 'prélèvement'],
            'answer'   => 'Nous acceptons les cartes bancaires (Visa, Mastercard, American Express) via Stripe, ainsi que les virements SEPA pour les contrats annuels. Toutes les transactions sont sécurisées et chiffrées. Aucune donnée de carte n\'est stockée sur nos serveurs.',
        ],
        [
            'keywords' => ['annuler', 'annulation', 'résilier', 'résiliation', 'stopper', 'arrêter'],
            'answer'   => 'Pour annuler votre abonnement, accédez à "Mes abonnements" > "Annuler". L\'annulation prend effet à la fin de la période en cours — vous conservez l\'accès jusqu\'à cette date. Aucun remboursement au prorata n\'est appliqué pour les abonnements mensuels.',
        ],
        [
            'keywords' => ['délai', 'réponse', 'temps', 'combien', 'rapide', 'attente'],
            'answer'   => 'Notre support répond sous 4 heures ouvrées pour les demandes standard. Pour les incidents critiques (P1/P2), notre SOC est joignable 24h/7j et répond en moins de 15 minutes. Vous pouvez suivre l\'état de votre ticket depuis votre espace client.',
        ],
        [
            'keywords' => ['support', 'contacter', 'aide', 'technique', 'incident', 'bug', 'problème'],
            'answer'   => 'Pour contacter notre support technique, utilisez le formulaire ci-dessous ou envoyez un email à support@cynasecure.fr. Pour les urgences, notre ligne dédiée est disponible 24h/7j au +33 1 42 XX XX XX. Pensez à mentionner votre ID client pour accélérer le traitement.',
        ],
        [
            'keywords' => ['déployer', 'agent', 'installation', 'installer', 'onboarding', 'démarrer', 'poc'],
            'answer'   => 'Le déploiement de l\'agent CynaSecure prend moins de 48h. Nos ingénieurs vous accompagnent de A à Z : un call de kickoff, un guide adapté à votre infrastructure (GPO, Ansible, MDM), puis une revue de posture J+7. Démarrez un POC gratuit depuis la page d\'accueil.',
        ],
        [
            'keywords' => ['facture', 'facturation', 'invoice', 'reçu'],
            'answer'   => 'Vos factures sont disponibles dans votre espace client > "Mes paiements". Chaque facture est générée automatiquement et envoyée par email à la date de renouvellement. Pour une demande de facture proforma ou un justificatif comptable, contactez billing@cynasecure.fr.',
        ],
    ];

    public function respond(string $input): string
    {
        $lower = mb_strtolower($input);

        foreach ($this->faq as $entry) {
            foreach ($entry['keywords'] as $kw) {
                if (str_contains($lower, $kw)) {
                    return $entry['answer'];
                }
            }
        }

        return '';
    }
}
