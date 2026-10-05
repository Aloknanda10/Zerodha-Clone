import { useEffect, useState } from "react";

import api, { getErrorMessage } from "../api";

// Fetches a list from the backend and tracks loading / error state.
// `refreshKey` lets callers trigger a refetch when it changes.
const usePortfolioData = (endpoint, refreshKey = 0) => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    setIsLoading(true);
    setError("");

    api
      .get(endpoint, { signal: controller.signal })
      .then((res) => setData(Array.isArray(res.data) ? res.data : []))
      .catch((err) => {
        if (err.name !== "CanceledError") {
          setError(getErrorMessage(err));
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, [endpoint, refreshKey]);

  return { data, isLoading, error };
};

export default usePortfolioData;
