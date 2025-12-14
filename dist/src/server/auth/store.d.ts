import { type User } from "../../core/auth.schema.js";
export declare function hashPassword(password: string): string;
export declare function verifyPassword(password: string, hash: string): boolean;
export declare class UserStore {
    private root;
    constructor(root: string);
    private usersFile;
    createUser(user: Omit<User, "passwordHash"> & {
        password: string;
    }): Promise<User>;
    getUser(id: string): Promise<User | null>;
    getUserByEmail(email: string): Promise<User | null>;
    listUsers(): Promise<User[]>;
    updateUser(id: string, updates: Partial<Pick<User, "role" | "enabled">>): Promise<User | null>;
    deleteUser(id: string): Promise<boolean>;
}
