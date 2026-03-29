import { create } from "zustand";

type Status = "all" | "new" | "active" | "inactive" | "archived";

type ContactsStore = {
  refreshKey: number;
  status: Status;
  page: number;
  search: string;


  setStatus:(status:Status) => void;
  setPage : (page:number) => void;
  setSearch : (search: string) => void;
  triggerRefresh: () => void;
};

export const useContactsStore = create<ContactsStore>((set) => ({
  refreshKey: 0,
  status: "all",
  page:1,
  search : "",

  
  
  setStatus: (status) => set({status, page:1}),
  setPage: (page) => set({ page }),

  setSearch: (search) =>
    set(() => ({
      search,
      page: 1, 
    })),

  triggerRefresh: () =>
    set((state) => ({
      refreshKey: state.refreshKey + 1,
    })),
}));