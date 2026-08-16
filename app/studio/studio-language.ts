"use client";

import { useSyncExternalStore } from "react";
import type { Language } from "@/app/translations";

export function useStudioLanguage(): Language {
  return useSyncExternalStore<Language>(
    subscribeToLanguage,
    getLanguage,
    getServerLanguage,
  );
}

function subscribeToLanguage(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  return () => window.removeEventListener("storage", onStoreChange);
}

function getLanguage(): Language {
  return window.localStorage.getItem("miriam-language") === "nl" ? "nl" : "en";
}

function getServerLanguage(): Language {
  return "en";
}
