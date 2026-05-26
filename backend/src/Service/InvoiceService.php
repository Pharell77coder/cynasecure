<?php

namespace App\Service;

use App\Entity\Payment;
use Dompdf\Dompdf;
use Dompdf\Options;

class InvoiceService
{
    private function logoBase64(): string
    {
        // 3 levels up from src/Service → project root → frontend/public
        $path = realpath(__DIR__ . '/../../../frontend/public/favicon.ico');
        if (!$path || !file_exists($path)) {
            return '';
        }

        $src = imagecreatefromstring(file_get_contents($path));
        if (!$src) {
            return '';
        }

        // Resize to 56×56 to keep the PDF lightweight
        $dst = imagecreatetruecolor(56, 56);
        imagealphablending($dst, false);
        imagesavealpha($dst, true);
        imagecopyresampled($dst, $src, 0, 0, 0, 0, 56, 56, imagesx($src), imagesy($src));
        imagedestroy($src);

        ob_start();
        imagepng($dst, null, 6);
        imagedestroy($dst);
        $png = ob_get_clean();

        return 'data:image/png;base64,' . base64_encode($png);
    }

    public function generate(Payment $payment): string
    {
        $order   = $payment->getOrderRef();
        $user    = $order?->getUser() ?? $payment->getSubscription()?->getUser();
        $billing = $order?->getBillingAddress() ?? [];
        $items   = $order?->getOrderItems() ?? [];

        $invoiceNumber = htmlspecialchars($payment->getInvoiceNumber() ?? 'INV-000', ENT_QUOTES, 'UTF-8');
        $invoiceDate   = $payment->getPaidAt()?->format('d/m/Y') ?? date('d/m/Y');

        $billingName = trim(($billing['firstName'] ?? '') . ' ' . ($billing['lastName'] ?? ''));
        if (!$billingName) {
            $billingName = $user?->getDisplayName() ?? 'Client';
        }

        $billingLines = [];
        if (!empty($billing['company']))  $billingLines[] = htmlspecialchars($billing['company'], ENT_QUOTES, 'UTF-8');
        if (!empty($billing['address']))  $billingLines[] = htmlspecialchars($billing['address'], ENT_QUOTES, 'UTF-8');
        $cityZip = trim(($billing['zipCode'] ?? '') . ' ' . ($billing['city'] ?? ''));
        if ($cityZip)                     $billingLines[] = htmlspecialchars($cityZip, ENT_QUOTES, 'UTF-8');
        if (!empty($billing['country']))  $billingLines[] = htmlspecialchars($billing['country'], ENT_QUOTES, 'UTF-8');
        if (!$billingLines)               $billingLines[] = htmlspecialchars($user?->getEmail() ?? '', ENT_QUOTES, 'UTF-8');

        $itemRows = '';
        $subtotal = 0.0;
        foreach ($items as $item) {
            $cycleLabel = $item->getBilling() === 'yearly' ? 'Annuel' : 'Mensuel';
            $price      = (float) $item->getPrice();
            $subtotal  += $price;
            $bg         = ($subtotal === $price) ? '#ffffff' : '#fafafa';
            $itemRows  .= sprintf(
                '<tr style="background:%s;">
                    <td style="padding:12px 16px;border-bottom:1px solid #f0f0f0;color:#111827;font-weight:500;">%s</td>
                    <td style="padding:12px 16px;border-bottom:1px solid #f0f0f0;color:#6b7280;text-align:center;">%s</td>
                    <td style="padding:12px 16px;border-bottom:1px solid #f0f0f0;color:#6b7280;text-align:center;">1</td>
                    <td style="padding:12px 16px;border-bottom:1px solid #f0f0f0;color:#111827;font-weight:600;text-align:right;">%s &euro;</td>
                </tr>',
                $bg,
                htmlspecialchars($item->getService()?->getName() ?? '—', ENT_QUOTES, 'UTF-8'),
                $cycleLabel,
                number_format($price, 2, ',', ' ')
            );
        }

        if (!$itemRows) {
            $subtotal = (float) $payment->getAmount();
            $itemRows = sprintf(
                '<tr>
                    <td style="padding:12px 16px;border-bottom:1px solid #f0f0f0;color:#111827;font-weight:500;">Abonnement CynaSecure</td>
                    <td style="padding:12px 16px;border-bottom:1px solid #f0f0f0;color:#6b7280;text-align:center;">—</td>
                    <td style="padding:12px 16px;border-bottom:1px solid #f0f0f0;color:#6b7280;text-align:center;">1</td>
                    <td style="padding:12px 16px;border-bottom:1px solid #f0f0f0;color:#111827;font-weight:600;text-align:right;">%s &euro;</td>
                </tr>',
                number_format($subtotal, 2, ',', ' ')
            );
        }

        $discount    = (float) ($order?->getDiscount() ?? 0);
        $discountRow = '';
        if ($discount > 0) {
            $discountRow = sprintf(
                '<tr>
                    <td colspan="3" style="padding:12px 16px;border-bottom:1px solid #f0f0f0;color:#059669;">Code promo</td>
                    <td style="padding:12px 16px;border-bottom:1px solid #f0f0f0;color:#059669;font-weight:600;text-align:right;">- %s &euro;</td>
                </tr>',
                number_format($discount, 2, ',', ' ')
            );
        }

        $total     = (float) $payment->getAmount();
        $vatRate   = 20;
        $vatAmount = $total - ($total / (1 + $vatRate / 100));
        $ht        = $total - $vatAmount;

        $gatewayLabel = $payment->getGateway() === 'paypal' ? 'PayPal' : 'Carte bancaire';
        if ($payment->getLast4()) {
            $gatewayLabel .= ' &bull;&bull;&bull;&bull; ' . $payment->getLast4();
        }

        $billingBlock = '<strong style="font-size:14px;color:#111827;">'
            . htmlspecialchars($billingName, ENT_QUOTES, 'UTF-8')
            . '</strong><br>' . implode('<br>', $billingLines);

        $logoSrc = $this->logoBase64();
        $logoImg = $logoSrc
            ? '<img src="' . $logoSrc . '" style="width:48px;height:48px;" alt="Logo" />'
            : '';

        $html = '<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Helvetica, Arial, sans-serif; background: #ffffff; color: #111827; font-size: 13px; }
  .page { padding: 44px 52px; max-width: 740px; margin: 0 auto; }
  .lbl { font-size: 9px; font-weight: bold; color: #9ca3af; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 4px; }
  .val { font-size: 13px; font-weight: 600; color: #111827; }
  .sep { height: 1px; background: #e5e7eb; margin: 28px 0; }
  .party-box { border: 1px solid #e5e7eb; padding: 16px 20px; font-size: 12.5px; color: #374151; line-height: 1.8; }
  table.items { width: 100%; border-collapse: collapse; border: 1px solid #e5e7eb; }
  table.items thead tr { background: #f9fafb; }
  table.items thead th { padding: 11px 16px; font-size: 9px; font-weight: bold; color: #9ca3af; letter-spacing: 1.5px; text-transform: uppercase; border-bottom: 1px solid #e5e7eb; }
  table.items thead th:first-child { text-align: left; }
  table.items thead th:last-child { text-align: right; }
</style>
</head>
<body>
<div class="page">

  <!-- HEADER -->
  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
    <tr>
      <td style="vertical-align:middle;">
        <table cellpadding="0" cellspacing="0">
          <tr>
            <td style="vertical-align:middle;padding-right:12px;">' . $logoImg . '</td>
            <td style="vertical-align:middle;">
              <div style="font-size:22px;font-weight:800;color:#111827;letter-spacing:-0.5px;line-height:1.1;">
                Cyna<span style="color:#2563eb;">Secure</span>
              </div>
              <div style="font-size:9px;font-weight:bold;color:#9ca3af;letter-spacing:2px;text-transform:uppercase;margin-top:3px;">
                Cybersecurite B2B
              </div>
            </td>
          </tr>
        </table>
      </td>
      <td style="text-align:right;vertical-align:top;">
        <div style="font-size:30px;font-weight:800;color:#111827;letter-spacing:-1px;line-height:1;">
          FAC<span style="color:#2563eb;">TURE</span>
        </div>
        <div style="font-size:12px;color:#6b7280;margin-top:5px;font-weight:500;">' . $invoiceNumber . '</div>
      </td>
    </tr>
  </table>

  <div class="sep" style="margin-top:0;"></div>

  <!-- META BAND -->
  <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;margin-bottom:32px;">
    <tr>
      <td style="padding:14px 18px;border-right:1px solid #e5e7eb;vertical-align:top;">
        <div class="lbl">Numero</div>
        <div class="val">' . $invoiceNumber . '</div>
      </td>
      <td style="padding:14px 18px;border-right:1px solid #e5e7eb;vertical-align:top;">
        <div class="lbl">Date d\'emission</div>
        <div class="val">' . $invoiceDate . '</div>
      </td>
      <td style="padding:14px 18px;border-right:1px solid #e5e7eb;vertical-align:top;">
        <div class="lbl">Statut</div>
        <div class="val" style="color:#059669;">Paye</div>
      </td>
      <td style="padding:14px 18px;vertical-align:top;">
        <div class="lbl">Moyen de paiement</div>
        <div class="val">' . $gatewayLabel . '</div>
      </td>
    </tr>
  </table>

  <!-- PARTIES -->
  <table width="100%" cellpadding="0" cellspacing="16" style="margin-bottom:32px;">
    <tr>
      <td width="48%" style="vertical-align:top;">
        <div class="lbl" style="margin-bottom:8px;">De</div>
        <div class="party-box">
          <strong style="font-size:14px;color:#111827;">CynaSecure SAS</strong><br>
          123 Avenue de la Cybersecurite<br>
          75001 Paris, France<br>
          SIRET : 000 000 000 00000<br>
          TVA : FR00 000 000 000
        </div>
      </td>
      <td width="4%"></td>
      <td width="48%" style="vertical-align:top;">
        <div class="lbl" style="margin-bottom:8px;">Facture a</div>
        <div class="party-box">' . $billingBlock . '</div>
      </td>
    </tr>
  </table>

  <!-- ITEMS TABLE -->
  <table class="items" cellpadding="0" cellspacing="0" style="margin-bottom:0;">
    <thead>
      <tr>
        <th style="text-align:left;width:45%;">Description</th>
        <th style="text-align:center;">Cycle</th>
        <th style="text-align:center;">Qte</th>
        <th style="text-align:right;">Montant</th>
      </tr>
    </thead>
    <tbody>
      ' . $itemRows . $discountRow . '
    </tbody>
  </table>

  <!-- TOTALS -->
  <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-top:none;margin-bottom:24px;">
    <tr style="background:#f9fafb;">
      <td style="padding:10px 16px;font-size:12px;color:#6b7280;">Sous-total HT</td>
      <td style="padding:10px 16px;font-size:12px;color:#374151;text-align:right;">' . number_format($ht, 2, ',', ' ') . ' &euro;</td>
    </tr>
    <tr style="background:#f9fafb;">
      <td style="padding:10px 16px;font-size:12px;color:#6b7280;border-top:1px solid #e5e7eb;">TVA ' . $vatRate . '%</td>
      <td style="padding:10px 16px;font-size:12px;color:#374151;text-align:right;border-top:1px solid #e5e7eb;">' . number_format($vatAmount, 2, ',', ' ') . ' &euro;</td>
    </tr>
    <tr style="background:#111827;">
      <td style="padding:14px 16px;font-size:14px;font-weight:bold;color:#ffffff;border-top:2px solid #2563eb;">Total TTC</td>
      <td style="padding:14px 16px;font-size:18px;font-weight:800;color:#ffffff;text-align:right;border-top:2px solid #2563eb;">' . number_format($total, 2, ',', ' ') . ' &euro;</td>
    </tr>
  </table>

  <!-- CONFIRMATION -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;border:1px solid #bbf7d0;margin-bottom:40px;">
    <tr>
      <td style="padding:14px 18px;vertical-align:middle;width:32px;font-size:18px;color:#059669;font-weight:bold;">OK</td>
      <td style="padding:14px 4px;vertical-align:middle;">
        <div style="font-size:12.5px;color:#065f46;font-weight:600;">Paiement recu - Merci pour votre confiance.</div>
        <div style="font-size:11px;color:#6b7280;margin-top:2px;">Cette facture confirme le reglement integral de la commande ' . $invoiceNumber . '.</div>
      </td>
    </tr>
  </table>

  <div class="sep"></div>

  <!-- FOOTER -->
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td style="vertical-align:top;">
        <div style="font-size:12px;font-weight:bold;color:#6b7280;margin-bottom:4px;">CynaSecure SAS</div>
        <div style="font-size:11px;color:#9ca3af;line-height:1.7;">
          123 Avenue de la Cybersecurite, 75001 Paris<br>
          support@cynasecure.fr &bull; cynasecure.fr
        </div>
      </td>
      <td style="text-align:right;vertical-align:top;">
        <div style="font-size:11px;color:#9ca3af;line-height:1.7;">
          SIRET 000 000 000 00000<br>
          TVA FR00 000 000 000<br>
          Capital social : 10 000 &euro;
        </div>
      </td>
    </tr>
  </table>

</div>
</body>
</html>';

        $options = new Options();
        $options->set('isHtml5ParserEnabled', true);
        $options->set('isPhpEnabled', false);
        $options->set('isRemoteEnabled', false);
        $options->set('defaultFont', 'Helvetica');

        $dompdf = new Dompdf($options);
        $dompdf->loadHtml($html);
        $dompdf->setPaper('A4', 'portrait');
        $dompdf->render();

        return $dompdf->output();
    }
}
