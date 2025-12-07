let uploadRequest = null;
let selectedFile = null;
let uploadId = null;

// Use browser API for Firefox, chrome API for Chrome
const runtime = typeof browser !== 'undefined' ? browser : chrome;
const storage = typeof browser !== 'undefined' ? browser.storage : chrome.storage;

// Initialize the upload page
async function initialize() {
    try {
        // Get uploadId from URL parameter
        const urlParams = new URLSearchParams(window.location.search);
        uploadId = urlParams.get('uploadId');
        
        if (!uploadId) {
            showError('No upload ID found');
            return;
        }
        
        console.log('Upload page initializing with uploadId:', uploadId);
        
        // Get upload request from persistent storage
        const data = await storage.local.get(`upload_${uploadId}`);
        uploadRequest = data[`upload_${uploadId}`];
        
        if (!uploadRequest) {
            showError('Upload request not found');
            return;
        }
        
        console.log('Loaded upload request:', uploadRequest);
        
        // Update description with context
        const description = document.getElementById('description');
        description.textContent = `Upload a ${uploadRequest.data.type.replace('_', ' ')} for: ${uploadRequest.data.context}`;
        
        // Setup file input listener
        const fileInput = document.getElementById('fileInput');
        fileInput.addEventListener('change', handleFileSelect);
        
        // Notify background script that tab is ready
        await runtime.sendMessage({
            type: 'UPLOAD_TAB_READY',
            uploadId: uploadId
        });
        
        console.log('Upload page initialized successfully');
        
    } catch (error) {
        console.error('Failed to initialize upload page:', error);
        showError('Failed to initialize upload page: ' + error.message);
    }
}

// Handle file selection
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) {
        return;
    }
    
    selectedFile = file;
    
    // Validate file
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
        showError('Please upload a PDF, DOC, or DOCX file');
        return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
        showError('File size must be less than 10MB');
        return;
    }
    
    // Show file info
    const fileInfo = document.getElementById('fileInfo');
    const fileName = document.getElementById('fileName');
    const fileSize = document.getElementById('fileSize');
    
    fileName.textContent = file.name;
    fileSize.textContent = formatFileSize(file.size);
    fileInfo.style.display = 'block';
    
    // Start upload
    uploadFile(file);
}

// Upload file
async function uploadFile(file) {
    try {
        showUploading();
        
        // Read file as base64
        const base64 = await readFileAsBase64(file);
        
        // Create document object
        const document = {
            id: Date.now().toString(),
            name: file.name,
            type: uploadRequest.data.type === 'certificate' ? 'other' : uploadRequest.data.type,
            content: base64,
            uploadDate: new Date().toISOString(),
            size: file.size,
            isActive: false,
            tags: [uploadRequest.data.context, uploadRequest.data.type]
        };
        
        console.log('Uploading document:', document.name);
        
        // Send upload complete message to background script
        await runtime.sendMessage({
            type: 'UPLOAD_COMPLETE',
            data: {
                document: document,
                uploadId: uploadId,
                tabId: uploadRequest.tabId
            }
        });
        
        showSuccess('Document uploaded successfully!');
        
        // Close tab after delay
        setTimeout(() => {
            window.close();
        }, 2000);
        
    } catch (error) {
        console.error('Upload failed:', error);
        showError('Upload failed: ' + error.message);
    }
}

// Cancel upload
async function cancelUpload() {
    try {
        if (uploadId) {
            await runtime.sendMessage({
                type: 'UPLOAD_CANCELLED',
                data: {
                    uploadId: uploadId,
                    tabId: uploadRequest.tabId
                }
            });
        }
        window.close();
    } catch (error) {
        console.error('Failed to cancel upload:', error);
        window.close();
    }
}

// Read file as base64
function readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const base64 = e.target.result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// UI helpers
function showUploading() {
    document.getElementById('uploading').style.display = 'block';
    animateProgress();
}

function animateProgress() {
    let progress = 0;
    const progressFill = document.getElementById('progressFill');
    
    const interval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress > 90) progress = 90;
        progressFill.style.width = progress + '%';
        
        if (progress >= 90) {
            clearInterval(interval);
        }
    }, 200);
}

function showError(message) {
    const messageEl = document.getElementById('message');
    
    // Clear existing content
    while (messageEl.firstChild) {
        messageEl.removeChild(messageEl.firstChild);
    }
    
    // Create error element safely
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error';
    errorDiv.textContent = message;
    messageEl.appendChild(errorDiv);
}

function showSuccess(message) {
    const messageEl = document.getElementById('message');
    
    // Clear existing content
    while (messageEl.firstChild) {
        messageEl.removeChild(messageEl.firstChild);
    }
    
    // Create success element safely
    const successDiv = document.createElement('div');
    successDiv.className = 'success';
    successDiv.textContent = message;
    messageEl.appendChild(successDiv);
}

// Listen for messages from background script
runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'INIT_UPLOAD') {
        console.log('Received init upload message:', request);
    }
});

// Initialize when page loads
document.addEventListener('DOMContentLoaded', initialize);
