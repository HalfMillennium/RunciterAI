import SuggestionCard from './SuggestionCard';
import { Skeleton } from '@/components/ui/skeleton';
import type { Suggestion } from '@shared/schema';

interface SuggestionPanelProps {
  title: string;
  position: 'left' | 'right' | 'mobile';
  suggestions: Suggestion[];
  onAcceptAdd: (suggestion: Suggestion) => void;
  onAcceptReplace: (suggestion: Suggestion) => void;
  isLoading: boolean;
  isMobile: boolean;
}

const SuggestionPanel = ({
  title,
  position,
  suggestions,
  onAcceptAdd,
  onAcceptReplace,
  isLoading,
  isMobile
}: SuggestionPanelProps) => {
  if (isMobile) {
    return (
      <>
        {isLoading ? (
          Array(3).fill(0).map((_, index) => (
            <div key={index} className="bg-[#ffffff] dark:bg-gray-700 rounded-md p-3 mb-4 shadow-sm transition-colors">
              <Skeleton className="h-4 w-3/4 mb-2 dark:bg-gray-600" />
              <Skeleton className="h-3 w-2/3 mb-3 dark:bg-gray-600" />
              <div className="flex space-x-2">
                <Skeleton className="h-6 flex-1 dark:bg-gray-600" />
                <Skeleton className="h-6 flex-1 dark:bg-gray-600" />
              </div>
            </div>
          ))
        ) : suggestions.length === 0 ? (
          <div className="text-center py-4 text-[#979A9B] dark:text-gray-400 transition-colors">
            No suggestions available
          </div>
        ) : (
          suggestions.map((suggestion) => (
            <SuggestionCard
              key={suggestion.id}
              suggestion={suggestion}
              onAcceptAdd={onAcceptAdd}
              onAcceptReplace={onAcceptReplace}
            />
          ))
        )}
      </>
    );
  }

  const panelClasses = `suggestion-panel ${position} ${
    position === 'left' ? 'left' : 'right'
  } hidden md:block md:w-1/4 p-4 md:sticky md:top-16 md:h-[calc(100vh-4rem)] md:overflow-y-auto hide-scrollbar transition-colors`;

  return (
    <aside className={panelClasses}>
      <div className="bg-[#EFEFEF] dark:bg-gray-800 rounded-lg p-4 shadow-sm transition-colors">
        <h3 className="font-medium text-sm text-[#37352F] dark:text-gray-200 mb-2 transition-colors">{title}</h3>
        
        {isLoading ? (
          Array(3).fill(0).map((_, index) => (
            <div key={index} className="bg-[#ffffff] dark:bg-gray-700 rounded-md p-3 mb-4 shadow-sm transition-colors">
              <Skeleton className="h-4 w-3/4 mb-2 dark:bg-gray-600" />
              <Skeleton className="h-3 w-2/3 mb-3 dark:bg-gray-600" />
              <div className="flex space-x-2">
                <Skeleton className="h-6 flex-1 dark:bg-gray-600" />
                <Skeleton className="h-6 flex-1 dark:bg-gray-600" />
              </div>
            </div>
          ))
        ) : suggestions.length === 0 ? (
          <div className="text-center py-4 text-[#979A9B] dark:text-gray-400 transition-colors">
            No suggestions available
          </div>
        ) : (
          suggestions.map((suggestion) => (
            <SuggestionCard
              key={suggestion.id}
              suggestion={suggestion}
              onAcceptAdd={onAcceptAdd}
              onAcceptReplace={onAcceptReplace}
            />
          ))
        )}
      </div>
    </aside>
  );
};

export default SuggestionPanel;
