import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateContent, generateSuggestions } from "./openai";
import { 
  generateContentSchema, 
  insertDocumentSchema,
  insertSuggestionSchema
} from "@shared/schema";
import { ZodError } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all documents
  app.get("/api/documents", async (_req: Request, res: Response) => {
    try {
      const documents = await storage.getAllDocuments();
      res.json(documents);
    } catch (error) {
      console.error("Error fetching documents:", error);
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  // Get document by ID
  app.get("/api/documents/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid document ID" });
      }
      
      const document = await storage.getDocument(id);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      res.json(document);
    } catch (error) {
      console.error("Error fetching document:", error);
      res.status(500).json({ message: "Failed to fetch document" });
    }
  });
  
  // Create a new document
  app.post("/api/documents", async (req: Request, res: Response) => {
    try {
      const documentData = insertDocumentSchema.parse(req.body);
      const document = await storage.createDocument(documentData);
      res.status(201).json(document);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid document data", errors: error.errors });
      }
      console.error("Error creating document:", error);
      res.status(500).json({ message: "Failed to create document" });
    }
  });
  
  // Update an existing document
  app.patch("/api/documents/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid document ID" });
      }
      
      const document = await storage.getDocument(id);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      const updatedDocument = await storage.updateDocument(id, req.body);
      res.json(updatedDocument);
    } catch (error) {
      console.error("Error updating document:", error);
      res.status(500).json({ message: "Failed to update document" });
    }
  });
  
  // Get suggestions for a document
  app.get("/api/documents/:id/suggestions", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid document ID" });
      }
      
      const document = await storage.getDocument(id);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      const suggestions = await storage.getSuggestions(id);
      res.json(suggestions);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      res.status(500).json({ message: "Failed to fetch suggestions" });
    }
  });
  
  // Generate suggestions for a document
  app.post("/api/documents/:id/generate-suggestions", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid document ID" });
      }
      
      const document = await storage.getDocument(id);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      // Get AI-generated suggestions
      const generatedSuggestions = await generateSuggestions(document.content);
      
      // Clear existing suggestions
      const existingSuggestions = await storage.getSuggestions(id);
      for (const suggestion of existingSuggestions) {
        await storage.deleteSuggestion(suggestion.id);
      }
      
      // Store new suggestions
      const savedSuggestions = [];
      for (const suggestion of generatedSuggestions) {
        const savedSuggestion = await storage.createSuggestion({
          prompt: suggestion.prompt,
          description: suggestion.description,
          position: suggestion.position,
          documentId: id
        });
        savedSuggestions.push(savedSuggestion);
      }
      
      res.json(savedSuggestions);
    } catch (error) {
      console.error("Error generating suggestions:", error);
      res.status(500).json({ message: "Failed to generate suggestions" });
    }
  });
  
  // Generate content based on a suggestion
  app.post("/api/suggestions/:id/generate", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid suggestion ID" });
      }
      
      const suggestion = await storage.getSuggestion(id);
      if (!suggestion) {
        return res.status(404).json({ message: "Suggestion not found" });
      }
      
      const document = await storage.getDocument(suggestion.documentId);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      // Generate content using OpenAI
      const generatedContent = await generateContent({
        documentContent: document.content,
        prompt: suggestion.prompt
      });
      
      // Update the suggestion with the generated content
      const updatedSuggestion = await storage.updateSuggestion(id, {
        generated: true,
        generatedContent
      });
      
      res.json(updatedSuggestion);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error generating content:", error);
      res.status(500).json({ message: "Failed to generate content" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
