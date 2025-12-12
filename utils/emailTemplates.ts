import { Order, CartItem } from '../types';
import { BRAND, CONTACT, COLORS } from '../config';

export const getWelcomeEmailTemplate = (name: string) => {
  return `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h1>Bem-vindo(a) à ${BRAND.companyName}, ${name}!</h1>
      <p>Estamos muito felizes em tê-lo(a) conosco.</p>
      <p>Agora você pode explorar nossa variedade de pedras ornamentais, bloquetes e serviços de jardinagem.</p>
      <p>Se tiver alguma dúvida, não hesite em nos contatar.</p>
      <br>
      <p>Atenciosamente,</p>
      <p>Equipe ${BRAND.companyName}</p>
    </div>
  `;
};

export const getOrderConfirmationTemplate = (order: Order) => {
  const itemsHtml = order.items.map(item => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.name}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.quantity} ${item.unit}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd;">R$ ${item.price.toFixed(2)}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd;">R$ ${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `).join('');

  return `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h1>Confirmação de Pedido #${order.id}</h1>
      <p>Olá ${order.userInfo.name},</p>
      <p>Recebemos seu pedido com sucesso! Abaixo estão os detalhes:</p>
      
      <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
        <thead>
          <tr style="background-color: #f2f2f2;">
            <th style="padding: 8px; text-align: left;">Produto</th>
            <th style="padding: 8px; text-align: left;">Qtd</th>
            <th style="padding: 8px; text-align: left;">Preço Unit.</th>
            <th style="padding: 8px; text-align: left;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="3" style="padding: 8px; text-align: right; font-weight: bold;">Total:</td>
            <td style="padding: 8px; font-weight: bold;">R$ ${order.total.toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>

      <p><strong>Endereço de Entrega:</strong> ${order.userInfo.address}, ${order.userInfo.city} - ${order.userInfo.zip}</p>
      <p><strong>Método de Pagamento:</strong> ${order.userInfo.paymentMethod}</p>
      
      <p>Você receberá atualizações sobre o status do seu pedido por e-mail.</p>
      <br>
      <p>Obrigado por comprar conosco!</p>
      <p>Equipe ${BRAND.companyName}</p>
    </div>
  `;
};

export const getOrderStatusUpdateTemplate = (order: Order) => {
  const statusMap: Record<string, string> = {
    pending: 'Pendente',
    confirmed: 'Confirmado',
    processing: 'Em Processamento',
    shipped: 'Enviado',
    delivered: 'Entregue',
    cancelled: 'Cancelado'
  };

  const statusText = statusMap[order.status] || order.status;

  return `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h1>Atualização do Pedido #${order.id}</h1>
      <p>Olá ${order.userInfo.name},</p>
      <p>O status do seu pedido foi atualizado para: <strong>${statusText}</strong>.</p>
      
      <p>Se você tiver alguma dúvida, entre em contato conosco.</p>
      <br>
      <p>Atenciosamente,</p>
      <p>Equipe ${BRAND.companyName}</p>
    </div>
  `;
};

export const getAbandonedCartTemplate = (items: CartItem[], checkoutUrl: string) => {
  const itemsHtml = items.map(item => `
    <li>${item.name} - ${item.quantity} ${item.unit}</li>
  `).join('');

  return `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h1>Você esqueceu algo no carrinho!</h1>
      <p>Olá,</p>
      <p>Notamos que você deixou alguns itens no seu carrinho. Eles estão esperando por você!</p>

      <ul>
        ${itemsHtml}
      </ul>

      <p>Clique no link abaixo para finalizar sua compra:</p>
      <a href="${checkoutUrl}" style="background-color: ${COLORS.primary[600]}; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Finalizar Compra</a>

      <br><br>
      <p>Atenciosamente,</p>
      <p>Equipe ${BRAND.companyName}</p>
    </div>
  `;
};

export const getBudgetNotificationTemplate = (budget: any) => {
  const itemsHtml = budget.items.map((item: any) => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.name}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.quantity} ${item.unit}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd;">R$ ${item.price.toFixed(2)}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd;">R$ ${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `).join('');

  return `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h1>Novo Orçamento Criado #${budget.id}</h1>
      <p>Olá ${budget.customer_name || 'Cliente'},</p>
      <p>Um novo orçamento foi criado com sucesso. Abaixo estão os detalhes:</p>

      <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
        <thead>
          <tr style="background-color: #f2f2f2;">
            <th style="padding: 8px; text-align: left;">Produto/Serviço</th>
            <th style="padding: 8px; text-align: left;">Qtd</th>
            <th style="padding: 8px; text-align: left;">Preço Unit.</th>
            <th style="padding: 8px; text-align: left;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="3" style="padding: 8px; text-align: right; font-weight: bold;">Subtotal:</td>
            <td style="padding: 8px;">R$ ${budget.subtotal.toFixed(2)}</td>
          </tr>
          ${budget.tax ? `
            <tr>
              <td colspan="3" style="padding: 8px; text-align: right;">Taxa:</td>
              <td style="padding: 8px;">R$ ${budget.tax.toFixed(2)}</td>
            </tr>
          ` : ''}
          <tr>
            <td colspan="3" style="padding: 8px; text-align: right; font-weight: bold;">Total:</td>
            <td style="padding: 8px; font-weight: bold;">R$ ${budget.total.toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>

      <p><strong>Data de Validade:</strong> ${new Date(budget.valid_until).toLocaleDateString('pt-BR')}</p>
      <p>Se você tiver alguma dúvida sobre este orçamento, entre em contato conosco.</p>
      <br>
      <p>Atenciosamente,</p>
      <p>Equipe ${BRAND.companyName}</p>
    </div>
  `;
};

export const getBudgetStatusUpdateTemplate = (budget: any) => {
  const statusMap: Record<string, string> = {
    draft: 'Rascunho',
    sent: 'Enviado',
    accepted: 'Aceito',
    rejected: 'Rejeitado',
    expired: 'Expirado'
  };

  const statusText = statusMap[budget.status] || budget.status;
  const statusMessages: Record<string, string> = {
    accepted: 'Parabéns! Seu orçamento foi aceito e estará em processamento.',
    rejected: 'Lamentamos informar que seu orçamento foi rejeitado.',
    expired: 'Informamos que seu orçamento expirou e não está mais disponível.',
    sent: 'Seu orçamento foi enviado para sua análise.'
  };

  const message = statusMessages[budget.status] || `Seu orçamento foi atualizado para o status: ${statusText}.`;

  return `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h1>Atualização de Orçamento #${budget.id}</h1>
      <p>Olá ${budget.customer_name || 'Cliente'},</p>
      <p>${message}</p>
      <p>O status do seu orçamento foi atualizado para: <strong>${statusText}</strong>.</p>

      <p>Total: R$ ${budget.total.toFixed(2)}</p>
      <p>Data de Validade: ${new Date(budget.valid_until).toLocaleDateString('pt-BR')}</p>

      <p>Se você tiver alguma dúvida, entre em contato conosco.</p>
      <br>
      <p>Atenciosamente,</p>
      <p>Equipe ${BRAND.companyName}</p>
    </div>
  `;
};
