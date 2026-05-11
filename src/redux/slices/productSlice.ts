import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import type { Product } from "../../types";

export const fetchProducts = createAsyncThunk("products/fetch", async () => {
  const { database, ref, get } = await import("../../pages/api/register");
  const snapshot = await get(ref(database, "products"));
  if (!snapshot.exists()) return [];
  const data = snapshot.val() as Record<string, Omit<Product, "id">>;
  return Object.entries(data)
    .map(([id, p]) => ({ ...p, id }))
    .filter(Boolean) as Product[];
});

const productSlice = createSlice({
  name: "products",
  initialState: [] as Product[],
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchProducts.fulfilled, (_, action: PayloadAction<Product[]>) => action.payload);
  },
});

export default productSlice.reducer;
