import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect, useCallback, useRef } from "react";

interface TiptapEditorProps {
  content: string;
  onUpdate: (content: string) => void;
}

const TiptapEditor = ({ content, onUpdate }: TiptapEditorProps) => {
  // Use a ref to track the timeout for debouncing
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced update function
  const handleUpdate = useCallback(
    (newContent: string) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        onUpdate(newContent);
      }, 1000);
    },
    [onUpdate],
  );

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Start typing...",
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class:
          "editor-content prose prose-sm dark:prose-invert focus:outline-none min-h-[70vh] max-w-none dark:text-gray-200",
      },
    },
    onUpdate: ({ editor }) => {
      const htmlContent = editor.getHTML();
      handleUpdate(htmlContent);
    },
  });

  // Update editor content when the prop changes
  useEffect(() => {
    if (editor && content && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="w-full transition-colors">
      <EditorContent editor={editor} className="dark:bg-gray-800" />
    </div>
  );
};

export default TiptapEditor;
