import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useState } from 'react';
import type { Suggestion } from '@shared/schema';

interface SuggestionCardProps {
  suggestion: Suggestion;
  onAcceptAdd: (suggestion: Suggestion) => void;
  onAcceptReplace: (suggestion: Suggestion) => void;
}

const SuggestionCard = ({ suggestion, onAcceptAdd, onAcceptReplace }: SuggestionCardProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Generate content for a suggestion if not already generated
  const generateContent = useMutation({
    mutationFn: async () => {
      setIsGenerating(true);
      const response = await apiRequest(
        "POST", 
        `/api/suggestions/${suggestion.id}/generate`, 
        {}
      );
      return response.json();
    },
    onSuccess: (data) => {
      if (data.generated) {
        suggestion.generated = true;
        suggestion.generatedContent = data.generatedContent;
      }
      setIsGenerating(false);
    },
    onError: () => {
      setIsGenerating(false);
    }
  });
  
  const handleAcceptAdd = async () => {
    if (!suggestion.generated && !isGenerating) {
      await generateContent.mutateAsync();
    }
    onAcceptAdd(suggestion);
  };
  
  const handleAcceptReplace = async () => {
    if (!suggestion.generated && !isGenerating) {
      await generateContent.mutateAsync();
    }
    onAcceptReplace(suggestion);
  };
  
  return (
    <div className="bg-[#f7f7f7] dark:bg-neutral-800 rounded-md p-3 mb-4 shadow-sm transition-colors">
      <p className="text-sm font-medium mb-2 text-gray-800 dark:text-gray-200">{suggestion.prompt}</p>
      <div className="text-xs text-gray-500 dark:text-gray-400 mb-3 transition-colors">{suggestion.description}</div>
      
      {isGenerating ? (
        <div className="flex justify-center py-1">
          <Loader2 className="h-4 w-4 animate-spin text-blue-500 dark:text-blue-400" />
        </div>
      ) : (
        <div className="flex space-x-2">
          <Button 
            className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition flex-1 h-auto"
            onClick={handleAcceptAdd}
          >
            Accept & Add
          </Button>
          <Button 
            className="text-xs bg-gray-600 text-white px-2 py-1 rounded hover:bg-gray-700 transition flex-1 h-auto"
            onClick={handleAcceptReplace}
          >
            Accept & Replace
          </Button>
        </div>
      )}
    </div>
  );
};

export default SuggestionCard;