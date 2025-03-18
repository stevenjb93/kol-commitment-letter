import * as fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

interface DocumentInfo {
  id: string;
  originalName: string;
  fileName: string;
  signedFileName?: string;
  status: 'pending' | 'signed';
  createdAt: Date;
  updatedAt: Date;
}

class FileStore {
  private storePath: string;
  private documentsPath: string;

  constructor(storePath: string) {
    this.storePath = storePath;
    this.documentsPath = path.join(storePath, 'documents.json');
    this.init();
  }

  private async init() {
    try {
      await fs.mkdir(this.storePath, { recursive: true });
      try {
        await fs.access(this.documentsPath);
      } catch {
        await fs.writeFile(this.documentsPath, JSON.stringify([]));
      }
    } catch (error) {
      console.error('Error initializing file store:', error);
    }
  }

  private async readDocuments(): Promise<DocumentInfo[]> {
    try {
      const data = await fs.readFile(this.documentsPath, 'utf-8');
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  private async writeDocuments(documents: DocumentInfo[]): Promise<void> {
    await fs.writeFile(this.documentsPath, JSON.stringify(documents, null, 2));
  }

  async createDocument(originalName: string, fileName: string): Promise<DocumentInfo> {
    const documents = await this.readDocuments();
    const newDocument: DocumentInfo = {
      id: uuidv4(),
      originalName,
      fileName,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    documents.push(newDocument);
    await this.writeDocuments(documents);
    return newDocument;
  }

  async getDocument(id: string): Promise<DocumentInfo | null> {
    const documents = await this.readDocuments();
    return documents.find(doc => doc.id === id) || null;
  }

  async updateDocument(id: string, updates: Partial<DocumentInfo>): Promise<DocumentInfo | null> {
    const documents = await this.readDocuments();
    const index = documents.findIndex(doc => doc.id === id);
    
    if (index === -1) return null;
    
    documents[index] = {
      ...documents[index],
      ...updates,
      updatedAt: new Date()
    };
    
    await this.writeDocuments(documents);
    return documents[index];
  }
}

export default FileStore; 