import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Search, 
  Plus, 
  Loader2,
  Home, 
  Settings, 
  ChevronDown,
  ChevronRight 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Document } from '@shared/schema';

export function Sidebar() {
  const [isPageListOpen, setIsPageListOpen] = useState(true);
  const { toast } = useToast();
  const [location, setLocation] = useLocation();
  
  // Fetch all documents
  const { 
    data: documents = [], 
    isLoading: isDocumentsLoading,
  } = useQuery<Document[]>({
    queryKey: ['/api/documents'],
  });
  
  // Create a new document
  const createDocumentMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest(
        'POST',
        '/api/documents',
        {
          title: 'Untitled',
          content: '',
          userId: null
        }
      );
      return response.json();
    },
    onSuccess: (newDocument: Document) => {
      // Invalidate documents query to refetch the list
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      
      // Navigate to the new document
      setLocation(`/document/${newDocument.id}`);
      
      toast({
        title: 'Document created',
        description: 'New document has been created successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to create document',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Get the current document ID from the URL
  const currentDocumentId = location.startsWith('/document/') 
    ? parseInt(location.split('/')[2], 10) 
    : null;

  // Handle creating a new document
  const handleCreateDocument = () => {
    createDocumentMutation.mutate();
  };
  
  return (
    <div className="hidden md:flex flex-col h-screen w-64 bg-[#191919] dark:bg-[#191919] text-gray-200 border-r border-neutral-800">
      {/* Sidebar header */}
      <div className="flex items-center p-4 border-b border-neutral-800">
        <div className="flex items-center space-x-2">
          <div className="h-6 w-6 rounded-full bg-gray-700 flex items-center justify-center text-xs font-medium">
            A
          </div>
          <span className="font-medium">AI Writing Assistant</span>
        </div>
      </div>
      
      {/* Search */}
      <div className="px-3 py-3">
        <Button variant="ghost" className="w-full justify-start text-gray-400 hover:text-gray-200 bg-neutral-800 hover:bg-neutral-700 rounded-md">
          <Search className="h-4 w-4 mr-2" />
          <span className="text-sm">Search</span>
        </Button>
      </div>
      
      {/* Sidebar links */}
      <div className="px-2 flex-1 overflow-y-auto">
        <div className="space-y-1 py-2">
          <Link href="/">
            <Button variant="ghost" className="w-full justify-start font-normal px-2 hover:bg-neutral-800 text-gray-300">
              <Home className="h-4 w-4 mr-2" />
              <span className="text-sm">Home</span>
            </Button>
          </Link>
        </div>
        
        {/* Pages section */}
        <div className="py-2">
          <div className="flex items-center justify-between px-2 py-1 text-gray-400 text-xs">
            <button 
              className="flex items-center space-x-1 hover:text-gray-200"
              onClick={() => setIsPageListOpen(!isPageListOpen)}
            >
              {isPageListOpen ? 
                <ChevronDown className="h-3 w-3" /> : 
                <ChevronRight className="h-3 w-3" />
              }
              <span>PAGES</span>
            </button>
            <Button 
              variant="ghost" 
              className="h-5 w-5 p-0 hover:bg-neutral-700 hover:text-gray-200 rounded-md"
              onClick={handleCreateDocument}
              disabled={createDocumentMutation.isPending}
            >
              {createDocumentMutation.isPending ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Plus className="h-3 w-3" />
              )}
            </Button>
          </div>
          
          {isPageListOpen && (
            <div className="space-y-1 pl-3 pr-2 mt-1">
              {isDocumentsLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                </div>
              ) : documents.length === 0 ? (
                <div className="px-2 py-3 text-xs text-gray-500 text-center">
                  No documents found
                </div>
              ) : (
                documents.map(document => (
                  <Link key={document.id} href={`/document/${document.id}`}>
                    <Button 
                      variant="ghost" 
                      className={`w-full justify-start font-normal px-2 hover:bg-neutral-800 ${
                        currentDocumentId === document.id ? 'text-white bg-opacity-20 bg-neutral-700' : 'text-gray-300'
                      }`}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      <span className="text-sm truncate">{document.title || 'Untitled'}</span>
                    </Button>
                  </Link>
                ))
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Sidebar footer */}
      <div className="p-3 border-t border-neutral-800">
        <Button variant="ghost" className="w-full justify-start font-normal hover:bg-neutral-800 text-gray-300">
          <Settings className="h-4 w-4 mr-2" />
          <span className="text-sm">Settings</span>
        </Button>
      </div>
    </div>
  );
}