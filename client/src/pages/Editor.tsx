import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import TiptapEditor from "@/components/editor/TiptapEditor";
import SuggestionPanel from "@/components/editor/SuggestionPanel";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import useDocumentStorage from "@/hooks/useDocumentStorage";
import { ThemeToggle } from "@/components/ThemeToggle";
import type { Suggestion } from "@shared/schema";

export default function Editor() {
  const { toast } = useToast();
  const [isMobilePanelOpen, setIsMobilePanelOpen] = useState(false);
  
  const documentId = 1; // For simplicity we're using a fixed document ID
  const { document, updateDocument, isLoading: isDocumentLoading } = useDocumentStorage(documentId);
  
  // Fetch suggestions for the document
  const { 
    data: suggestions = [],
    isLoading: isSuggestionsLoading, 
    refetch: refetchSuggestions
  } = useQuery({
    queryKey: [`/api/documents/${documentId}/suggestions`],
    enabled: !!documentId
  });
  
  // Generate new suggestions based on document content
  const generateSuggestionsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest(
        "POST", 
        `/api/documents/${documentId}/generate-suggestions`, 
        {}
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
    }
  });
  
  // Generate content for a specific suggestion
  const generateContentMutation = useMutation({
    mutationFn: async (suggestionId: number) => {
      const response = await apiRequest(
        "POST", 
        `/api/suggestions/${suggestionId}/generate`, 
        {}
      );
      return response.json();
    }
  });
  
  // Generate suggestions when document content changes
  useEffect(() => {
    if (document?.content && !isSuggestionsLoading && suggestions.length === 0) {
      generateSuggestionsMutation.mutate();
    }
  }, [document?.content, suggestions.length, isSuggestionsLoading]);
  
  // Filter suggestions by position
  const leftSuggestions = suggestions.filter((s: Suggestion) => s.position === "left");
  const rightSuggestions = suggestions.filter((s: Suggestion) => s.position === "right");

  const handleAcceptAdd = async (suggestion: Suggestion) => {
    // Generate content if not already generated
    if (!suggestion.generated) {
      await generateContentMutation.mutateAsync(suggestion.id);
      await refetchSuggestions();
      
      // Get updated suggestion with generated content
      const updatedSuggestion = suggestions.find((s: Suggestion) => s.id === suggestion.id);
      if (!updatedSuggestion) return;
      
      if (document) {
        // Add the generated content after the current content
        const newContent = document.content + "\n\n" + updatedSuggestion.generatedContent;
        updateDocument({ content: newContent });
        toast({
          title: "Content added",
          description: "AI-generated content has been added to your document",
        });
      }
    } else {
      // Content already generated, add it directly
      if (document) {
        const newContent = document.content + "\n\n" + suggestion.generatedContent;
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
      const updatedSuggestion = suggestions.find((s: Suggestion) => s.id === suggestion.id);
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
    <div className="bg-[#F7F6F3] dark:bg-gray-900 min-h-screen font-[Inter] text-[#000000] dark:text-gray-100 transition-colors">
      {/* Header */}
      <header className="bg-[#ffffff] dark:bg-gray-800 border-b border-[#EBECED] dark:border-gray-700 px-4 py-3 flex items-center justify-between sticky top-0 z-10 transition-colors">
        <div className="flex items-center">
          <h1 className="text-lg font-semibold dark:text-white">AI Writing Assistant</h1>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            className="text-sm text-[#979A9B] hover:text-[#000000] dark:text-gray-300 dark:hover:text-white transition"
            disabled={generateSuggestionsMutation.isPending}
            onClick={() => generateSuggestionsMutation.mutate()}
          >
            {generateSuggestionsMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : "New Suggestions"}
          </Button>
          <Button 
            className="text-sm bg-[#2D7FF9] text-white px-3 py-1 rounded hover:bg-opacity-90 transition"
          >
            Save
          </Button>
          <div className="ml-2">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-col md:flex-row mx-auto relative">
        {/* Left Suggestion Panel */}
        <SuggestionPanel 
          title="Expand Your Ideas"
          position="left" 
          suggestions={leftSuggestions}
          onAcceptAdd={handleAcceptAdd}
          onAcceptReplace={handleAcceptReplace}
          isLoading={isSuggestionsLoading || generateSuggestionsMutation.isPending}
          isMobile={false}
        />

        {/* Editor */}
        <div className="flex-1 bg-[#ffffff] dark:bg-gray-800 rounded-lg shadow-sm mx-4 my-6 p-6 md:max-w-3xl md:mx-auto relative transition-colors">
          {isDocumentLoading ? (
            <div className="flex items-center justify-center h-[70vh]">
              <Loader2 className="h-8 w-8 animate-spin text-[#2D7FF9] dark:text-blue-400" />
            </div>
          ) : (
            <TiptapEditor 
              content={document?.content || ""} 
              onUpdate={(content) => updateDocument({ content })}
            />
          )}
        </div>

        {/* Right Suggestion Panel */}
        <SuggestionPanel 
          title="Refine Your Content"
          position="right" 
          suggestions={rightSuggestions}
          onAcceptAdd={handleAcceptAdd}
          onAcceptReplace={handleAcceptReplace}
          isLoading={isSuggestionsLoading || generateSuggestionsMutation.isPending}
          isMobile={false}
        />

        {/* Mobile Suggestion Toggle Button */}
        <button 
          className="md:hidden fixed bottom-4 right-4 bg-[#2D7FF9] text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg z-20"
          onClick={() => setIsMobilePanelOpen(!isMobilePanelOpen)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </button>

        {/* Mobile Suggestion Panel */}
        <div 
          className={`md:hidden fixed bottom-0 left-0 right-0 bg-[#EFEFEF] dark:bg-gray-800 p-4 rounded-t-lg shadow-lg transform transition-transform duration-300 z-10 ${
            isMobilePanelOpen ? 'translate-y-0' : 'translate-y-full'
          }`}
        >
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium text-sm text-[#37352F] dark:text-gray-200">AI Suggestions</h3>
            <button className="text-[#979A9B] dark:text-gray-400" onClick={() => setIsMobilePanelOpen(false)}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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
              isLoading={isSuggestionsLoading || generateSuggestionsMutation.isPending}
              isMobile={true}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
