import React from 'react';
import { Budget, BudgetStatus } from '../types';
import { FileText, Send, CheckCircle, XCircle, Clock, Calendar } from 'lucide-react';

interface BudgetProgressTrackerProps {
  budget: Budget;
}

const BudgetProgressTracker: React.FC<BudgetProgressTrackerProps> = ({ budget }) => {
  // Define the budget status flow and their display properties
  const statusFlow = [
    { 
      status: 'draft', 
      label: 'Rascunho', 
      icon: FileText,
      description: 'Orçamento sendo preparado'
    },
    { 
      status: 'sent', 
      label: 'Enviado', 
      icon: Send,
      description: 'Orçamento enviado para análise'
    },
    { 
      status: 'accepted', 
      label: 'Aceito', 
      icon: CheckCircle,
      description: 'Orçamento foi aceito'
    }
  ];

  // Define the current step index based on budget status
  const currentStepIndex = statusFlow.findIndex(step => step.status === budget.status);
  const isRejected = budget.status === 'rejected';
  const isExpired = budget.status === 'expired';

  // Determine if a step is completed, current, or upcoming
  const getStepStatus = (index: number) => {
    if (isRejected || isExpired) {
      // For rejected/expired budgets, only show the current status
      return index === currentStepIndex ? (isRejected ? 'rejected' : 'expired') : 'upcoming';
    }
    return index < currentStepIndex ? 'completed' : 
           index === currentStepIndex ? 'current' : 'upcoming';
  };

  // Get the current status details
  const currentStatusDetails = statusFlow.find(step => step.status === budget.status);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-2">Progresso do Orçamento #{budget.id.substring(0, 8)}</h2>
        <p className="text-gray-600 mb-4">Status atual: <span className="font-semibold">{currentStatusDetails?.label || budget.status}</span></p>
        
        {currentStatusDetails ? (
          <p className="text-gray-700 bg-blue-50 p-3 rounded-md">
            {currentStatusDetails.description}
          </p>
        ) : (
          <p className="text-gray-700 bg-blue-50 p-3 rounded-md">
            {isRejected ? 'Este orçamento foi rejeitado.' : 
             isExpired ? 'Este orçamento expirou.' : 
             'Status do orçamento'}
          </p>
        )}
        
        {/* Special status for rejected or expired budgets */}
        {(isRejected || isExpired) && (
          <div className={`mt-3 p-3 rounded-md flex items-center ${isRejected ? 'bg-red-50 text-red-700' : 'bg-yellow-50 text-yellow-700'}`}>
            <XCircle className="mr-2 h-5 w-5" />
            {isRejected 
              ? 'Este orçamento foi rejeitado.' 
              : 'Este orçamento expirou e não está mais disponível.'}
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
            
            // Don't show steps after rejected or expired status
            if ((isRejected || isExpired) && index > currentStepIndex) {
              return null;
            }

            // Don't show rejected/expired steps in the regular flow (only the current one)
            if ((isRejected || isExpired) && step.status === 'accepted') {
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
                    isRejected && step.status === budget.status ? 'bg-red-500 text-white' :
                    isExpired && step.status === budget.status ? 'bg-yellow-500 text-white' :
                    'bg-gray-200 text-gray-500'}
                `}>
                  {stepStatus === 'completed' || stepStatus === 'current' ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : isRejected || isExpired ? (
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
                      isRejected ? 'bg-red-50 border-red-200' :
                      isExpired ? 'bg-yellow-50 border-yellow-200' :
                      'bg-gray-50 border-gray-200'}
                  `}>
                    <h3 className={`
                      font-semibold flex items-center
                      ${stepStatus === 'completed' ? 'text-green-800' :
                        stepStatus === 'current' ? 'text-blue-800' :
                        isRejected ? 'text-red-800' :
                        isExpired ? 'text-yellow-800' :
                        'text-gray-700'}
                    `}>
                      <span className="mr-2">{step.label}</span>
                      {stepStatus === 'completed' && <CheckCircle className="w-5 h-5" />}
                    </h3>
                    <p className={`
                      mt-1 text-sm
                      ${stepStatus === 'completed' ? 'text-green-700' :
                        stepStatus === 'current' ? 'text-blue-700' :
                        isRejected ? 'text-red-700' :
                        isExpired ? 'text-yellow-700' :
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
          
          {/* Special step for rejected status */}
          {isRejected && (
            <div className="relative flex items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center z-10 bg-red-500 text-white">
                <XCircle className="w-5 h-5" />
              </div>
              <div className="ml-4 flex-1 pb-8">
                <div className="p-3 rounded-lg border border-red-200 bg-red-50">
                  <h3 className="font-semibold text-red-800 flex items-center">
                    <span className="mr-2">Rejeitado</span>
                    <XCircle className="w-5 h-5" />
                  </h3>
                  <p className="mt-1 text-sm text-red-700">
                    O orçamento foi rejeitado e não pode prosseguir
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Special step for expired status */}
          {isExpired && (
            <div className="relative flex items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center z-10 bg-yellow-500 text-white">
                <XCircle className="w-5 h-5" />
              </div>
              <div className="ml-4 flex-1 pb-8">
                <div className="p-3 rounded-lg border border-yellow-200 bg-yellow-50">
                  <h3 className="font-semibold text-yellow-800 flex items-center">
                    <span className="mr-2">Expirado</span>
                    <XCircle className="w-5 h-5" />
                  </h3>
                  <p className="mt-1 text-sm text-yellow-700">
                    O orçamento expirou em {new Date(budget.valid_until).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Budget details */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Data de Criação</p>
            <p className="font-medium">{budget.created_at ? new Date(budget.created_at).toLocaleDateString('pt-BR') : 'N/A'}</p>
          </div>
          <div>
            <p className="text-gray-500">Valido até</p>
            <p className="font-medium">{new Date(budget.valid_until).toLocaleDateString('pt-BR')}</p>
          </div>
          <div>
            <p className="text-gray-500">Total</p>
            <p className="font-medium">R$ {budget.total.toFixed(2)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetProgressTracker;