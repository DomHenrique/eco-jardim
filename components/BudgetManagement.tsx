import React, { useState } from 'react';
import { Budget, BudgetStatus, ApiResponse, Order, CartItem } from '../types';
import { updateBudgetStatus, convertBudgetToOrder } from '../services/budgetService';

interface BudgetManagementProps {
  budget: Budget;
  currentUserId: string;
  onBudgetUpdate: (budget: Budget) => void;
  onBudgetConverted: (order: Order) => void;
  onError: (error: string) => void;
}

const BudgetManagement: React.FC<BudgetManagementProps> = ({
  budget,
  currentUserId,
  onBudgetUpdate,
  onBudgetConverted,
  onError
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<BudgetStatus>(budget.status);

  const handleStatusChange = async () => {
    if (selectedStatus === budget.status) {
      onError('Status is already the same as selected');
      return;
    }

    setIsUpdating(true);
    try {
      const result: ApiResponse<Budget> = await updateBudgetStatus(budget.id, selectedStatus, currentUserId);
      if (result.success && result.data) {
        onBudgetUpdate(result.data);
        onError('');
      } else {
        onError(result.error || 'Failed to update budget status');
      }
    } catch (err) {
      onError('An error occurred while updating budget status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleConvertToOrder = async () => {
    if (budget.status !== 'accepted') {
      onError('Only accepted budgets can be converted to orders');
      return;
    }

    setIsUpdating(true);
    try {
      // Mock user info for the order - in a real implementation, this would come from context or props
      const mockUserInfo = {
        name: 'Customer Name', // This should be replaced with actual customer info
        email: 'customer@example.com',
        address: 'Customer Address',
        city: 'Customer City',
        zip: '12345',
        paymentMethod: 'pix' as const
      };

      const result: ApiResponse<Order> = await convertBudgetToOrder(
        budget.id,
        budget.customer_id,
        mockUserInfo,
        currentUserId
      );
      
      if (result.success && result.data) {
        onBudgetConverted(result.data);
        onError('');
      } else {
        onError(result.error || 'Failed to convert budget to order');
      }
    } catch (err) {
      onError('An error occurred while converting budget to order');
    } finally {
      setIsUpdating(false);
    }
  };

  // Define valid status transitions for the UI
  const getValidStatusOptions = (): BudgetStatus[] => {
    switch (budget.status) {
      case 'draft':
        return ['sent', 'expired'];
      case 'sent':
        return ['accepted', 'rejected', 'expired'];
      case 'accepted':
        return ['accepted']; // Final state
      case 'rejected':
        return ['rejected']; // Final state
      case 'expired':
        return ['expired']; // Final state
      default:
        return Object.values(BudgetStatus);
    }
  };

  const validOptions = getValidStatusOptions();
  const canConvertToOrder = budget.status === 'accepted' && !budget.order_id;

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">Budget Management</h3>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="flex-1 w-full">
            <label htmlFor="budget-status-select" className="block text-sm font-medium text-gray-700 mb-1">
              Current Status: <span className="font-semibold">{budget.status}</span>
            </label>
            <select
              id="budget-status-select"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as BudgetStatus)}
              disabled={isUpdating || validOptions.length <= 1}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
            >
              {validOptions.map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
            {validOptions.length <= 1 && (
              <p className="mt-1 text-sm text-gray-500">
                No further status changes allowed for this budget
              </p>
            )}
          </div>
          <button
            onClick={handleStatusChange}
            disabled={isUpdating || selectedStatus === budget.status || validOptions.length <= 1}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {isUpdating ? 'Updating...' : 'Update Status'}
          </button>
        </div>

        {canConvertToOrder && (
          <div className="pt-3 border-t border-gray-200">
            <button
              onClick={handleConvertToOrder}
              disabled={isUpdating}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUpdating ? 'Converting...' : 'Convert to Order'}
            </button>
            <p className="mt-2 text-sm text-gray-500">
              This will create an order from this budget and update the budget status to accepted.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BudgetManagement;