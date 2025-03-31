import { 
  users, type User, type InsertUser,
  documents, type Document, type InsertDocument, 
  suggestions, type Suggestion, type InsertSuggestion
} from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Document methods
  getAllDocuments(): Promise<Document[]>;
  getDocument(id: number): Promise<Document | undefined>;
  createDocument(document: InsertDocument): Promise<Document>;
  updateDocument(id: number, document: Partial<Document>): Promise<Document | undefined>;
  
  // Suggestion methods
  getSuggestions(documentId: number): Promise<Suggestion[]>;
  getSuggestion(id: number): Promise<Suggestion | undefined>;
  createSuggestion(suggestion: InsertSuggestion): Promise<Suggestion>;
  updateSuggestion(id: number, suggestion: Partial<Suggestion>): Promise<Suggestion | undefined>;
  deleteSuggestion(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private documents: Map<number, Document>;
  private suggestions: Map<number, Suggestion>;
  private userIdCounter: number;
  private documentIdCounter: number;
  private suggestionIdCounter: number;

  constructor() {
    this.users = new Map();
    this.documents = new Map();
    this.suggestions = new Map();
    this.userIdCounter = 1;
    this.documentIdCounter = 1;
    this.suggestionIdCounter = 1;
    
    // Initialize with an empty document
    this.createDocument({
      title: "Untitled",
      content: "",
      userId: null
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Document methods
  async getAllDocuments(): Promise<Document[]> {
    return Array.from(this.documents.values());
  }
  
  async getDocument(id: number): Promise<Document | undefined> {
    return this.documents.get(id);
  }
  
  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const id = this.documentIdCounter++;
    const now = new Date();
    const document: Document = { 
      ...insertDocument, 
      id,
      title: insertDocument.title || "Untitled",
      content: insertDocument.content || "",
      lastModified: now
    };
    this.documents.set(id, document);
    return document;
  }
  
  async updateDocument(id: number, documentUpdate: Partial<Document>): Promise<Document | undefined> {
    const existingDocument = this.documents.get(id);
    
    if (!existingDocument) {
      return undefined;
    }
    
    const updatedDocument: Document = {
      ...existingDocument,
      ...documentUpdate,
      lastModified: new Date()
    };
    
    this.documents.set(id, updatedDocument);
    return updatedDocument;
  }
  
  // Suggestion methods
  async getSuggestions(documentId: number): Promise<Suggestion[]> {
    return Array.from(this.suggestions.values()).filter(
      suggestion => suggestion.documentId === documentId
    );
  }
  
  async getSuggestion(id: number): Promise<Suggestion | undefined> {
    return this.suggestions.get(id);
  }
  
  async createSuggestion(insertSuggestion: InsertSuggestion): Promise<Suggestion> {
    const id = this.suggestionIdCounter++;
    const suggestion: Suggestion = {
      ...insertSuggestion,
      id,
      generated: false,
      generatedContent: "",
      description: insertSuggestion.description || "",
      position: insertSuggestion.position || "right"
    };
    this.suggestions.set(id, suggestion);
    return suggestion;
  }
  
  async updateSuggestion(id: number, suggestionUpdate: Partial<Suggestion>): Promise<Suggestion | undefined> {
    const existingSuggestion = this.suggestions.get(id);
    
    if (!existingSuggestion) {
      return undefined;
    }
    
    const updatedSuggestion: Suggestion = {
      ...existingSuggestion,
      ...suggestionUpdate
    };
    
    this.suggestions.set(id, updatedSuggestion);
    return updatedSuggestion;
  }
  
  async deleteSuggestion(id: number): Promise<boolean> {
    return this.suggestions.delete(id);
  }
}

export const storage = new MemStorage();
