import { useState, useEffect, useMemo } from "react";
import type { Tool, Category, LoadStatus } from "../types";
import { FALLBACK_DATA, EXTERNAL_JSON_URL } from "../constants/fallbackData";

interface UseToolsReturn {
  tools: Tool[];
  filteredTools: Tool[];
  categories: Category[];
  loadStatus: LoadStatus;
  errorMessage: string;
  searchQuery: string;
  activeCategory: string;
  setSearchQuery: (q: string) => void;
  setActiveCategory: (id: string) => void;
}

export function useTools(): UseToolsReturn {
  const [allTools, setAllTools] = useState<Tool[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadStatus, setLoadStatus] = useState<LoadStatus>("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  useEffect(() => {
    async function load() {
      setLoadStatus("loading");
      try {
        const res = await fetch(EXTERNAL_JSON_URL);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        hydrate(data);
      } catch (err) {
        setErrorMessage(err instanceof Error ? err.message : "Unknown error");
        setLoadStatus("error");
        // Fallback after short delay so user sees error flash
        setTimeout(() => {
          hydrate(FALLBACK_DATA);
        }, 1200);
      }
    }
    load();
  }, []);

  function hydrate(data: typeof FALLBACK_DATA) {
    const cats = data.categories ?? [];
    if (!cats.find((c) => c.id === "all")) {
      cats.unshift({ id: "all", name: "All", icon: "◈", description: "All tools" });
    }
    setAllTools(data.tools ?? []);
    setCategories(cats);
    setLoadStatus("success");
  }

  const filteredTools = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return allTools
      .filter((t) => {
        const matchCat = activeCategory === "all" || t.category === activeCategory;
        const matchSearch =
          !q ||
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.tags.some((tag) => tag.toLowerCase().includes(q));
        return matchCat && matchSearch;
      })
      .sort((a, b) => {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return (b.stars ?? 0) - (a.stars ?? 0);
      });
  }, [allTools, activeCategory, searchQuery]);

  return {
    tools: allTools,
    filteredTools,
    categories,
    loadStatus,
    errorMessage,
    searchQuery,
    activeCategory,
    setSearchQuery,
    setActiveCategory,
  };
}
