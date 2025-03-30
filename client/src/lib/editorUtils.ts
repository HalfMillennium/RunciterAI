/**
 * Utility functions for the text editor
 */

/**
 * Extracts plain text from HTML content
 * @param html HTML content string
 * @returns Plain text without HTML tags
 */
export const extractTextFromHtml = (html: string): string => {
  // Create a temporary DOM element
  const tempElement = document.createElement('div');
  tempElement.innerHTML = html;
  
  // Return the text content
  return tempElement.textContent || tempElement.innerText || '';
};

/**
 * Checks if the user has stopped typing based on a timeout
 * @param lastKeypressTime Timestamp of the last keypress
 * @param inactivityThreshold Threshold in ms to consider user has stopped typing
 * @returns Boolean indicating if user has stopped typing
 */
export const hasStoppedTyping = (
  lastKeypressTime: number,
  inactivityThreshold: number = 1000
): boolean => {
  return Date.now() - lastKeypressTime > inactivityThreshold;
};

/**
 * Insert text at the cursor position in the editor
 * @param editor The editor instance
 * @param text Text to insert
 */
export const insertTextAtCursor = (editor: any, text: string): void => {
  if (editor) {
    editor.commands.insertContent(text);
  }
};

/**
 * Replace the entire editor content
 * @param editor The editor instance
 * @param text New content for the editor
 */
export const replaceEditorContent = (editor: any, text: string): void => {
  if (editor) {
    editor.commands.setContent(text);
  }
};
