<?php

namespace App\Service;

use App\Entity\Payment;
use Dompdf\Dompdf;
use Dompdf\Options;

class InvoiceService
{
    public function generate(Payment $payment): string
    {
        $order    = $payment->getOrderRef();
        $user     = $order?->getUser();
        $billing  = $order?->getBillingAddress() ?? [];
        $items    = $order?->getOrderItems() ?? [];

        $itemRows = '';
        foreach ($items as $item) {
            $billingLabel = $item->getBilling() === 'yearly' ? 'Annuel' : 'Mensuel';
            $itemRows .= sprintf(
                '<tr>
                    <td style="padding:10px 8px;border-bottom:1px solid #2a2a2a;color:#e5e7eb;">%s</td>
                    <td style="padding:10px 8px;border-bottom:1px solid #2a2a2a;color:#9ca3af;text-align:center;">%s</td>
                    <td style="padding:10px 8px;border-bottom:1px solid #2a2a2a;color:#e5e7eb;text-align:right;">%s €</td>
                </tr>',
                htmlspecialchars($item->getService()?->getName() ?? '-', ENT_QUOTES, 'UTF-8'),
                $billingLabel,
                number_format($item->getPrice(), 2, ',', ' ')
            );
        }

        $billingName = trim(($billing['firstName'] ?? '') . ' ' . ($billing['lastName'] ?? ''));
        if (!$billingName) {
            $billingName = $user?->getDisplayName() ?? 'Client';
        }

        $billingAddress = '';
        if (!empty($billing['company'])) {
            $billingAddress .= htmlspecialchars($billing['company'], ENT_QUOTES, 'UTF-8') . '<br>';
        }
        if (!empty($billing['address'])) {
            $billingAddress .= htmlspecialchars($billing['address'], ENT_QUOTES, 'UTF-8') . '<br>';
        }
        if (!empty($billing['zipCode']) || !empty($billing['city'])) {
            $billingAddress .= htmlspecialchars(trim(($billing['zipCode'] ?? '') . ' ' . ($billing['city'] ?? '')), ENT_QUOTES, 'UTF-8') . '<br>';
        }
        if (!empty($billing['country'])) {
            $billingAddress .= htmlspecialchars($billing['country'], ENT_QUOTES, 'UTF-8');
        }

        $gatewayLabel = $payment->getGateway() === 'paypal' ? 'PayPal' : 'Carte bancaire';
        if ($payment->getLast4()) {
            $gatewayLabel .= ' •••• ' . $payment->getLast4();
        }

        $html = '<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<style>
  body { font-family: Arial, sans-serif; background:#0a0a0f; color:#e5e7eb; margin:0; padding:0; }
  .page { padding:40px; max-width:700px; margin:0 auto; }
  .header { display:flex; justify-content:space-between; align-items:flex-start; border-bottom:2px solid #1e40af; padding-bottom:24px; margin-bottom:32px; }
  .brand { font-size:22px; font-weight:900; color:#fff; letter-spacing:-0.5px; }
  .brand span { color:#3b82f6; }
  .badge { background:#1e40af; color:#93c5fd; font-size:10px; font-weight:700; letter-spacing:2px; padding:3px 10px; border-radius:2px; margin-top:6px; display:inline-block; }
  .invoice-meta { text-align:right; font-size:12px; color:#9ca3af; line-height:1.8; }
  .invoice-meta strong { color:#e5e7eb; font-size:13px; }
  .section { margin-bottom:28px; }
  .section-title { font-size:10px; font-weight:700; color:#6b7280; letter-spacing:2px; text-transform:uppercase; margin-bottom:10px; }
  .billing-box { background:#111827; border:1px solid #1f2937; padding:16px 20px; font-size:13px; line-height:1.8; color:#d1d5db; }
  .billing-box strong { color:#fff; font-size:14px; }
  table { width:100%; border-collapse:collapse; }
  thead tr { background:#111827; }
  thead th { padding:10px 8px; text-align:left; font-size:10px; font-weight:700; color:#6b7280; letter-spacing:1.5px; text-transform:uppercase; border-bottom:1px solid #1f2937; }
  thead th:last-child { text-align:right; }
  .total-row { background:#111827; }
  .total-row td { padding:14px 8px; font-weight:700; color:#fff; font-size:16px; }
  .footer { margin-top:40px; padding-top:20px; border-top:1px solid #1f2937; font-size:11px; color:#4b5563; text-align:center; line-height:1.7; }
  .test-badge { background:#7c3aed; color:#ddd6fe; font-size:9px; font-weight:700; letter-spacing:1px; padding:2px 8px; border-radius:2px; }
</style>
</head>
<body>
<div class="page">

  <div class="header">
    <div>
      <div class="brand">Cyna<span>Secure</span></div>
      <div class="badge">MODE TEST</div>
    </div>
    <div class="invoice-meta">
      <strong>' . htmlspecialchars($payment->getInvoiceNumber() ?? 'INV-000', ENT_QUOTES, 'UTF-8') . '</strong><br>
      Date : ' . ($payment->getPaidAt()?->format('d/m/Y') ?? date('d/m/Y')) . '<br>
      Statut : <span style="color:#34d399;">Payé</span>
    </div>
  </div>

  <div style="display:flex;gap:32px;margin-bottom:32px;">
    <div style="flex:1;">
      <div class="section-title">Émetteur</div>
      <div class="billing-box">
        <strong>CynaSecure SAS</strong><br>
        123 Avenue de la Cybersécurité<br>
        75001 Paris, France<br>
        SIRET : 000 000 000 00000<br>
        TVA : FR00000000000
      </div>
    </div>
    <div style="flex:1;">
      <div class="section-title">Facturé à</div>
      <div class="billing-box">
        <strong>' . htmlspecialchars($billingName, ENT_QUOTES, 'UTF-8') . '</strong><br>
        ' . ($billingAddress ?: htmlspecialchars($user?->getEmail() ?? '', ENT_QUOTES, 'UTF-8')) . '
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Détail de la commande</div>
    <table>
      <thead>
        <tr>
          <th>Service</th>
          <th style="text-align:center;">Cycle</th>
          <th style="text-align:right;">Montant</th>
        </tr>
      </thead>
      <tbody>
        ' . $itemRows . '
      </tbody>
      <tfoot>
        <tr class="total-row">
          <td colspan="2" style="color:#9ca3af;font-size:13px;">Moyen de paiement : ' . $gatewayLabel . '</td>
          <td style="text-align:right;">Total TTC : ' . number_format($payment->getAmount(), 2, ',', ' ') . ' €</td>
        </tr>
      </tfoot>
    </table>
  </div>

  <div class="footer">
    <span class="test-badge">PAIEMENT TEST — AUCUN MONTANT RÉEL DÉBITÉ</span><br><br>
    CynaSecure SAS · support@cynasecure.fr · cynasecure.fr<br>
    Les présentes factures sont générées à titre de simulation dans le cadre d\'un projet pédagogique.
  </div>

</div>
</body>
</html>';

        $options = new Options();
        $options->set('isHtml5ParserEnabled', true);
        $options->set('isPhpEnabled', false);

        $dompdf = new Dompdf($options);
        $dompdf->loadHtml($html);
        $dompdf->setPaper('A4', 'portrait');
        $dompdf->render();

        return $dompdf->output();
    }
}
