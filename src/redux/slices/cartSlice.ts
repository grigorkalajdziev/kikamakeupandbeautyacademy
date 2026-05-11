import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from "uuid";
import type { CartItem, Product } from "../../types";

interface AddPayload extends Product {
  quantity: number;
  selectedProductColor?: string | null;
  selectedProductSize?: string | null;
}

const cartSlice = createSlice({
  name: "cart",
  initialState: [] as CartItem[],
  reducers: {
    loadCart(_state, action: PayloadAction<CartItem[]>) {
      return action.payload;
    },
    clearCart() {
      return [];
    },
    addToCart(state, action: PayloadAction<AddPayload>) {
      const p = action.payload;
      if (!p.variation) {
        const ex = state.find((i) => i.id === p.id);
        if (!ex) state.push({ ...p, cartItemId: uuidv4() });
        else ex.quantity += p.quantity;
      } else {
        const ex = state.find(
          (i) =>
            i.id === p.id &&
            i.selectedProductColor === p.selectedProductColor &&
            i.selectedProductSize === p.selectedProductSize
        );
        if (!ex) state.push({ ...p, cartItemId: uuidv4() });
        else {
          ex.quantity += p.quantity;
          ex.selectedProductColor = p.selectedProductColor;
          ex.selectedProductSize  = p.selectedProductSize;
        }
      }
    },
    decreaseQuantity(state, action: PayloadAction<CartItem>) {
      const idx = state.findIndex((i) => i.cartItemId === action.payload.cartItemId);
      if (idx === -1) return;
      if (state[idx].quantity === 1) state.splice(idx, 1);
      else state[idx].quantity -= 1;
    },
    deleteFromCart(state, action: PayloadAction<CartItem>) {
      return state.filter((i) => i.cartItemId !== action.payload.cartItemId);
    },
    deleteAllFromCart() {
      return [];
    },
  },
});

export const {
  loadCart,
  clearCart,
  addToCart,
  decreaseQuantity,
  deleteFromCart,
  deleteAllFromCart,
} = cartSlice.actions;

export default cartSlice.reducer;
