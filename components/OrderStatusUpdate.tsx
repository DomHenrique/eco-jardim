import React, { useState } from 'react';
import { Order, OrderStatus, ApiResponse } from '../types';
import { updateOrderStatus } from '../services/orderService';

interface OrderStatusUpdateProps {
  order: Order;
  currentUserId: string;
  onStatusUpdate: (order: Order) => void;
  onError: (error: string) => void;
}

const OrderStatusUpdate: React.FC<OrderStatusUpdateProps> = ({
  order,
  currentUserId,
  onStatusUpdate,
  onError
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>(order.status);

  const handleStatusChange = async () => {
    if (selectedStatus === order.status) {
      onError('Status is already the same as selected');
      return;
    }

    setIsUpdating(true);
    try {
      const result: ApiResponse<Order> = await updateOrderStatus(order.id, selectedStatus, currentUserId);
      if (result.success && result.data) {
        onStatusUpdate(result.data);
        onError('');
      } else {
        onError(result.error || 'Failed to update order status');
      }
    } catch (err) {
      onError('An error occurred while updating order status');
    } finally {
      setIsUpdating(false);
    }
  };

  // Define valid status transitions for the UI
  const getValidStatusOptions = (): OrderStatus[] => {
    switch (order.status) {
      case 'pending':
        return ['quotation', 'confirmed', 'cancelled'];
      case 'quotation':
        return ['quoted', 'rejected', 'cancelled'];
      case 'quoted':
        return ['confirmed', 'rejected', 'cancelled'];
      case 'confirmed':
        return ['processing', 'cancelled'];
      case 'processing':
        return ['ready', 'cancelled'];
      case 'ready':
        return ['shipped', 'cancelled'];
      case 'shipped':
        return ['delivered'];
      case 'cancelled':
        return ['cancelled']; // Final state
      case 'rejected':
        return ['rejected']; // Final state
      case 'delivered':
        return ['delivered']; // Final state
      default:
        return Object.values(OrderStatus);
    }
  };

  const validOptions = getValidStatusOptions();

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">Update Order Status</h3>
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="flex-1 w-full">
          <label htmlFor="status-select" className="block text-sm font-medium text-gray-700 mb-1">
            Current Status: <span className="font-semibold">{order.status}</span>
          </label>
          <select
            id="status-select"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as OrderStatus)}
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
              No further status changes allowed for this order
            </p>
          )}
        </div>
        <button
          onClick={handleStatusChange}
          disabled={isUpdating || selectedStatus === order.status || validOptions.length <= 1}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {isUpdating ? 'Updating...' : 'Update Status'}
        </button>
      </div>
    </div>
  );
};

export default OrderStatusUpdate;