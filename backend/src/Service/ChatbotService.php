<?php

namespace App\Service;

use App\Entity\Service;
use Doctrine\ORM\EntityManagerInterface;

class ChatbotService
{
    public function __construct(private EntityManagerInterface $em) {}

    private array $faq = [
        [
            'question' => 'Comment modifier mon abonnement ?',
            'keywords' => ['modifier', 'changer', 'upgrade', 'downgrade', 'plan', 'formule'],
            'answer'   => "Pour modifier votre abonnement, rendez-vous dans votre espace client > \"Mes abonnements\" puis cliquez sur \"Modifier le plan\". Le changement prend effet au prochain cycle de facturation. Si vous souhaitez passer à un plan supérieur immédiatement, contactez notre support.",
        ],
        [
            'question' => 'Quelles méthodes de paiement acceptez-vous ?',
            'keywords' => ['paiement', 'payer', 'carte', 'virement', 'cb', 'visa', 'mastercard', 'prélèvement'],
            'answer'   => "Nous acceptons les cartes bancaires (Visa, Mastercard, American Express) via Stripe, ainsi que les virements SEPA pour les contrats annuels. Toutes les transactions sont sécurisées et chiffrées. Aucune donnée de carte n'est stockée sur nos serveurs.",
        ],
        [
            'question' => 'Comment annuler mon abonnement ?',
            'keywords' => ['annuler', 'annulation', 'résilier', 'résiliation', 'stopper', 'arrêter'],
            'answer'   => "Pour annuler votre abonnement, accédez à \"Mes abonnements\" > \"Annuler\". L'annulation prend effet à la fin de la période en cours — vous conservez l'accès jusqu'à cette date. Aucun remboursement au prorata n'est appliqué pour les abonnements mensuels.",
        ],
        [
            'question' => 'Quels sont vos délais de réponse ?',
            'keywords' => ['délai', 'réponse', 'temps', 'combien', 'rapide', 'attente'],
            'answer'   => "Notre support répond sous 4 heures ouvrées pour les demandes standard. Pour les incidents critiques (P1/P2), notre SOC est joignable 24h/7j et répond en moins de 15 minutes. Vous pouvez suivre l'état de votre ticket depuis votre espace client.",
        ],
        [
            'question' => 'Comment contacter le support technique ?',
            'keywords' => ['support', 'aide', 'technique', 'incident', 'bug', 'problème'],
            'answer'   => "Pour contacter notre support technique, utilisez le formulaire ci-dessous ou envoyez un email à support@cynasecure.fr. Pour les urgences, notre ligne dédiée est disponible 24h/7j. Pensez à mentionner votre ID client pour accélérer le traitement.",
        ],
        [
            'question' => 'Comment déployer l\'agent CynaSecure ?',
            'keywords' => ['déployer', 'agent', 'installation', 'installer', 'onboarding', 'démarrer', 'poc'],
            'answer'   => "Le déploiement de l'agent CynaSecure prend moins de 48h. Nos ingénieurs vous accompagnent : call de kickoff, guide adapté à votre infrastructure (GPO, Ansible, MDM), puis revue de posture J+7. Démarrez un POC gratuit depuis la page d'accueil.",
        ],
        [
            'question' => 'Comment obtenir mes factures ?',
            'keywords' => ['facture', 'facturation', 'invoice', 'reçu'],
            'answer'   => "Vos factures sont disponibles dans votre espace client > \"Mes paiements\". Chaque facture est générée automatiquement et envoyée par email à la date de renouvellement. Pour une facture proforma, contactez billing@cynasecure.fr.",
        ],
    ];

    public function getFaqQuestions(): array
    {
        return array_column($this->faq, 'question');
    }

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

        // Recherche par nom de service
        $services = $this->em->getRepository(Service::class)->findAll();
        foreach ($services as $service) {
            if (str_contains($lower, mb_strtolower((string) $service->getName()))) {
                return $this->buildServiceAnswer($service);
            }
        }

        return '';
    }

    private function buildServiceAnswer(Service $s): string
    {
        $price  = number_format((float) $s->getPriceMonthly(), 2, ',', ' ');
        $answer = $s->getName() . "\n\n";

        if ($s->getDescription()) {
            $answer .= $s->getDescription() . "\n\n";
        }

        $answer .= "Tarif : à partir de {$price} €/mois";

        if ($s->getPriceYearly()) {
            $yearly = number_format($s->getPriceYearly(), 2, ',', ' ');
            $answer .= " (ou {$yearly} €/an)";
        }

        $answer .= ".";

        $features = $s->getFeatures() ?? [];
        $included = array_filter($features, fn($f) => is_array($f) && ($f['included'] ?? false));
        $labels   = array_values(array_map(fn($f) => $f['label'] ?? '', $included));

        if (!empty($labels)) {
            $answer .= "\n\nInclus : " . implode(', ', array_slice($labels, 0, 4)) . ".";
        }

        $answer .= "\n\nPour souscrire, rendez-vous sur le catalogue ou démarrez un POC gratuit.";

        return $answer;
    }
}

