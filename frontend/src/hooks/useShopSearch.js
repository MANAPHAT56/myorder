import { useState, useEffect } from "react";
import api from "../api/api";
import { ITEMS_PER_PAGE } from "../utils/helpers";

export default function useShopSearch({
  query,
  category,
  page,
  tierFilter = "all",
  showClosed = false,
  featuredOnly = false,
}) {
  const [state, setState] = useState({
    items: [],
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));

    const run = async () => {
      try {
        let data;
        if (featuredOnly) {
          data = await api.getFeaturedShops();
          const items = Array.isArray(data) ? data : data.data ?? [];
          if (!cancelled)
            setState({
              items,
              totalItems: items.length,
              totalPages: 1,
              currentPage: 1,
              loading: false,
              error: null,
            });
          return;
        }
        const params = {
          q: query || "",
          tier: tierFilter || "all",
          page: page || 1,
          per_page: ITEMS_PER_PAGE,
          show_closed: showClosed ? 1 : 0,
        };
        if (category && category !== "ทั้งหมด") params.category = category;
        data = await api.searchShops(params);
        const items = data.data ?? [];
        const totalItems = data.total ?? items.length;
        const totalPages = data.last_page ?? 1;
        const currentPage = data.current_page ?? page;
        if (!cancelled)
          setState({
            items,
            totalItems,
            totalPages,
            currentPage,
            loading: false,
            error: null,
          });
      } catch (err) {
        if (!cancelled)
          setState((s) => ({ ...s, loading: false, error: err.message }));
      }
    };

    const timer = setTimeout(run, query ? 300 : 0);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, category, page, tierFilter, showClosed, featuredOnly]);

  return state;
}
