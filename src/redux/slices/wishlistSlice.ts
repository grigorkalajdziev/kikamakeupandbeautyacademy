import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { Product } from "../../types";

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState: [] as Product[],
  reducers: {
    addToWishlist(state, action: PayloadAction<Product>) {
      if (!state.find((i) => i.id === action.payload.id)) state.push(action.payload);
    },
    deleteFromWishlist(state, action: PayloadAction<Product>) {
      return state.filter((i) => i.id !== action.payload.id);
    },
    deleteAllFromWishlist() { return []; },
  },
});

export const { addToWishlist, deleteFromWishlist, deleteAllFromWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
