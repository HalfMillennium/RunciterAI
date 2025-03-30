import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { type Document } from '@shared/schema';
import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook to handle document storage operations
 */
const useDocumentStorage = (documentId: number) => {
  const queryClient = useQueryClient();
  const [localContent, setLocalContent] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Fetch document data
  const { 
    data: document, 
    isLoading, 
    error 
  } = useQuery<Document>({
    queryKey: [`/api/documents/${documentId}`],
    enabled: !!documentId
  });
  
  // Use local content state if available, otherwise use document content
  useEffect(() => {
    if (document && localContent === null) {
      setLocalContent(document.content);
    }
  }, [document, localContent]);
  
  // Update document mutation
  const updateDocumentMutation = useMutation({
    mutationFn: async (updateData: Partial<Document>) => {
      const response = await apiRequest(
        "PATCH", 
        `/api/documents/${documentId}`, 
        updateData
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/documents/${documentId}`] });
    }
  });
  
  // Function to update the document with debouncing
  const updateDocument = useCallback((updateData: Partial<Document>) => {
    // Update local state immediately
    if ('content' in updateData) {
      setLocalContent(updateData.content as string);
    }
    
    // Clear previous timeout if it exists
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Set a new timeout for the API call
    timeoutRef.current = setTimeout(() => {
      updateDocumentMutation.mutate(updateData);
    }, 1000);
  }, [updateDocumentMutation, documentId]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  // Construct the local document representation
  const localDocument = document && localContent !== null 
    ? { ...document, content: localContent }
    : document;
  
  return {
    document: localDocument,
    updateDocument,
    isLoading,
    error
  };
};

export default useDocumentStorage;
