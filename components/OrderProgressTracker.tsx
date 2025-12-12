import React from 'react';
import { Order, OrderStatus } from '../types';
import { Calendar, Package, Truck, CheckCircle, XCircle, Clock, FileText } from 'lucide-react';

interface OrderProgressTrackerProps {
  order: Order;
}

const OrderProgressTracker: React.FC<OrderProgressTrackerProps> = ({ order }) => {
  // Define the order status flow and their display properties
  const statusFlow = [
    { 
      status: 'pending', 
      label: 'Pedido Recebido', 
      icon: Clock,
      description: 'Seu pedido foi recebido e está sendo analisado'
    },
    { 
      status: 'quotation', 
      label: 'Solicitando Orçamento', 
      icon: FileText,
      description: 'Solicitação de orçamento em andamento'
    },
    { 
      status: 'quoted', 
      label: 'Orçamento Enviado', 
      icon: FileText,
      description: 'Orçamento enviado para sua aprovação'
    },
    { 
      status: 'confirmed', 
      label: 'Pedido Confirmado', 
      icon: CheckCircle,
      description: 'Pedido confirmado e aguardando processamento'
    },
    { 
      status: 'processing', 
      label: 'Em Processamento', 
      icon: Package,
      description: 'Seu pedido está sendo preparado'
    },
    { 
      status: 'ready', 
      label: 'Pronto para Entrega', 
      icon: Package,
      description: 'Pedido pronto para envio ou retirada'
    },
    { 
      status: 'shipped', 
      label: 'Enviado', 
      icon: Truck,
      description: 'Seu pedido foi enviado'
    },
    { 
      status: 'delivered', 
      label: 'Entregue', 
      icon: CheckCircle,
      description: 'Pedido entregue com sucesso'
    }
  ];

  // Define the current step index based on order status
  const currentStepIndex = statusFlow.findIndex(step => step.status === order.status);
  const isCancelled = order.status === 'cancelled';
  const isRejected = order.status === 'rejected';

  // Determine if a step is completed, current, or upcoming
  const getStepStatus = (index: number) => {
    if (isCancelled || isRejected) {
      // For cancelled/rejected orders, only steps up to the point of cancellation/rejection are completed
      return index < currentStepIndex ? 'completed' : 
             index === currentStepIndex ? (isCancelled ? 'cancelled' : 'rejected') : 'upcoming';
    }
    return index < currentStepIndex ? 'completed' : 
           index === currentStepIndex ? 'current' : 'upcoming';
  };

  // Get the current status details
  const currentStatusDetails = statusFlow.find(step => step.status === order.status);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-2">Progresso do Pedido #{order.id.substring(0, 8)}</h2>
        <p className="text-gray-600 mb-4">Status atual: <span className="font-semibold">{currentStatusDetails?.label}</span></p>
        
        {currentStatusDetails && (
          <p className="text-gray-700 bg-blue-50 p-3 rounded-md">
            {currentStatusDetails.description}
          </p>
        )}
        
        {/* Special status for cancelled or rejected orders */}
        {(isCancelled || isRejected) && (
          <div className={`mt-3 p-3 rounded-md flex items-center ${isCancelled ? 'bg-red-50 text-red-700' : 'bg-orange-50 text-orange-700'}`}>
            <XCircle className="mr-2 h-5 w-5" />
            {isCancelled 
              ? 'Este pedido foi cancelado.' 
              : 'Este orçamento foi rejeitado.'}
          </div>
        )}
      </div>

      {/* Progress steps */}
      <div className="relative">
        {/* Progress line */}
        <div className="absolute left-4 top-8 bottom-8 w-0.5 bg-gray-200"></div>
        
        <div className="space-y-6">
          {statusFlow.map((step, index) => {
            const stepStatus = getStepStatus(index);
            const IconComponent = step.icon;
            
            // Don't show steps after a cancelled or rejected status
            if ((isCancelled || isRejected) && index > currentStepIndex) {
              return null;
            }

            return (
              <div key={step.status} className="relative flex items-start">
                {/* Step indicator */}
                <div className={`
                  flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center z-10
                  ${stepStatus === 'completed' ? 'bg-green-500 text-white' : 
                    stepStatus === 'current' ? 'bg-blue-500 text-white ring-4 ring-blue-100' :
                    stepStatus === 'cancelled' ? 'bg-red-500 text-white' :
                    stepStatus === 'rejected' ? 'bg-orange-500 text-white' :
                    'bg-gray-200 text-gray-500'}
                `}>
                  {stepStatus === 'completed' || stepStatus === 'current' ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : stepStatus === 'cancelled' || stepStatus === 'rejected' ? (
                    <XCircle className="w-5 h-5" />
                  ) : (
                    <IconComponent className="w-4 h-4" />
                  )}
                </div>

                {/* Step content */}
                <div className="ml-4 flex-1 pb-8">
                  <div className={`
                    p-3 rounded-lg border
                    ${stepStatus === 'completed' ? 'bg-green-50 border-green-200' :
                      stepStatus === 'current' ? 'bg-blue-50 border-blue-200' :
                      stepStatus === 'cancelled' ? 'bg-red-50 border-red-200' :
                      stepStatus === 'rejected' ? 'bg-orange-50 border-orange-200' :
                      'bg-gray-50 border-gray-200'}
                  `}>
                    <h3 className={`
                      font-semibold flex items-center
                      ${stepStatus === 'completed' ? 'text-green-800' :
                        stepStatus === 'current' ? 'text-blue-800' :
                        stepStatus === 'cancelled' ? 'text-red-800' :
                        stepStatus === 'rejected' ? 'text-orange-800' :
                        'text-gray-700'}
                    `}>
                      <span className="mr-2">{step.label}</span>
                      {stepStatus === 'completed' && <CheckCircle className="w-5 h-5" />}
                    </h3>
                    <p className={`
                      mt-1 text-sm
                      ${stepStatus === 'completed' ? 'text-green-700' :
                        stepStatus === 'current' ? 'text-blue-700' :
                        stepStatus === 'cancelled' ? 'text-red-700' :
                        stepStatus === 'rejected' ? 'text-orange-700' :
                        'text-gray-600'}
                    `}>
                      {step.description}
                    </p>
                    {stepStatus === 'current' && (
                      <div className="mt-2 text-sm text-blue-600 font-medium">
                        Em andamento
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Order details */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Data do Pedido</p>
            <p className="font-medium">{new Date(order.date).toLocaleDateString('pt-BR')}</p>
          </div>
          <div>
            <p className="text-gray-500">Total</p>
            <p className="font-medium">R$ {order.total.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-gray-500">Status</p>
            <p className={`font-semibold ${
              order.status === 'delivered' ? 'text-green-600' :
              order.status === 'cancelled' ? 'text-red-600' :
              order.status === 'rejected' ? 'text-orange-600' :
              'text-blue-600'
            }`}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderProgressTracker;