import React, { useState, useEffect } from 'react';
import { Order, Budget, ApiResponse } from '../types';
import { getBudgetById } from '../services/budgetService';
import OrderStatusUpdate from './OrderStatusUpdate';
import BudgetManagement from './BudgetManagement';

interface OrderDetailsProps {
  order: Order;
  currentUserId: string;
  onOrderUpdate: (order: Order) => void;
  onError: (error: string) => void;
}

const OrderDetails: React.FC<OrderDetailsProps> = ({
  order,
  currentUserId,
  onOrderUpdate,
  onError
}) => {
  const [budget, setBudget] = useState<Budget | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBudget = async () => {
      if (order.budget_id) {
        setLoading(true);
        try {
          const result: ApiResponse<Budget> = await getBudgetById(order.budget_id);
          if (result.success && result.data) {
            setBudget(result.data);
          } else {
            onError(result.error || 'Failed to load budget');
          }
        } catch (err) {
          onError('An error occurred while loading budget');
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchBudget();
  }, [order.budget_id, onError]);

  const handleOrderStatusUpdate = (updatedOrder: Order) => {
    onOrderUpdate(updatedOrder);
  };

  const handleBudgetUpdate = (updatedBudget: Budget) => {
    setBudget(updatedBudget);
  };

  const handleBudgetConverted = (order: Order) => {
    onOrderUpdate(order);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Order #{order.id.substring(0, 8)}</h2>
            <p className="text-gray-600">Date: {new Date(order.date).toLocaleDateString()}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            order.status === 'delivered' ? 'bg-green-100 text-green-800' :
            order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
            order.status === 'pending' || order.status === 'quotation' ? 'bg-yellow-100 text-yellow-800' :
            'bg-blue-100 text-blue-800'
          }`}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Order Items */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Order Items</h3>
            <div className="space-y-2">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between border-b pb-2">
                  <span>{item.name} (x{item.quantity})</span>
                  <span>R$ {(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 font-semibold">
              <div className="flex justify-between">
                <span>Total:</span>
                <span>R$ {order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Customer Information</h3>
            <div className="space-y-1">
              <p><span className="font-medium">Name:</span> {order.userInfo.name}</p>
              <p><span className="font-medium">Email:</span> {order.userInfo.email}</p>
              <p><span className="font-medium">Phone:</span> {order.userInfo.phone}</p>
              <p><span className="font-medium">Address:</span> {order.userInfo.address}</p>
              <p><span className="font-medium">City:</span> {order.userInfo.city}</p>
              <p><span className="font-medium">ZIP:</span> {order.userInfo.zip}</p>
            </div>
          </div>
        </div>

        {/* Budget Information (if applicable) */}
        {order.budget_id && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Budget Information</h3>
            {loading ? (
              <p>Loading budget...</p>
            ) : budget ? (
              <div className="bg-blue-50 p-4 rounded-lg">
                <p>Budget ID: {budget.id.substring(0, 8)}</p>
                <p>Status: {budget.status}</p>
                <p>Budget Total: R$ {budget.total.toFixed(2)}</p>
                <p>Valid Until: {new Date(budget.valid_until).toLocaleDateString()}</p>
                
                {/* Budget management for employees */}
                {budget && (
                  <BudgetManagement
                    budget={budget}
                    currentUserId={currentUserId}
                    onBudgetUpdate={handleBudgetUpdate}
                    onBudgetConverted={handleBudgetConverted}
                    onError={onError}
                  />
                )}
              </div>
            ) : (
              <p className="text-gray-500">Budget not found</p>
            )}
          </div>
        )}

        {/* Order Status Management */}
        <div className="mt-6">
          <OrderStatusUpdate
            order={order}
            currentUserId={currentUserId}
            onStatusUpdate={handleOrderStatusUpdate}
            onError={onError}
          />
        </div>

        {/* Additional Order Details */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {order.payment_status && (
            <div>
              <h4 className="font-medium text-gray-700">Payment Status</h4>
              <p>{order.payment_status}</p>
            </div>
          )}
          
          {order.payment_method && (
            <div>
              <h4 className="font-medium text-gray-700">Payment Method</h4>
              <p>{order.payment_method}</p>
            </div>
          )}
          
          {order.delivery_address && (
            <div>
              <h4 className="font-medium text-gray-700">Delivery Address</h4>
              <p>{order.delivery_address}</p>
            </div>
          )}
          
          {order.delivery_date && (
            <div>
              <h4 className="font-medium text-gray-700">Delivery Date</h4>
              <p>{new Date(order.delivery_date).toLocaleDateString()}</p>
            </div>
          )}
          
          {order.notes && (
            <div className="md:col-span-2">
              <h4 className="font-medium text-gray-700">Notes</h4>
              <p>{order.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;