import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { Product } from "../../types";

const compareSlice = createSlice({
  name: "compare",
  initialState: [] as Product[],
  reducers: {
    addToCompare(state, action: PayloadAction<Product>) {
      if (!state.find((i) => i.id === action.payload.id)) state.push(action.payload);
    },
    deleteFromCompare(state, action: PayloadAction<Product>) {
      return state.filter((i) => i.id !== action.payload.id);
    },
  },
});

export const { addToCompare, deleteFromCompare } = compareSlice.actions;
export default compareSlice.reducer;
