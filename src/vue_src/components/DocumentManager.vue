<template>
  <div class="p-4 bg-white rounded-lg shadow">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold">Document Manager</h3>
      <button 
        @click="goHome"
        class="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
        title="Return to main interface"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
        </svg>
        Home
      </button>
    </div>
    
    <!-- Standalone Mode Notice -->
    <div class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
      <div class="flex items-start gap-2">
        <svg class="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
        </svg>
        <div class="flex-1">
          <p class="text-sm text-blue-800 font-medium mb-1">
            Document Upload Works Best in Standalone Mode
          </p>
          <p class="text-sm text-blue-700 mb-2">
            For the most reliable document upload experience, use our standalone document manager. It works independently of browser extension limitations.
          </p>
          <a 
            href="standalone.html" 
            target="_blank"
            class="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
            </svg>
            Open Standalone Document Manager
          </a>
        </div>
      </div>
    </div>
    
    <!-- Upload Section -->
    <div class="mb-6">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-4">
          <select v-model="selectedType" class="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500">
            <option value="resume">Resume</option>
            <option value="cover_letter">Cover Letter</option>
            <option value="other">Other Document</option>
          </select>
          
          <input
            v-model="newTags"
            type="text"
            placeholder="Tags (comma separated)"
            class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          />
          
          <label class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer">
            Upload Document
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              @change="handleFileUpload"
              class="hidden"
            />
          </label>
        </div>
        
        <button 
          @click="loadDocuments"
          class="px-3 py-2 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
          title="Refresh documents"
        >
          Refresh
        </button>
      </div>
    </div>

    <!-- Document Tabs -->
    <div class="border-b border-gray-200 mb-4">
      <nav class="-mb-px flex space-x-8">
        <button
          v-for="type in documentTypes"
          :key="type.value"
          @click="activeTab = type.value"
          :class="[
            'py-2 px-1 border-b-2 font-medium text-sm',
            activeTab === type.value
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          ]"
        >
          {{ type.label }} ({{ getDocumentsByType(type.value).length }})
        </button>
      </nav>
    </div>

    <!-- Documents List -->
    <div class="space-y-3">
      <div
        v-for="document in getDocumentsByType(activeTab)"
        :key="document.id"
        class="border border-gray-200 rounded-lg p-4"
        :class="{ 'ring-2 ring-blue-500': document.isActive }"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-2">
              <h4 class="font-medium text-gray-900">{{ document.name }}</h4>
              <span
                v-if="document.isActive"
                class="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full"
              >
                Active
              </span>
            </div>
            
            <div class="text-sm text-gray-500 mb-2">
              <span>{{ formatFileSize(document.size) }}</span>
              <span class="mx-2">•</span>
              <span>{{ formatDate(document.uploadDate) }}</span>
            </div>
            
            <div v-if="document.tags && document.tags.length > 0" class="flex flex-wrap gap-1 mb-3">
              <span
                v-for="tag in document.tags"
                :key="tag"
                class="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
              >
                {{ tag }}
              </span>
            </div>
          </div>
          
          <div class="flex items-center gap-2 ml-4">
            <button
              v-if="!document.isActive"
              @click="setActiveDocument(document.id)"
              class="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
            >
              Set Active
            </button>
            
            <button
              @click="editDocument(document)"
              class="p-1 text-gray-600 hover:text-gray-800"
              title="Edit tags"
            >
              <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="currentColor">
                <path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-160l528-528q23-23 57-23t57 23l56 56q23 23 23 57t-23 57L240-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 56 57-28-28Z"/>
              </svg>
            </button>
            
            <button
              @click="deleteDocument(document.id)"
              class="p-1 text-red-600 hover:text-red-800"
              title="Delete"
            >
              <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="currentColor">
                <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360Z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      <div v-if="getDocumentsByType(activeTab).length === 0" class="text-center py-8 text-gray-500">
        No {{ activeTab === 'resume' ? 'resumes' : activeTab === 'cover_letter' ? 'cover letters' : 'documents' }} uploaded yet.
      </div>
    </div>

    <!-- Edit Tags Modal -->
    <div v-if="editingDocument" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
        <h3 class="text-lg font-semibold mb-4">Edit Document Tags</h3>
        <p class="text-sm text-gray-600 mb-4">{{ editingDocument.name }}</p>
        
        <input
          v-model="editTags"
          type="text"
          placeholder="Tags (comma separated)"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 mb-4"
        />
        
        <div class="flex justify-end gap-2">
          <button
            @click="cancelEdit"
            class="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            @click="saveEdit"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useDocuments, type Document } from '@/composables/Documents.ts';

// Define emits
const emit = defineEmits(['close']);

const {
  documents,
  addDocument,
  deleteDocument,
  setActiveDocument,
  getDocumentsByType,
  updateDocument,
  formatFileSize,
  formatDate,
  loadDocuments
} = useDocuments();

const activeTab = ref<'resume' | 'cover_letter' | 'other'>('resume');
const selectedType = ref<'resume' | 'cover_letter' | 'other'>('resume');
const newTags = ref('');
const editingDocument = ref<Document | null>(null);
const editTags = ref('');

const documentTypes: Array<{ value: 'resume' | 'cover_letter' | 'other'; label: string }> = [
  { value: 'resume', label: 'Resumes' },
  { value: 'cover_letter', label: 'Cover Letters' },
  { value: 'other', label: 'Other Documents' }
];

const handleFileUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  
  if (!file) return;
  
  // Validate file type
  const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  if (!allowedTypes.includes(file.type)) {
    alert('Please upload a PDF, DOC, or DOCX file');
    return;
  }
  
  // Validate file size (10MB max)
  if (file.size > 10 * 1024 * 1024) {
    alert('File size must be less than 10MB');
    return;
  }
  
  try {
    const tags = newTags.value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    await addDocument(file, selectedType.value, tags);
    
    // Reset form
    newTags.value = '';
    target.value = '';
    
    // Switch to the tab where the document was added
    activeTab.value = selectedType.value;
    
  } catch (error) {
    console.error('Failed to upload document:', error);
    alert('Failed to upload document. Please try again.');
  }
};

const editDocument = (document: Document) => {
  editingDocument.value = document;
  editTags.value = document.tags?.join(', ') || '';
};

const saveEdit = async () => {
  if (!editingDocument.value) return;
  
  const tags = editTags.value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
  await updateDocument(editingDocument.value.id, { tags });
  
  cancelEdit();
};

const cancelEdit = () => {
  editingDocument.value = null;
  editTags.value = '';
};

const goHome = () => {
  // Navigate back to the main interface
  // This will work differently depending on whether we're in the extension popup or standalone mode
  if (window.standaloneUtils?.isStandalone) {
    // In standalone mode, close the standalone window
    window.standaloneUtils.closeStandalone();
  } else {
    // In extension popup, use the existing close mechanism
    // Emit the close event that the parent is listening for
    emit('close');
  }
};
</script>
