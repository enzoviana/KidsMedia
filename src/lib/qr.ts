// Génération de QR codes 100 % navigateur/worker (qrcode-generator, sans dépendance Node).
import qrcode from "qrcode-generator";

export function qrDataUrl(text: string, size = 260, margin = 1): string {
  const qr = qrcode(0, "M");
  qr.addData(text);
  qr.make();
  const count = qr.getModuleCount();
  const cell = Math.max(1, Math.floor(size / (count + margin * 2)));
  return qr.createDataURL(cell, margin * cell);
}
