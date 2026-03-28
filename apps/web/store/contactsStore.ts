import { create } from "zustand";

type Status = "all" | "new" | "active" | "inactive" | "archived";

type ContactsStore = {
  refreshKey: number;
  status: Status;
  setStatus:(status:Status) => void;
  triggerRefresh: () => void;
};

export const useContactsStore = create<ContactsStore>((set) => ({
  refreshKey: 0,
  status: "all",
  
  setStatus: (status) => set({status}),

  triggerRefresh: () =>
    set((state) => ({
      refreshKey: state.refreshKey + 1,
    })),
}));