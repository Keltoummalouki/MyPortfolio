"use client"

import * as React from "react";
import { ThemeProvider as NextThemesProvider} from "next-themes";
import { type ThemeProviderProps } from "next-themes";

export function ThemeProvider({ children , ...propos }: ThemeProviderProps) {
    return <NextThemesProvider {...propos}>{children}</NextThemesProvider>
}