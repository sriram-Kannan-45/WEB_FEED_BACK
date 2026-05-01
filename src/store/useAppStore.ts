// Minimal Zustand store scaffold for global app state
import create from 'zustand';

type User = {
  id?: string;
  name?: string;
  role?: string;
} | null;

type State = {
  user: User;
  setUser: (u: User) => void;
};

export const useAppStore = create<State>((set) => ({
  user: null,
  setUser: (u) => set({ user: u }),
}));
