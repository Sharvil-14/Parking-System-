import { jsPDF } from 'jspdf';

export const generatePDFReceipt = (transaction, checkout) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a5'
  });

  // Color palette
  const darkBlue = '#0f172a';
  const brandBlue = '#2563eb';
  const emerald = '#10b981';

  // Title Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, 148, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('VPMS PARKING RECEIPT', 12, 14);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text('Official Payment Voucher & Slot Release', 12, 20);

  // Status Badge
  doc.setFillColor(16, 185, 129);
  doc.roundedRect(102, 10, 34, 8, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('PAID & RELEASED', 104, 15.5);

  let y = 38;

  // Transaction Info Box
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(12, y, 124, 24, 2, 2, 'FD');

  doc.setTextColor(51, 65, 85);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(`Transaction ID:`, 16, y + 8);
  doc.setFont('helvetica', 'normal');
  doc.text(`${transaction?.transactionId || 'TXN-90210'}`, 48, y + 8);

  doc.setFont('helvetica', 'bold');
  doc.text(`Payment Gateway:`, 16, y + 16);
  doc.setFont('helvetica', 'normal');
  doc.text(`${transaction?.paymentGateway || 'Stripe Test'} (${transaction?.paymentMethod || 'Card'})`, 48, y + 16);

  y += 32;

  // Table Details
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Parking Details Breakdown', 12, y);

  y += 4;
  doc.setLineWidth(0.4);
  doc.setDrawColor(37, 99, 235);
  doc.line(12, y, 136, y);

  y += 8;
  const items = [
    ['Vehicle Plate Number:', checkout?.vehicleNumber || 'CA-7890'],
    ['Facility Location:', checkout?.locationName || 'Metro Central Hub'],
    ['Assigned Slot:', checkout?.slotNumber || 'G-101'],
    ['Entry Time:', checkout?.entryTime ? new Date(checkout.entryTime).toLocaleString() : 'N/A'],
    ['Exit Time:', checkout?.exitTime ? new Date(checkout.exitTime).toLocaleString() : new Date().toLocaleString()],
    ['Billed Duration:', `${checkout?.billedHours || 1} Hour(s)`],
  ];

  doc.setFontSize(9);
  items.forEach(([label, value]) => {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(label, 14, y);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text(value, 64, y);
    y += 6.5;
  });

  y += 2;
  doc.setDrawColor(226, 232, 240);
  doc.line(12, y, 136, y);

  // Total Summary
  y += 10;
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(12, y, 124, 16, 2, 2, 'F');

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('TOTAL AMOUNT PAID:', 16, y + 10.5);

  doc.setTextColor(16, 185, 129);
  doc.setFontSize(14);
  doc.text(`$${(transaction?.amount || checkout?.totalFee || 0).toFixed(2)}`, 96, y + 10.5);

  // Footer Note & QR mockup
  y += 26;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(148, 163, 184);
  doc.text('Thank you for using VPMS Parking Management Services.', 12, y);
  doc.text('For queries or support, visit www.vpms-parking.com', 12, y + 4);

  // Save PDF
  doc.save(`VPMS_Receipt_${transaction?.transactionId || 'TXN'}.pdf`);
};
