import { useMutation } from "@apollo/client";
import { DocumentNode } from "graphql";
import { useState } from "react";

// useGenericMutation.ts
interface MutationConfig<TData, TVariables> {
  mutation: DocumentNode;
  onSuccess?: (data: TData) => void;
  onError?: (error: Error) => void;
  defaultErrorMessage?: string;
}

import { OperationVariables } from "@apollo/client";

export const useGenericMutation = <
  TData,
  TVariables extends OperationVariables
>({
  mutation,
  onSuccess,
  onError,
  defaultErrorMessage = "An error occurred",
}: MutationConfig<TData, TVariables>) => {
  const [error, setError] = useState<string>("");
  const [isSuccess, setIsSuccess] = useState(false);

  const [mutate, mutationResult] = useMutation(mutation, {
    onCompleted: (data: TData) => {
      setIsSuccess(true);
      onSuccess?.(data);
    },
    onError: (error) => {
      const errorMessage = error.message || defaultErrorMessage;
      setError(errorMessage);
      onError?.(error);
    },
  });

  const execute = async (variables: TVariables) => {
    setError("");
    setIsSuccess(false);
    try {
      const result = await mutate({ variables });
      return result;
    } catch (err) {
      // Error handled by onError callback
      return null;
    }
  };

  return {
    execute,
    error,
    isSuccess,
    isLoading: mutationResult.loading,
    reset: () => {
      setError("");
      setIsSuccess(false);
    },
  };
};
