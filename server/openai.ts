import OpenAI from "openai";
import { GenerateContentRequest } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || "placeholder-key" // Will be provided via environment variable
});

/**
 * Generate document content suggestions based on the current document and a prompt
 */
export async function generateContent(request: GenerateContentRequest): Promise<string> {
  try {
    const { documentContent, prompt } = request;
    const safeDocumentContent = documentContent || "";
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a helpful writing assistant that generates high-quality content based on the user's current document and prompt. Provide thorough, well-structured responses that match the style and tone of the user's existing content."
        },
        {
          role: "user",
          content: `
Current document content:
${safeDocumentContent}

Based on this ${safeDocumentContent.trim() ? "content" : "empty document"}, please ${prompt}

Format your response appropriately with line breaks, lists, and proper paragraph structure as needed.
`
        }
      ],
      max_tokens: 1000,
    });

    return response.choices[0].message.content || "Sorry, I couldn't generate content at this time.";
  } catch (error) {
    console.error("Error generating content with OpenAI:", error);
    throw new Error("Failed to generate content. Please try again later.");
  }
}

/**
 * Generate suggestion prompts based on the current document content
 */
export async function generateSuggestions(documentContent: string | null): Promise<{ prompt: string, description: string, position: string }[]> {
  try {
    const safeDocumentContent = documentContent || "";
    if (safeDocumentContent.trim() === "") {
      return getDefaultSuggestions();
    }
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a helpful writing assistant that generates suggestion prompts based on the user's current document content. Generate prompts that would help the user expand, refine, or improve their document."
        },
        {
          role: "user",
          content: `
Based on the following document content, generate 4-6 suggestion prompts that would help the user expand, refine, or improve their document. 
These should be creative and specific to the content.

Document content:
${safeDocumentContent}

Respond with JSON in the following format:
[
  {
    "prompt": "Short prompt text (e.g., 'Generate a timeline for project implementation')",
    "description": "Brief explanation of what this will do",
    "position": "left or right - left for expanding ideas, right for refining content"
  }
]`
        }
      ],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content || '{"suggestions":[]}';
    const parsedContent = JSON.parse(content);
    
    // Handle both possible response formats
    const suggestions = Array.isArray(parsedContent) 
      ? parsedContent 
      : (parsedContent.suggestions || []);
    
    // If we somehow got no suggestions, return defaults
    if (!suggestions.length) {
      return getDefaultSuggestions();
    }
    
    return suggestions;
  } catch (error) {
    console.error("Error generating suggestions with OpenAI:", error);
    return getDefaultSuggestions();
  }
}

/**
 * Default suggestions for when we can't generate custom ones
 */
function getDefaultSuggestions(): { prompt: string, description: string, position: string }[] {
  return [
    {
      prompt: "Generate an interesting project idea and draft an outline",
      description: "Get a complete project concept with structure",
      position: "left"
    },
    {
      prompt: "Create a pros and cons list for this idea",
      description: "Evaluate the feasibility of your concept",
      position: "left"
    },
    {
      prompt: "Suggest a timeline for development",
      description: "Break down implementation steps",
      position: "right"
    },
    {
      prompt: "List potential user personas for this product",
      description: "Understanding your target audience",
      position: "right"
    },
    {
      prompt: "Brainstorm potential monetization strategies",
      description: "Explore business model options",
      position: "right"
    }
  ];
}
