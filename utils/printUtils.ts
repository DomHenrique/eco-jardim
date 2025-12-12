import { Order } from '../types';
import { COLORS, BRAND, LOCALE, MESSAGES } from '../config';

/**
 * Generate printable HTML for an order
 */
export const generateOrderPrintHTML = (order: Order): string => {
  const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
  const userInfo = order.userInfo;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Pedido #${order.id.substring(0, 8)}</title>
      <style>
        @media print {
          @page { margin: 1cm; }
          body { margin: 0; }
          .no-print { display: none; }
        }
        
        body {
          font-family: Arial, sans-serif;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          color: #333;
        }
        
        .header {
          text-align: center;
          border-bottom: 3px solid ${COLORS.primary[600]};
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        
        .header h1 {
          color: ${COLORS.primary[600]};
          margin: 0;
          font-size: 28px;
        }
        
        .header p {
          margin: 5px 0;
          color: #666;
        }
        
        .order-info {
          background: ${COLORS.secondary[50]};
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 20px;
        }
        
        .order-info h2 {
          margin-top: 0;
          color: ${COLORS.primary[600]};
          font-size: 18px;
        }
        
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        
        .info-item {
          margin: 5px 0;
        }
        
        .info-label {
          font-weight: bold;
          color: #666;
        }
        
        .customer-info {
          background: ${COLORS.primary[50]};
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 20px;
        }
        
        .customer-info h2 {
          margin-top: 0;
          color: ${COLORS.primary[600]};
          font-size: 18px;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        
        th {
          background: ${COLORS.primary[600]};
          color: white;
          padding: 12px;
          text-align: left;
          font-weight: bold;
        }
        
        td {
          padding: 10px 12px;
          border-bottom: 1px solid #e5e7eb;
        }
        
        tr:hover {
          background: ${COLORS.secondary[50]};
        }
        
        .text-right {
          text-align: right;
        }
        
        .total-row {
          background: ${COLORS.primary[50]};
          font-weight: bold;
          font-size: 18px;
        }
        
        .total-row td {
          padding: 15px 12px;
          border-top: 2px solid ${COLORS.primary[600]};
        }
        
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 2px solid #e5e7eb;
          text-align: center;
          color: #666;
          font-size: 12px;
        }
        
        .print-button {
          background: ${COLORS.primary[600]};
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 16px;
          margin: 20px auto;
          display: block;
        }
        
        .print-button:hover {
          background: ${COLORS.primary[700]};
        }
        
        .status-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: bold;
        }
        
        .status-pending { background: #fef3c7; color: #92400e; }
        .status-confirmed { background: #dbeafe; color: #1e40af; }
        .status-processing { background: #e0e7ff; color: #4338ca; }
        .status-shipped { background: #ddd6fe; color: #5b21b6; }
        .status-delivered { background: ${COLORS.primary[100]}; color: ${COLORS.primary[800]}; }
        .status-cancelled { background: #fee2e2; color: #991b1b; }
      </style>
    </head>
    <body>
      <button class="print-button no-print" onclick="window.print()">🖨️ Imprimir</button>
      
      <div class="header">
        <h1>${BRAND.logoBrand}</h1>
        <p>${BRAND.description}</p>
        <p>${BRAND.address} | ${BRAND.phone}</p>
      </div>
      
      <div class="order-info">
        <h2>📋 Informações do Pedido</h2>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">Número do Pedido:</span> #${order.id.substring(0, 8).toUpperCase()}
          </div>
          <div class="info-item">
            <span class="info-label">Data:</span> ${new Date(order.date).toLocaleDateString('pt-BR', { 
              day: '2-digit', 
              month: 'long', 
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
          <div class="info-item">
            <span class="info-label">Status:</span> 
            <span class="status-badge status-${order.status}">
              ${getStatusLabel(order.status)}
            </span>
          </div>
          <div class="info-item">
            <span class="info-label">Total:</span> ${LOCALE.formatCurrency(order.total)}
          </div>
        </div>
      </div>
      
      <div class="customer-info">
        <h2>👤 Dados do Cliente</h2>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">Nome:</span> ${userInfo.name || 'N/A'}
          </div>
          <div class="info-item">
            <span class="info-label">Email:</span> ${userInfo.email || 'N/A'}
          </div>
          <div class="info-item">
            <span class="info-label">Telefone:</span> ${userInfo.phone || 'N/A'}
          </div>
          <div class="info-item">
            <span class="info-label">CEP:</span> ${userInfo.zip || 'N/A'}
          </div>
          <div class="info-item" style="grid-column: 1 / -1;">
            <span class="info-label">Endereço:</span> ${userInfo.address || 'N/A'}
          </div>
          <div class="info-item">
            <span class="info-label">Cidade:</span> ${userInfo.city || 'N/A'}
          </div>
        </div>
      </div>
      
      <h2>🛒 Itens do Pedido</h2>
      <table>
        <thead>
          <tr>
            <th>${MESSAGES.products.description}</th>
            <th>Categoria</th>
            <th class="text-right">${MESSAGES.products.quantity}</th>
            <th class="text-right">Preço Unit.</th>
            <th class="text-right">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${items.map((item: any) => `
            <tr>
              <td>${item.name}</td>
              <td>${item.category}</td>
              <td class="text-right">${item.quantity} ${item.unit}</td>
              <td class="text-right">${LOCALE.formatCurrency(item.price)}</td>
              <td class="text-right">${LOCALE.formatCurrency(item.price * item.quantity)}</td>
            </tr>
          `).join('')}
        </tbody>
        <tfoot>
          <tr class="total-row">
            <td colspan="4" class="text-right">${MESSAGES.cart.total}</td>
            <td class="text-right">${LOCALE.formatCurrency(order.total)}</td>
          </tr>
        </tfoot>
      </table>
      
      <div class="footer">
        <p><strong>${BRAND.companyName}</strong> - ${BRAND.tagline}</p>
        <p>CNPJ: 00.000.000/0000-00 | IE: 000.000.000.000</p>
        <p>Impresso em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</p>
      </div>
    </body>
    </html>
  `;
};

/**
 * Get status label in Portuguese
 */
const getStatusLabel = (status: string): string => {
  const labels = MESSAGES.orderStatus as Record<string, string>;
  return labels[status] || status;
};

/**
 * Print order in new window
 */
export const printOrder = (order: Order): void => {
  const printWindow = window.open('', '_blank');
  
  if (!printWindow) {
    alert('Por favor, permita pop-ups para imprimir o pedido.');
    return;
  }
  
  const html = generateOrderPrintHTML(order);
  printWindow.document.write(html);
  printWindow.document.close();
};

/**
 * Export orders to CSV
 */
export const exportOrdersToCSV = (orders: Order[], filename: string = 'pedidos.csv'): void => {
  const headers = [
    MESSAGES.csvHeaders.orderId,
    MESSAGES.csvHeaders.date,
    MESSAGES.csvHeaders.customerName,
    MESSAGES.csvHeaders.email,
    MESSAGES.csvHeaders.phone,
    MESSAGES.csvHeaders.total,
    MESSAGES.csvHeaders.status,
    MESSAGES.csvHeaders.itemCount,
  ];

  const rows = orders.map(order => {
    const userInfo = order.userInfo;
    const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
    
    return [
      order.id.substring(0, 8),
      new Date(order.date).toLocaleDateString('pt-BR'),
      `"${userInfo.name || 'N/A'}"`,
      `"${userInfo.email || 'N/A'}"`,
      `"${userInfo.phone || 'N/A'}"`,
      LOCALE.formatCurrency(order.total),
      getStatusLabel(order.status),
      items.length
    ];
  });

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
