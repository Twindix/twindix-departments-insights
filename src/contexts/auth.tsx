import { createContext } from "react";
import type { AuthContextInterface } from "@/interfaces";

export const AuthContext = createContext<AuthContextInterface | null>(null);
