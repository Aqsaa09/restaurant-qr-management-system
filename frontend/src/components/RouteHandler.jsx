import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const RouteHandler = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Handle direct URL access without hash
    const path = location.pathname;
    const hash = location.hash;

    // If we're on a direct path (not hash-based) and it's a table route
    if (path.startsWith('/table/') && !hash) {
      const tableId = path.replace('/table/', '');
      navigate(`/table/${tableId}`, { replace: true });
    }
  }, [location, navigate]);

  return null;
};

export default RouteHandler;