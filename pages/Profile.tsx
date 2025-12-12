import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { Order, Budget, OrderStatus, BudgetStatus } from '../types';
import { getUserOrders } from '../services/orderService';
import { listBudgets } from '../services/budgetService';
import OrderProgressTracker from '../components/OrderProgressTracker';
import BudgetProgressTracker from '../components/BudgetProgressTracker';
import ServiceProgressTracker from '../components/ServiceProgressTracker';
import { ShoppingCart, FileText, User, CreditCard, MapPin, Calendar, AlertCircle } from 'lucide-react';

const Profile: React.FC = () => {
  const { currentUser, isAuthenticated } = useStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'orders' | 'budgets'>('orders');

  useEffect(() => {
    if (isAuthenticated && currentUser) {
      loadUserData();
    }
  }, [isAuthenticated, currentUser]);

  const loadUserData = async () => {
    setLoading(true);
    try {
      // Load user orders
      const ordersResult = await getUserOrders(currentUser?.id || '');
      if (ordersResult.success && ordersResult.data) {
        setOrders(ordersResult.data);
      }

      // Load user budgets - we need to find the customer ID associated with this user
      // For now, we'll assume that the user ID is the customer ID
      const budgetsResult = await listBudgets(currentUser?.id || '');
      if (budgetsResult.success && budgetsResult.data) {
        setBudgets(budgetsResult.data);
      }
    } catch (err) {
      console.error('Error loading user data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-stone-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <AlertCircle className="mx-auto h-12 w-12 text-stone-400" />
            <h2 className="mt-4 text-2xl font-bold text-stone-800">Acesso não autorizado</h2>
            <p className="mt-2 text-stone-600">Faça login para acessar sua conta.</p>
          </div>
        </div>
      </div>
    );
  }

  const ordersWithBudget = orders.filter(order => order.budget_id);
  const ordersWithoutBudget = orders.filter(order => !order.budget_id);
  const hasServices = orders.some(order => 
    order.items.some(item => 
      item.category === 'Serviços e Mão de Obra' ||
      item.name.toLowerCase().includes('serviço') || 
      item.name.toLowerCase().includes('mão de obra') ||
      item.name.toLowerCase().includes('instalação') ||
      item.name.toLowerCase().includes('manutenção')
    )
  );

  return (
    <div className="min-h-screen bg-stone-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-lg border border-stone-200 p-6 mb-8">
          <div className="flex items-center">
            <div className="bg-emerald-100 p-3 rounded-full">
              <User className="h-8 w-8 text-emerald-600" />
            </div>
            <div className="ml-4">
              <h1 className="text-2xl font-bold text-stone-800">Olá, {currentUser?.name || 'Cliente'}</h1>
              <p className="text-stone-600">{currentUser?.email}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg border border-stone-200 overflow-hidden">
          <div className="border-b border-stone-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab('orders')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'orders'
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300'
                }`}
              >
                <div className="flex items-center justify-center">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Meus Pedidos ({orders.length})
                </div>
              </button>
              <button
                onClick={() => setActiveTab('budgets')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'budgets'
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300'
                }`}
              >
                <div className="flex items-center justify-center">
                  <FileText className="mr-2 h-4 w-4" />
                  Meus Orçamentos ({budgets.length})
                </div>
              </button>
            </nav>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
              </div>
            ) : activeTab === 'orders' ? (
              <div>
                {orders.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart className="mx-auto h-12 w-12 text-stone-400" />
                    <h3 className="mt-4 text-lg font-medium text-stone-800">Nenhum pedido encontrado</h3>
                    <p className="mt-2 text-stone-600">Seus pedidos aparecerão aqui após a conclusão da compra.</p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {ordersWithBudget.map(order => (
                      <div key={order.id}>
                        <OrderProgressTracker order={order} />
                        {order.budget_id && budgets.find(b => b.id === order.budget_id) && (
                          <BudgetProgressTracker budget={budgets.find(b => b.id === order.budget_id)!} />
                        )}
                        {hasServices && <ServiceProgressTracker order={order} />}
                      </div>
                    ))}
                    
                    {ordersWithoutBudget.map(order => (
                      <div key={order.id}>
                        <OrderProgressTracker order={order} />
                        {hasServices && <ServiceProgressTracker order={order} />}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div>
                {budgets.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="mx-auto h-12 w-12 text-stone-400" />
                    <h3 className="mt-4 text-lg font-medium text-stone-800">Nenhum orçamento encontrado</h3>
                    <p className="mt-2 text-stone-600">Seus orçamentos aparecerão aqui após solicitação.</p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {budgets.map(budget => (
                      <BudgetProgressTracker key={budget.id} budget={budget} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;