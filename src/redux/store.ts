import { configureStore, combineReducers } from "@reduxjs/toolkit";
import {
  persistReducer,
  FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";
import productSlice from "./slices/productSlice";
import cartSlice from "./slices/cartSlice";
import wishlistSlice from "./slices/wishlistSlice";
import compareSlice from "./slices/compareSlice";

// ── 1. Root reducer (un-persisted) ────────────────────────────────────────────
const rootReducer = combineReducers({
  productData:  productSlice,
  cartData:     cartSlice,
  wishlistData: wishlistSlice,
  compareData:  compareSlice,
});

// The plain state shape, used for preloadedState typing
export type RootState = ReturnType<typeof rootReducer>;

// ── 2. Persisted reducer ──────────────────────────────────────────────────────
const persistConfig = {
  key: "kika-root",
  storage,
  blacklist: ["productData"],
};

const persistedReducer = persistReducer<RootState>(persistConfig, rootReducer);
type PersistedState = ReturnType<typeof persistedReducer>;

// ── 3. Store factory ──────────────────────────────────────────────────────────
export function initializeStore(preloadedState?: Partial<RootState>) {
  return configureStore({
    reducer: persistedReducer,   
    ...(preloadedState !== undefined && {
      preloadedState: preloadedState as unknown as PersistedState,
    }),
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        },
      }),
  });
}

// ── 4. Client-side singleton ──────────────────────────────────────────────────
const isServer = typeof window === "undefined";
const STORE_KEY = "__KIKA_REDUX_STORE__" as const;

declare global {
  interface Window {
    [STORE_KEY]?: AppStore;
  }
}

export function getOrCreateStore(initialState?: Partial<RootState>): AppStore {
  if (isServer) return initializeStore(initialState);
  if (!window[STORE_KEY]) window[STORE_KEY] = initializeStore(initialState);
  return window[STORE_KEY]!;
}

// ── 5. Exported types ─────────────────────────────────────────────────────────
export type AppStore    = ReturnType<typeof initializeStore>;
export type AppState    = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];

export const store = getOrCreateStore();