// Background script for handling file uploads - works even if popup closes

// Use browser API for Firefox, chrome API for Chrome
const runtime = typeof browser !== 'undefined' ? browser : chrome;
const storage = typeof browser !== 'undefined' ? browser.storage : chrome.storage;
const tabs = typeof browser !== 'undefined' ? browser.tabs : chrome.tabs;

// Log browser detection
console.log('Background script loading...');
console.log('Browser detected:', typeof browser !== 'undefined' ? 'Firefox (browser API)' : 'Chrome (chrome API)');

// Store active upload requests
const activeUploads = new Map();

runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background received message:', request);

  if (request.type === 'UPLOAD_DOCUMENT') {
    // Start upload immediately, don't wait for popup
    handleDocumentUpload(request.data, sendResponse);
    return true;
  }

  return true;
});

// Handle document upload - completely independent of popup
async function handleDocumentUpload(data, sendResponse) {
  const uploadId = Date.now().toString();
  
  try {
    console.log('Starting upload process:', { uploadId, data });
    
    // Store upload request in persistent storage (not session)
    await storage.local.set({
      [`upload_${uploadId}`]: {
        id: uploadId,
        data: data,
        status: 'starting',
        timestamp: Date.now()
      }
    });
    
    // Create upload tab immediately
    const tab = await tabs.create({
      url: `${runtime.getURL('file-upload.html')}?uploadId=${uploadId}`,
      active: true
    });

    console.log('Created upload tab:', tab.id, 'for upload:', uploadId);

    // Update upload status with tab info
    await storage.local.set({
      [`upload_${uploadId}`]: {
        id: uploadId,
        data: data,
        status: 'tab_created',
        tabId: tab.id,
        timestamp: Date.now()
      }
    });

    // Track active upload
    activeUploads.set(uploadId, {
      tabId: tab.id,
      data: data,
      startTime: Date.now()
    });

    // Listen for tab completion
    tabs.onUpdated.addListener(function listener(tabId, changeInfo, updatedTab) {
      if (tabId === tab.id && changeInfo.status === 'complete') {
        tabs.onUpdated.removeListener(listener);
        console.log('Upload tab loaded:', tabId);
        
        // Send initialization message to tab
        setTimeout(() => {
          tabs.sendMessage(tabId, {
            type: 'INIT_UPLOAD',
            uploadId: uploadId,
            data: data
          }).catch(error => {
            console.error('Failed to initialize upload tab:', error);
          });
        }, 200);
      }
    });

    // Respond immediately - popup can close now
    sendResponse({ 
      success: true, 
      uploadId: uploadId,
      message: 'Upload started in new tab'
    });

  } catch (error) {
    console.error('Failed to start upload:', error);
    
    // Clean up on error
    await storage.local.remove(`upload_${uploadId}`);
    activeUploads.delete(uploadId);
    
    sendResponse({ 
      success: false, 
      error: error.message 
    });
  }
}

// Listen for messages from upload tabs
runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Received message from upload tab:', request);
  
  if (request.type === 'UPLOAD_COMPLETE') {
    handleUploadComplete(request.data, sendResponse);
    return true;
  } else if (request.type === 'UPLOAD_CANCELLED') {
    handleUploadCancelled(request.data, sendResponse);
    return true;
  } else if (request.type === 'UPLOAD_TAB_READY') {
    handleUploadTabReady(request.data, sendResponse);
    return true;
  }
  
  return true;
});

// Handle upload tab ready confirmation
async function handleUploadTabReady(data, sendResponse) {
  try {
    console.log('Upload tab is ready:', data.uploadId);
    
    // Update upload status
    await storage.local.set({
      [`upload_${data.uploadId}`]: {
        ...await storage.local.get(`upload_${data.uploadId}`),
        status: 'ready',
        tabReady: true
      }
    });
    
    sendResponse({ success: true });
  } catch (error) {
    console.error('Failed to handle upload tab ready:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// Handle successful upload
async function handleUploadComplete(data, sendResponse) {
  try {
    console.log('Upload completed:', data);
    
    // Store the document
    await storeDocument(data.document);
    
    // Update upload status
    if (data.uploadId) {
      await storage.local.set({
        [`upload_${data.uploadId}`]: {
          ...await storage.local.get(`upload_${data.uploadId}`),
          status: 'completed',
          document: data.document,
          completedAt: Date.now()
        }
      });
      
      // Clean up active upload
      activeUploads.delete(data.uploadId);
    }
    
    // Close upload tab
    if (data.tabId) {
      await tabs.remove(data.tabId);
    }
    
    // Try to notify popup (may be closed, that's ok)
    try {
      runtime.sendMessage({
        type: 'UPLOAD_SUCCESS',
        data: {
          documentName: data.document.name,
          documentType: data.document.type
        }
      });
    } catch (notifyError) {
      console.log('Popup was closed, upload still succeeded');
    }

    sendResponse({ success: true });

  } catch (error) {
    console.error('Failed to complete upload:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// Handle cancelled upload
async function handleUploadCancelled(data, sendResponse) {
  try {
    console.log('Upload cancelled:', data);
    
    // Update upload status
    if (data.uploadId) {
      await storage.local.set({
        [`upload_${data.uploadId}`]: {
          ...await storage.local.get(`upload_${data.uploadId}`),
          status: 'cancelled',
          cancelledAt: Date.now()
        }
      });
      
      // Clean up active upload
      activeUploads.delete(data.uploadId);
    }
    
    // Close upload tab
    if (data.tabId) {
      await tabs.remove(data.tabId);
    }
    
    // Try to notify popup (may be closed, that's ok)
    try {
      runtime.sendMessage({
        type: 'UPLOAD_CANCELLED'
      });
    } catch (notifyError) {
      console.log('Popup was closed, upload was cancelled');
    }

    sendResponse({ success: true });

  } catch (error) {
    console.error('Failed to handle cancelled upload:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// Store document in storage
async function storeDocument(document) {
  try {
    // Create a plain copy of the document
    const plainDocument = JSON.parse(JSON.stringify(document));
    
    // Get existing documents
    const storageData = await new Promise((resolve) => {
      if (typeof browser !== 'undefined') {
        storage.local.get('documents').then(resolve);
      } else {
        storage.local.get('documents', (result) => {
          resolve(result);
        });
      }
    });
    
    const documents = storageData.documents || [];
    documents.push(plainDocument);
    
    // Save updated documents
    if (typeof browser !== 'undefined') {
      await storage.local.set({ documents });
    } else {
      await new Promise((resolve) => {
        storage.local.set({ documents }, () => {
          resolve();
        });
      });
    }
    
    console.log('Document stored successfully:', plainDocument.name);
  } catch (error) {
    console.error('Failed to store document:', error);
    throw error;
  }
}

// Cleanup old uploads on startup
async function cleanupOldUploads() {
  try {
    const allData = await new Promise((resolve) => {
      if (typeof browser !== 'undefined') {
        storage.local.get(null).then(resolve);
      } else {
        storage.local.get(null, (result) => {
          resolve(result);
        });
      }
    });
    
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    
    for (const [key, value] of Object.entries(allData)) {
      if (key.startsWith('upload_') && value.timestamp) {
        if (now - value.timestamp > oneHour) {
          await storage.local.remove(key);
          console.log('Cleaned up old upload:', key);
        }
      }
    }
  } catch (error) {
    console.error('Failed to cleanup old uploads:', error);
  }
}

// Initialize
cleanupOldUploads();
console.log('Background script loaded successfully - uploads work independently of popup');
