import { create } from "zustand";

interface CartStore {
  itemCount: number;
  setItemCount: (count: number) => void;
}

interface AuthStore {
  user: { id: number; name: string; email: string; role: string } | null;
  token: string | null;
  setUser: (user: AuthStore["user"], token: string) => void;
  logout: () => void;
}

export const useCartStore = create<CartStore>((set) => ({
  itemCount: 0,
  setItemCount: (count) => set({ itemCount: count }),
}));

export const useAuthStore = create<AuthStore>((set) => {
  const stored = typeof window !== "undefined" ? localStorage.getItem("prayag_auth") : null;
  const parsed = stored ? JSON.parse(stored) : null;
  return {
    user: parsed?.user || null,
    token: parsed?.token || null,
    setUser: (user, token) => {
      localStorage.setItem("prayag_auth", JSON.stringify({ user, token }));
      set({ user, token });
    },
    logout: () => {
      localStorage.removeItem("prayag_auth");
      set({ user: null, token: null });
    },
  };
});
