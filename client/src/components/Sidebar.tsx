import { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Search, 
  Plus, 
  MoreHorizontal, 
  Home, 
  Settings, 
  ChevronDown,
  ChevronRight 
} from 'lucide-react';

export function Sidebar() {
  const [isPageListOpen, setIsPageListOpen] = useState(true);
  
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
          <Button variant="ghost" className="w-full justify-start font-normal px-2 hover:bg-neutral-800 text-gray-300">
            <Home className="h-4 w-4 mr-2" />
            <span className="text-sm">Home</span>
          </Button>
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
            <Button variant="ghost" className="h-5 w-5 p-0 hover:bg-neutral-700 hover:text-gray-200 rounded-md">
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          
          {isPageListOpen && (
            <div className="space-y-1 pl-3 pr-2 mt-1">
              <Button variant="ghost" className="w-full justify-start font-normal px-2 hover:bg-neutral-800 text-white">
                <FileText className="h-4 w-4 mr-2" />
                <span className="text-sm truncate">Untitled</span>
              </Button>
              <Button variant="ghost" className="w-full justify-start font-normal px-2 hover:bg-neutral-800 text-gray-300">
                <FileText className="h-4 w-4 mr-2" />
                <span className="text-sm truncate">Project Ideas</span>
              </Button>
              <Button variant="ghost" className="w-full justify-start font-normal px-2 hover:bg-neutral-800 text-gray-300">
                <FileText className="h-4 w-4 mr-2" />
                <span className="text-sm truncate">Meeting Notes</span>
              </Button>
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