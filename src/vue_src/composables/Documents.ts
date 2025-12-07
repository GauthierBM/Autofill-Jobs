import { ref, onMounted } from 'vue';

// Type declarations for browser extension APIs
interface BrowserStorage {
  local: {
    get: (keys?: string | string[] | object | null) => Promise<{ [key: string]: any }>;
    set: (items: object) => Promise<void>;
  };
}

interface ChromeStorage {
  local: {
    get: (keys?: string | string[] | object | null, callback?: (items: { [key: string]: any }) => void) => void;
    set: (items: object, callback?: () => void) => void;
  };
}

declare global {
  interface Window {
    browser?: {
      storage: BrowserStorage;
    };
  }
}

export interface Document {
  id: string;
  name: string;
  type: 'resume' | 'cover_letter' | 'other';
  content: string; // base64 encoded
  uploadDate: string;
  size: number;
  isActive: boolean; // currently selected for autofill
  tags?: string[];
}

const documents = ref<Document[]>([]);

export function useDocuments() {
  const loadDocuments = async () => {
    try {
      let data: { [key: string]: any };
      
      if (window.browser?.storage) {
        // Use browser API (Promise-based)
        data = await window.browser.storage.local.get('documents');
      } else if (window.chrome?.storage) {
        // Use Chrome API (callback-based)
        data = await new Promise((resolve) => {
          window.chrome!.storage.local.get('documents', (result) => {
            resolve(result);
          });
        });
      } else {
        throw new Error('No storage API available');
      }
      
      documents.value = data.documents || [];
      console.log('Loaded documents:', documents.value.length, 'documents');
    } catch (error) {
      console.error('Failed to load documents:', error);
      documents.value = [];
    }
  };

  const saveDocuments = async () => {
    try {
      console.log('Saving documents:', documents.value.length, 'documents');
      
      // Create a plain JSON copy to avoid DataCloneError with Vue proxies
      const plainDocuments = JSON.parse(JSON.stringify(documents.value));
      console.log('Serialized documents successfully:', plainDocuments.length, 'plain objects');
      
      if (window.browser?.storage) {
        // Use browser API (Promise-based)
        await window.browser.storage.local.set({ documents: plainDocuments });
        console.log('Documents saved using browser API');
      } else if (window.chrome?.storage) {
        // Use Chrome API (callback-based)
        await new Promise<void>((resolve, reject) => {
          window.chrome!.storage.local.set({ documents: plainDocuments }, () => {
            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError.message));
            } else {
              console.log('Documents saved using Chrome API');
              resolve();
            }
          });
        });
      } else {
        throw new Error('No storage API available');
      }
    } catch (error) {
      console.error('Failed to save documents:', error);
      throw error;
    }
  };

  const addDocument = async (file: File, type: 'resume' | 'cover_letter' | 'other', tags?: string[]) => {
    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        if (!e.target?.result) {
          reject(new Error('Failed to read file'));
          return;
        }

        const base64 = (e.target.result as string).split(',')[1];
        const newDocument: Document = {
          id: Date.now().toString(),
          name: file.name,
          type,
          content: base64,
          uploadDate: new Date().toISOString(),
          size: file.size,
          isActive: false,
          tags: tags || []
        };

        // If this is the first document of its type, make it active
        const existingOfType = documents.value.filter(doc => doc.type === type);
        if (existingOfType.length === 0) {
          newDocument.isActive = true;
        }

        documents.value.push(newDocument);
        try {
          await saveDocuments();
          console.log('Document added successfully:', newDocument.name);
          resolve();
        } catch (saveError) {
          console.error('Failed to save document:', saveError);
          // Remove the document from memory if save failed
          documents.value = documents.value.filter(doc => doc.id !== newDocument.id);
          reject(saveError);
        }
      };

      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  const deleteDocument = async (documentId: string) => {
    const documentToDelete = documents.value.find(doc => doc.id === documentId);
    if (!documentToDelete) return;

    // If deleting an active document, activate another one of the same type if available
    if (documentToDelete.isActive) {
      const otherDocsOfType = documents.value.filter(doc => 
        doc.id !== documentId && doc.type === documentToDelete.type
      );
      if (otherDocsOfType.length > 0) {
        otherDocsOfType[0].isActive = true;
      }
    }

    documents.value = documents.value.filter(doc => doc.id !== documentId);
    await saveDocuments();
  };

  const setActiveDocument = async (documentId: string) => {
    const documentToActivate = documents.value.find(doc => doc.id === documentId);
    if (!documentToActivate) return;

    // Deactivate all documents of the same type
    documents.value.forEach(doc => {
      if (doc.type === documentToActivate.type) {
        doc.isActive = false;
      }
    });

    // Activate the selected document
    documentToActivate.isActive = true;
    await saveDocuments();
  };

  const getActiveDocument = (type: 'resume' | 'cover_letter' | 'other') => {
    return documents.value.find(doc => doc.type === type && doc.isActive);
  };

  const getDocumentsByType = (type: 'resume' | 'cover_letter' | 'other') => {
    return documents.value.filter(doc => doc.type === type);
  };

  const updateDocument = async (documentId: string, updates: Partial<Document>) => {
    const docIndex = documents.value.findIndex(doc => doc.id === documentId);
    if (docIndex === -1) return;

    documents.value[docIndex] = { ...documents.value[docIndex], ...updates };
    await saveDocuments();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  onMounted(() => {
    loadDocuments();
  });

  return {
    documents,
    loadDocuments,
    saveDocuments,
    addDocument,
    deleteDocument,
    setActiveDocument,
    getActiveDocument,
    getDocumentsByType,
    updateDocument,
    formatFileSize,
    formatDate
  };
}
