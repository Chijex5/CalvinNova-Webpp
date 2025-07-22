// src/store/adminData.ts
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

export interface AllUsers {
    id: string;
    name: string;
    email: string;
    avatarUrl: string;
    campus: string;
    role: 'buyer' | 'seller' | 'both';
    isVerified?: boolean;
    lastLogin?: string;
    createdAt: string;
    updatedAt: string;
    isFlagged?: boolean;
    status?: 'active' | 'inactive' | 'banned' | 'suspended'; 
}

export interface AdminDataStore {
    users: AllUsers[];
    loading: boolean;
    error: string | null;

    // Actions
    setUsers: (users: AllUsers[]) => void;
    addUser: (user: AllUsers) => void;
    updateUser: (id: string, updates: Partial<AllUsers>) => void;
    deleteUser: (id: string) => void;
    getUser: (id: string) => AllUsers | undefined;
    searchUsers: (query: string) => AllUsers[];
    filterUsersByRole: (role: 'buyer' | 'seller' | 'both') => AllUsers[];
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
}

export const useAdminDataStore = create<AdminDataStore>()(
    devtools(
        persist(
            (set, get) => ({
                // Initial state
                users: [],
                loading: false,
                error: null,

                // Actions
                setUsers: (users) => set({ users }),
                addUser: (user) => set((state) => ({ users: [...state.users, user] })),
                updateUser: (id, updates) => {
                    const currentUsers = get().users;
                    const updatedUsers = currentUsers.map((user) =>
                        user.id === id ? { ...user, ...updates } : user
                    );
                    set({ users: updatedUsers });
                },
                deleteUser: (id) => {
                    const currentUsers = get().users;
                    const filteredUsers = currentUsers.filter((user) => user.id !== id);
                    set({ users: filteredUsers });
                },
                getUser: (id) => get().users.find((user) => user.id === id),
                searchUsers: (query) =>
                    get().users.filter((user) =>
                        user.name.toLowerCase().includes(query.toLowerCase())
                    ),
                filterUsersByRole: (role) =>
                    get().users.filter((user) => user.role === role),
                setLoading: (loading) => set({ loading }),
                setError: (error) => set({ error }),
            }),
            {
                name: 'admin-data-store',
                partialize: (state) => ({users: state.users}),
            }
        )
    )
)