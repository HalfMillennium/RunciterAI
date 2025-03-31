import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import TiptapEditor from "@/components/editor/TiptapEditor";
import SuggestionPanel from "@/components/editor/SuggestionPanel";
import SuggestionCard from "@/components/editor/SuggestionCard";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Menu } from "lucide-react";
import useDocumentStorage from "@/hooks/useDocumentStorage";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Sidebar } from "@/components/Sidebar";
import type { Suggestion } from "@shared/schema";

interface EditorProps {
  documentId?: number;
}

export default function Editor({ documentId = 1 }: EditorProps) {
  const [isMobilePanelOpen, setIsMobilePanelOpen] = useState(false);
  const { toast } = useToast();
  const {
    document,
    updateDocument,
    isLoading: isDocumentLoading,
  } = useDocumentStorage(documentId);

  // Fetch suggestions for the document
  const {
    data: suggestions = [] as Suggestion[],
    isLoading: isSuggestionsLoading,
    refetch: refetchSuggestions,
  } = useQuery<Suggestion[]>({
    queryKey: [`/api/documents/${documentId}/suggestions`],
    enabled: !!documentId,
  });

  // Generate new suggestions based on document content
  const generateSuggestionsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest(
        "POST",
        `/api/documents/${documentId}/generate-suggestions`,
        {},
      );
      return response.json();
    },
    onSuccess: () => {
      refetchSuggestions();
      toast({
        title: "Generated new suggestions",
        description: "Check out the suggestion panels for new ideas",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to generate suggestions",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Generate content for a specific suggestion
  const generateContentMutation = useMutation({
    mutationFn: async (suggestionId: number) => {
      const response = await apiRequest(
        "POST",
        `/api/suggestions/${suggestionId}/generate`,
        {},
      );
      return response.json();
    },
  });

  // Generate suggestions when document content changes
  useEffect(() => {
    if (
      document?.content &&
      !isSuggestionsLoading &&
      suggestions.length === 0
    ) {
      generateSuggestionsMutation.mutate();
    }
  }, [document?.content, suggestions.length, isSuggestionsLoading]);

  // Filter suggestions by position
  const leftSuggestions = suggestions.filter(
    (s: Suggestion) => s.position === "left",
  );
  const rightSuggestions = suggestions.filter(
    (s: Suggestion) => s.position === "right",
  );

  const handleAcceptAdd = async (suggestion: Suggestion) => {
    // Generate content if not already generated
    if (!suggestion.generated) {
      await generateContentMutation.mutateAsync(suggestion.id);
      await refetchSuggestions();

      // Get updated suggestion with generated content
      const updatedSuggestion = suggestions.find(
        (s: Suggestion) => s.id === suggestion.id,
      );
      if (!updatedSuggestion) return;

      if (document) {
        // Add the generated content after the current content
        const newContent =
          document.content + "\n\n" + updatedSuggestion.generatedContent;
        updateDocument({ content: newContent });
        toast({
          title: "Content added",
          description: "AI-generated content has been added to your document",
        });
      }
    } else {
      // Content already generated, add it directly
      if (document) {
        const newContent =
          document.content + "\n\n" + suggestion.generatedContent;
        updateDocument({ content: newContent });
        toast({
          title: "Content added",
          description: "AI-generated content has been added to your document",
        });
      }
    }
  };

  const handleAcceptReplace = async (suggestion: Suggestion) => {
    // Generate content if not already generated
    if (!suggestion.generated) {
      await generateContentMutation.mutateAsync(suggestion.id);
      await refetchSuggestions();

      // Get updated suggestion with generated content
      const updatedSuggestion = suggestions.find(
        (s: Suggestion) => s.id === suggestion.id,
      );
      if (!updatedSuggestion) return;

      // Replace the entire document content
      updateDocument({ content: updatedSuggestion.generatedContent });
      toast({
        title: "Content replaced",
        description: "AI-generated content has replaced your document",
      });
    } else {
      // Content already generated, replace directly
      updateDocument({ content: suggestion.generatedContent });
      toast({
        title: "Content replaced",
        description: "AI-generated content has replaced your document",
      });
    }
  };

  return (
    <div className="flex h-screen overflow-hidden font-[Inter] text-[#000000] dark:text-gray-100 transition-colors">
      {/* Sidebar */}
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden bg-[#ffffff] dark:bg-[#1f1f1f]">
        {/* Header */}
        <header className="z-10 bg-[#ffffff] dark:bg-[#1f1f1f] border-b border-[#EBECED] dark:border-neutral-800 px-4 py-3 flex items-center justify-between h-12">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
            <div className="text-sm text-gray-500 dark:text-gray-400">AI Writing Assistant</div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
              disabled={generateSuggestionsMutation.isPending}
              onClick={() => generateSuggestionsMutation.mutate()}
            >
              {generateSuggestionsMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                "New Suggestions"
              )}
            </Button>
            <ThemeToggle />
          </div>
        </header>

        {/* Main Content Area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Content Column */}
          <div className="flex-1 flex overflow-hidden">
            <div className="flex flex-col flex-1 overflow-auto">
              {/* Document Title */}
              <div className="px-4 py-6 md:px-10 md:py-10">
                <div className="relative group mb-2">
                  <input
                    type="text"
                    value={document?.title || "Untitled"}
                    onChange={(e) => updateDocument({ title: e.target.value })}
                    className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white w-full bg-transparent border-0 border-b border-transparent hover:border-gray-200 dark:hover:border-gray-700 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 p-0 transition-colors"
                    placeholder="Untitled"
                  />
                  <div className="absolute inset-y-0 right-0 hidden group-hover:flex items-center pointer-events-none">
                    <span className="text-xs text-gray-400 dark:text-gray-500">Click to edit</span>
                  </div>
                </div>
                
                {/* Editor */}
                <div className="mt-6">
                  {isDocumentLoading ? (
                    <div className="flex items-center justify-center h-[50vh]">
                      <Loader2 className="h-8 w-8 animate-spin text-[#2D7FF9] dark:text-blue-400" />
                    </div>
                  ) : (
                    <TiptapEditor
                      content={document?.content || ""}
                      onUpdate={(content) => updateDocument({ content })}
                    />
                  )}
                </div>
              </div>
            </div>
            
            {/* Right Suggestion Panel */}
            <div className="hidden md:block w-80 border-l border-[#EBECED] dark:border-neutral-800 bg-[#ffffff] dark:bg-[#1f1f1f] overflow-y-auto">
              <div className="p-4 sticky top-0 bg-[#ffffff] dark:bg-[#1f1f1f] z-10 border-b border-[#EBECED] dark:border-neutral-800">
                <h3 className="font-medium text-sm text-gray-500 dark:text-gray-400">AI Suggestions</h3>
              </div>
              <div className="p-4">
                {(isSuggestionsLoading || generateSuggestionsMutation.isPending) ? (
                  Array(3).fill(0).map((_, index) => (
                    <div key={index} className="bg-[#f7f7f7] dark:bg-neutral-800 rounded-md p-3 mb-4 shadow-sm transition-colors">
                      <div className="h-4 w-3/4 mb-2 bg-gray-200 dark:bg-neutral-700 rounded animate-pulse"></div>
                      <div className="h-3 w-2/3 mb-3 bg-gray-200 dark:bg-neutral-700 rounded animate-pulse"></div>
                      <div className="flex space-x-2">
                        <div className="h-6 flex-1 bg-gray-200 dark:bg-neutral-700 rounded animate-pulse"></div>
                        <div className="h-6 flex-1 bg-gray-200 dark:bg-neutral-700 rounded animate-pulse"></div>
                      </div>
                    </div>
                  ))
                ) : suggestions.length === 0 ? (
                  <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                    No suggestions available
                  </div>
                ) : (
                  [...leftSuggestions, ...rightSuggestions].map((suggestion) => (
                    <SuggestionCard
                      key={suggestion.id}
                      suggestion={suggestion}
                      onAcceptAdd={handleAcceptAdd}
                      onAcceptReplace={handleAcceptReplace}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Mobile Suggestion Toggle Button */}
        <button
          className="md:hidden fixed bottom-4 right-4 bg-[#2D7FF9] text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg z-20"
          onClick={() => setIsMobilePanelOpen(!isMobilePanelOpen)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        </button>

        {/* Mobile Suggestion Panel */}
        <div
          className={`md:hidden fixed bottom-0 left-0 right-0 bg-[#ffffff] dark:bg-[#1f1f1f] p-4 rounded-t-lg shadow-lg transform transition-transform duration-300 z-10 ${
            isMobilePanelOpen ? "translate-y-0" : "translate-y-full"
          }`}
        >
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium text-sm text-gray-600 dark:text-gray-300">
              AI Suggestions
            </h3>
            <button
              className="text-gray-500 dark:text-gray-400"
              onClick={() => setIsMobilePanelOpen(false)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="overflow-y-auto max-h-[calc(40vh-3rem)]">
            <SuggestionPanel
              title=""
              position="mobile"
              suggestions={[...leftSuggestions, ...rightSuggestions]}
              onAcceptAdd={handleAcceptAdd}
              onAcceptReplace={handleAcceptReplace}
              isLoading={
                isSuggestionsLoading || generateSuggestionsMutation.isPending
              }
              isMobile={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
