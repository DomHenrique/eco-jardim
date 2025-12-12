import React from 'react';
import { Order, OrderStatus, ProductCategory } from '../types';
import { Calendar, Hammer, MapPin, User, Clock, CheckCircle, Truck } from 'lucide-react';

interface ServiceProgressTrackerProps {
  order: Order;
}

const ServiceProgressTracker: React.FC<ServiceProgressTrackerProps> = ({ order }) => {
  // Check if the order contains services
  const hasServices = order.items.some(item => 
    item.category === ProductCategory.SERVICES || 
    item.name.toLowerCase().includes('serviço') || 
    item.name.toLowerCase().includes('mão de obra') ||
    item.name.toLowerCase().includes('instalação') ||
    item.name.toLowerCase().includes('manutenção')
  );

  // Define service-specific status flow
  const statusFlow = [
    { 
      status: 'pending', 
      label: 'Solicitação Recebida', 
      icon: Clock,
      description: 'Recebemos sua solicitação de serviço'
    },
    { 
      status: 'confirmed', 
      label: 'Serviço Confirmado', 
      icon: CheckCircle,
      description: 'Serviço confirmado e aguardando agendamento'
    },
    { 
      status: 'processing', 
      label: 'Aguardando Agendamento', 
      icon: Calendar,
      description: 'Aguarde o contato para agendamento'
    },
    { 
      status: 'ready', 
      label: 'Agendamento Confirmado', 
      icon: CheckCircle,
      description: 'Serviço agendado para a data e hora marcados'
    },
    { 
      status: 'shipped', 
      label: 'Técnico a Caminho', 
      icon: Truck,
      description: 'Profissional a caminho para execução do serviço'
    },
    { 
      status: 'delivered', 
      label: 'Serviço Executado', 
      icon: Hammer,
      description: 'Serviço concluído com sucesso'
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

  if (!hasServices) {
    return null; // Don't render if the order doesn't contain services
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6 border-l-4 border-blue-500">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-2">Progresso do Serviço #{order.id.substring(0, 8)}</h2>
        <p className="text-gray-600 mb-4">Status atual: <span className="font-semibold">{currentStatusDetails?.label}</span></p>
        
        {currentStatusDetails && (
          <p className="text-gray-700 bg-blue-50 p-3 rounded-md">
            {currentStatusDetails.description}
          </p>
        )}
        
        {/* Special status for cancelled or rejected orders */}
        {(isCancelled || isRejected) && (
          <div className={`mt-3 p-3 rounded-md flex items-center ${isCancelled ? 'bg-red-50 text-red-700' : 'bg-orange-50 text-orange-700'}`}>
            <Clock className="mr-2 h-5 w-5" />
            {isCancelled 
              ? 'Este serviço foi cancelado.' 
              : 'Esta solicitação foi rejeitada.'}
          </div>
        )}
      </div>

      {/* Service-specific details */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-800 mb-2">Detalhes do Serviço</h3>
        <div className="space-y-2">
          {order.items
            .filter(item => item.category === ProductCategory.SERVICES)
            .map((item, index) => (
              <div key={index} className="flex justify-between">
                <span>{item.name}</span>
                <span className="font-medium">R$ {item.price.toFixed(2)}</span>
              </div>
          ))}
          <div className="pt-2 border-t border-blue-100 font-semibold">
            <div className="flex justify-between">
              <span>Total do Serviço</span>
              <span>R$ {order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress steps */}
      <div className="relative">
        {/* Progress line */}
        <div className="absolute left-4 top-8 bottom-8 w-0.5 bg-gray-200"></div>
        
        <div className="space-y-6">
          {statusFlow.map((step, index) => {
            const stepStatus = getStepStatus(index);
            
            // Don't show steps after a cancelled or rejected status
            if ((isCancelled || isRejected) && index > currentStepIndex) {
              return null;
            }

            const IconComponent = step.icon;
            
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
                    <Clock className="w-5 h-5" />
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

      {/* Contact information for service orders */}
      {order.status !== 'cancelled' && order.status !== 'rejected' && (
        <div className="mt-6 pt-6 border-t border-gray-200 bg-yellow-50 p-4 rounded-lg">
          <h3 className="font-semibold text-yellow-800 mb-2">Informações Importantes</h3>
          <p className="text-sm text-yellow-700">
            {order.status === 'ready' || order.status === 'shipped' ? 
              `O profissional irá atender no endereço fornecido: ${order.userInfo.address}, ${order.userInfo.city}.` :
              'Assim que seu serviço for agendado, entraremos em contato para confirmar a data e horário.'}
          </p>
          <p className="mt-2 text-sm text-yellow-700">
            <User className="inline mr-1" size={14} /> Contato: {order.userInfo.phone || 'Não informado'}
          </p>
        </div>
      )}
    </div>
  );
};

export default ServiceProgressTracker;