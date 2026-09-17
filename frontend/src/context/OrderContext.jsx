import { createContext, useContext, useState, useEffect } from 'react';
import io from 'socket.io-client';

const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
  const [currentOrder, setCurrentOrder] = useState(null);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001');
    setSocket(newSocket);

    return () => newSocket.close();
  }, []);

  useEffect(() => {
    if (socket && currentOrder) {
      socket.emit('join-table', currentOrder.tableId);

      socket.on('order-status-update', (updatedOrder) => {
        if (updatedOrder._id === currentOrder._id) {
          setCurrentOrder(updatedOrder);
        }
      });

      return () => {
        socket.off('order-status-update');
      };
    }
  }, [socket, currentOrder]);

  const value = {
    currentOrder,
    setCurrentOrder,
    socket
  };

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
};