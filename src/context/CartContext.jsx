// src/context/CartContext.jsx
import React, {
  createContext, useContext,
  useState, useEffect, useCallback,
} from 'react';
import cartApi       from '../api/cartApi';
import { useAuth }   from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user }  = useAuth();

  const [cart,        setCart]        = useState(null);
  const [loading,     setLoading]     = useState(false);
  const [drawerOpen,  setDrawerOpen]  = useState(false);

  // Different restaurant dialog state
  const [pendingItem, setPendingItem] = useState(null);
  const [dialogOpen,  setDialogOpen]  = useState(false);

  // Fetch cart when user logs in
  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setCart(null);
    }
  }, [user]);

  const fetchCart = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await cartApi.getCart();
      setCart(res.data);
    } catch {
      setCart(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Add item — handles different restaurant case
  const addItem = async (item, restaurantId) => {
    if (!user) {
      window.location.href = '/login';
      return;
    }

    const payload = {
      restaurantId : restaurantId,
      menuItemId   : item.itemId,
      name         : item.name,
      price        : item.discountedPrice || item.price,
      quantity     : 1,
    };

    // Check if cart has items from different restaurant
    if (cart?.restaurantId &&
        cart.restaurantId !== restaurantId &&
        cart.items?.length > 0) {
      // Store pending item and show dialog
      setPendingItem(payload);
      setDialogOpen(true);
      return;
    }

    try {
      const res = await cartApi.addItem(payload);
      setCart(res.data);
      setDrawerOpen(true);   // open cart drawer
    } catch (err) {
      const msg = err.response?.data?.message || '';
      if (msg.startsWith('DIFFERENT_RESTAURANT')) {
        setPendingItem(payload);
        setDialogOpen(true);
      }
    }
  };

  // Confirm switch restaurant
  const confirmSwitch = async () => {
    if (!pendingItem) return;
    try {
      const res = await cartApi.switchRestaurant(pendingItem);
      setCart(res.data);
      setDrawerOpen(true);
    } catch (err) {
      console.error(err);
    } finally {
      setDialogOpen(false);
      setPendingItem(null);
    }
  };

  // Cancel switch
  const cancelSwitch = () => {
    setDialogOpen(false);
    setPendingItem(null);
  };

  // Update quantity
  const updateQuantity = async (menuItemId, quantity) => {
    try {
      const res = await cartApi.updateQuantity(
        { menuItemId, quantity }
      );
      setCart(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Remove item
  const removeItem = async (menuItemId) => {
    try {
      const res = await cartApi.removeItem(menuItemId);
      setCart(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Apply promo
  const applyPromo = async (code) => {
    const res = await cartApi.applyPromo(code);
    setCart(res.data);
    return res.data;
  };

  // Clear cart
  const clearCart = async () => {
    try {
      const res = await cartApi.clearCart();
      setCart(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Total items badge count
  const totalItems = cart?.totalItems || 0;

  return (
    <CartContext.Provider value={{
      cart,
      loading,
      drawerOpen,
      setDrawerOpen,
      dialogOpen,
      pendingItem,
      totalItems,
      fetchCart,
      addItem,
      updateQuantity,
      removeItem,
      applyPromo,
      clearCart,
      confirmSwitch,
      cancelSwitch,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);