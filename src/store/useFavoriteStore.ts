import { create } from 'zustand';

interface FavoriteState {
  favorites: string[]; // Array of prompt IDs
  addFavorite: (promptId: string) => void;
  removeFavorite: (promptId: string) => void;
  isFavorite: (promptId: string) => boolean;
  clearFavorites: () => void;
}

export const useFavoriteStore = create<FavoriteState>()(
  (set, get) => ({
    favorites: [],
    
    addFavorite: (promptId: string) => 
      set((state) => {
        // Check if already in favorites
        if (state.favorites.includes(promptId)) {
          return state;
        }
        
        return { favorites: [...state.favorites, promptId] };
      }),
    
    removeFavorite: (promptId: string) => 
      set((state) => ({
        favorites: state.favorites.filter(id => id !== promptId)
      })),
    
    isFavorite: (promptId: string) => {
      const state = get();
      return state.favorites.includes(promptId);
    },
    
    clearFavorites: () => set({ favorites: [] }),
  })
);
