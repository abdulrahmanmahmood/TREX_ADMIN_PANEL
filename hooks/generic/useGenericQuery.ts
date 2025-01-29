"use client";
import { useQuery, DocumentNode, OperationVariables } from "@apollo/client";
import { useState, useEffect } from "react";
import { getCookie } from "cookies-next";

interface QueryConfig<TData, TVariables> {
  query: DocumentNode;
  variables?: TVariables;
  onSuccess?: (data: TData) => void;
  onError?: (error: Error) => void;
  defaultErrorMessage?: string;
  options?: {
    skip?: boolean;
    pollInterval?: number;
    fetchPolicy?:
    | "cache-first"
    | "network-only"
    | "cache-and-network"
    | "no-cache";
    context?: Record<string, any>;
  };
}

export const useGenericQuery = <
  TData = any,
  TVariables extends OperationVariables = OperationVariables
>({
  query,
  variables,
  onSuccess,
  onError,
  defaultErrorMessage = "An error occurred while fetching data",
  options = {},
}: QueryConfig<TData, TVariables>) => {
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Get the token for each query
  const token = getCookie("token");
  console.log("Token:", token);
  const headers = {
    ...(options.context?.headers || {}),
    Authorization: token ? `Bearer ${token}` : "",
  };
  // Prepare the context with headers
  const context = {
    ...options.context,
    headers: {
      ...options.context?.headers,
      authorization: `Bearer ${token}`
    },
  };

  const { data, loading, refetch, fetchMore, networkStatus, client } = useQuery<
    TData,
    TVariables
  >(query, {
    variables,
    // skip: options.skip,
    // pollInterval: options.pollInterval,
    // fetchPolicy: options.fetchPolicy,
    context, // Pass the context with headers,
    notifyOnNetworkStatusChange: true,
    onError: (error) => {
      const errorMessage = error.message || defaultErrorMessage;
      setError(errorMessage);
      onError?.(error);
    },
    onCompleted: (data) => {
      setError(null);
      setIsSuccess(true);
      onSuccess?.(data as TData);
    },
  });

  // Reset success and error states when re-fetching
  useEffect(() => {
    if (loading) {
      setError(null);
      setIsSuccess(false);
    }
  }, [loading]);

  // Enhanced refetch with context
  const refetchWithAuth = async (refetchVariables?: Partial<TVariables>) => {
    return refetch(refetchVariables);
  };

  return {
    data,
    loading,
    error,
    isSuccess,
    refetch: refetchWithAuth,
    fetchMore,
    networkStatus,
    client,
    reset: () => {
      setError(null);
      setIsSuccess(false);
    },
  };
};
