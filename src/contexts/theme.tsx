import { createContext } from "react";
import type { ThemeContextInterface } from "@/interfaces";

export const ThemeContext = createContext<ThemeContextInterface | null>(null);
