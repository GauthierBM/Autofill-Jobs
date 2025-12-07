<template>
    <div class="p-6 flex flex-col gap-6">
        <header class="flex justify-between items-center">
            <h1 class="text-xl font-semibold text-primary">Add Skill</h1>
        </header>

        <main class="flex flex-col gap-4">
            <div class="flex flex-col gap-1.5">
                <label for="skillName" class="text-sm font-medium text-muted-foreground">Skill</label>
                <input id="skillName" placeholder="JavaScript" v-model="inputValue" class="h-9 px-3 py-2 text-sm bg-transparent rounded-md border border-input ring-offset-background placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
            </div>

            <!-- Document Management Section -->
            <div class="flex flex-col gap-3">
                <label class="text-sm font-medium text-muted-foreground">Related Documents</label>
                <div class="flex gap-3">
                    <button 
                        @click="addCertificate"
                        class="flex-1 h-9 px-3 inline-flex items-center justify-center rounded-md text-sm font-medium border border-green-600 text-green-600 bg-transparent hover:bg-green-50 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="16px" fill="currentColor" class="mr-2">
                            <path d="M240-80q-33 0-56.5-23.5T160-160v-640q0-33 23.5-56.5T240-880h320l240 240v480q0 33-23.5 56.5T720-80H240Zm280-520v-200H240v640h480v-440H520ZM240-800v200-200 640-640Zm280 400v80h160v-80H520Zm-240 0v80h160v-80H280Zm0 160v80h400v-80H280Z"/>
                        </svg>
                        Add Certificate
                    </button>
                    <button 
                        @click="addSkillDocument"
                        class="flex-1 h-9 px-3 inline-flex items-center justify-center rounded-md text-sm font-medium border border-orange-600 text-orange-600 bg-transparent hover:bg-orange-50 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="16px" fill="currentColor" class="mr-2">
                            <path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z"/>
                        </svg>
                        Add Skill Doc
                    </button>
                </div>
                <p class="text-xs text-gray-500">
                    Upload certificates, portfolios, or documentation related to this skill
                </p>
            </div>
        </main>
        
        <footer class="flex justify-end gap-3 pt-2">
            <button @click="exit" class="h-9 px-4 inline-flex items-center justify-center rounded-md text-sm font-medium border border-border bg-transparent hover:bg-muted">Cancel</button>
            <button @click="saveData" class="h-9 px-4 inline-flex items-center justify-center rounded-md text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90">Save Skill</button>
        </footer>
        
        <!-- Hidden file inputs for document upload -->
        <input 
            ref="certificateInput"
            type="file"
            accept=".pdf,.doc,.docx"
            style="display: none"
            @change="handleCertificateFile"
            @cancel="handleFileCancel"
        />
        <input 
            ref="skillDocumentInput"
            type="file"
            accept=".pdf,.doc,.docx"
            style="display: none"
            @change="handleSkillDocumentFile"
            @cancel="handleFileCancel"
        />
    </div>
</template>

<script lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useResumeDetails } from '@/composables/ResumeDetails';
export default {
    emits: ['close'],
    setup(props, { emit }) {
        const { loadDetails } = useResumeDetails();
        const inputValue = ref('');
        const uploading = ref(false);
        const certificateInput = ref<HTMLInputElement | null>(null);
        const skillDocumentInput = ref<HTMLInputElement | null>(null);

        // Load draft data on mount
        onMounted(() => {
            if (chrome.storage) {
                chrome.storage.local.get('skill_draft', (data) => {
                    if (data['skill_draft']) {
                        inputValue.value = data['skill_draft'];
                    }
                });
            }
        });

        // Auto-save draft when input changes
        const saveDraft = () => {
            if (chrome.storage) {
                chrome.storage.local.set({ 'skill_draft': inputValue.value });
            }
        };

        watch(inputValue, saveDraft);

        // Listen for messages from background script
        const setupMessageListener = () => {
            if (typeof browser !== 'undefined' && browser.runtime) {
                browser.runtime.onMessage.addListener((message) => {
                    if (message.type === 'UPLOAD_SUCCESS') {
                        console.log('Upload successful:', message.data);
                        uploading.value = false;
                        alert(`${message.data.documentType} "${message.data.documentName}" has been uploaded successfully!`);
                    } else if (message.type === 'UPLOAD_CANCELLED') {
                        console.log('Upload cancelled');
                        uploading.value = false;
                    } else if (message.type === 'UPLOAD_ERROR') {
                        console.log('Upload error:', message.data);
                        uploading.value = false;
                        alert('Upload failed: ' + message.data.error);
                    }
                });
            } else if (typeof chrome !== 'undefined' && chrome.runtime) {
                chrome.runtime.onMessage.addListener((message) => {
                    if (message.type === 'UPLOAD_SUCCESS') {
                        console.log('Upload successful:', message.data);
                        uploading.value = false;
                        alert(`${message.data.documentType} "${message.data.documentName}" has been uploaded successfully!`);
                    } else if (message.type === 'UPLOAD_CANCELLED') {
                        console.log('Upload cancelled');
                        uploading.value = false;
                    } else if (message.type === 'UPLOAD_ERROR') {
                        console.log('Upload error:', message.data);
                        uploading.value = false;
                        alert('Upload failed: ' + message.data.error);
                    }
                });
            }
        };

        // Setup message listener on component mount
        setupMessageListener();

        const exit = () => {
            // Clear draft when canceling
            if (chrome.storage) {
                chrome.storage.local.remove('skill_draft');
            }
            emit('close');
        }

        const addCertificate = () => {
            uploading.value = true;
            
            const skillContext = inputValue.value.trim() || 'New Skill';
            console.log('Skill context:', skillContext);
            
            // Send upload request to background script
            const message = {
                type: 'UPLOAD_DOCUMENT',
                data: {
                    type: 'certificate',
                    context: skillContext
                }
            };
            
            if (typeof browser !== 'undefined' && browser.runtime) {
                console.log('Using browser API (Firefox)');
                browser.runtime.sendMessage(message).then((response) => {
                    console.log('Background script immediate response:', response);
                    if (!response.success) {
                        console.error('Failed to start upload:', response.error);
                        uploading.value = false;
                        alert('Failed to open file upload dialog: ' + response.error);
                    } else {
                        console.log('Upload request accepted:', response.message);
                        // Keep uploading state true, will be reset when upload completes or fails
                    }
                }).catch((error) => {
                    console.error('Error sending message to background script:', error);
                    uploading.value = false;
                    alert('Error: ' + error.message);
                });
            } else if (typeof chrome !== 'undefined' && chrome.runtime) {
                console.log('Using chrome API (Chrome)');
                chrome.runtime.sendMessage(message, (response) => {
                    console.log('Background script immediate response:', response);
                    if (!response.success) {
                        console.error('Failed to start upload:', response.error);
                        uploading.value = false;
                        alert('Failed to open file upload dialog: ' + response.error);
                    } else {
                        console.log('Upload request accepted:', response.message);
                        // Keep uploading state true, will be reset when upload completes or fails
                    }
                });
            } else {
                console.error('No runtime API available');
                uploading.value = false;
                alert('Extension runtime not available');
            }
        };

        const addSkillDocument = () => {
            uploading.value = true;
            
            const skillContext = inputValue.value.trim() || 'New Skill';
            console.log('Skill context:', skillContext);
            
            // Send upload request to background script
            const message = {
                type: 'UPLOAD_DOCUMENT',
                data: {
                    type: 'skill_document',
                    context: skillContext
                }
            };
            
            if (typeof browser !== 'undefined' && browser.runtime) {
                console.log('Using browser API (Firefox)');
                browser.runtime.sendMessage(message).then((response) => {
                    console.log('Background script immediate response:', response);
                    if (!response.success) {
                        console.error('Failed to start upload:', response.error);
                        uploading.value = false;
                        alert('Failed to open file upload dialog: ' + response.error);
                    } else {
                        console.log('Upload request accepted:', response.message);
                        // Keep uploading state true, will be reset when upload completes or fails
                    }
                }).catch((error) => {
                    console.error('Error sending message to background script:', error);
                    uploading.value = false;
                    alert('Error: ' + error.message);
                });
            } else if (typeof chrome !== 'undefined' && chrome.runtime) {
                console.log('Using chrome API (Chrome)');
                chrome.runtime.sendMessage(message, (response) => {
                    console.log('Background script immediate response:', response);
                    if (!response.success) {
                        console.error('Failed to start upload:', response.error);
                        uploading.value = false;
                        alert('Failed to open file upload dialog: ' + response.error);
                    } else {
                        console.log('Upload request accepted:', response.message);
                        // Keep uploading state true, will be reset when upload completes or fails
                    }
                });
            } else {
                console.error('No runtime API available');
                uploading.value = false;
                alert('Extension runtime not available');
            }
        };

        const handleCertificateFile = (event: Event) => {
            const target = event.target as HTMLInputElement;
            const file = target.files?.[0];
            if (file) {
                const skillContext = inputValue.value.trim() || 'New Skill';
                uploadDocument(file, 'certificate', skillContext);
            } else {
                uploading.value = false;
            }
        };

        const handleSkillDocumentFile = (event: Event) => {
            const target = event.target as HTMLInputElement;
            const file = target.files?.[0];
            if (file) {
                const skillContext = inputValue.value.trim() || 'New Skill';
                uploadDocument(file, 'skill_document', skillContext);
            } else {
                uploading.value = false;
            }
        };

        const handleFileCancel = () => {
            uploading.value = false;
        };

        const uploadDocument = async (file: File, type: 'certificate' | 'skill_document', context: string): Promise<void> => {
            try {
                const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
                if (!allowedTypes.includes(file.type)) {
                    alert('Please upload a PDF, DOC, or DOCX file');
                    uploading.value = false;
                    return;
                }
                
                if (file.size > 10 * 1024 * 1024) {
                    alert('File size must be less than 10MB');
                    uploading.value = false;
                    return;
                }

                const reader = new FileReader();
                reader.onload = async (e) => {
                    if (!e.target?.result) return;
                    const base64 = (e.target.result as string).split(',')[1];
                    
                    // Store in document manager using proper cross-browser API
                    let data: { [key: string]: any };
                    
                    if (typeof browser !== 'undefined' && browser.storage) {
                        // Use browser API (Promise-based)
                        data = await browser.storage.local.get('documents');
                    } else if (typeof chrome !== 'undefined' && chrome.storage) {
                        // Use Chrome API (callback-based)
                        data = await new Promise((resolve) => {
                            chrome.storage.local.get({ documents: true }, resolve);
                        });
                    } else {
                        throw new Error('No storage API available');
                    }
                    
                    const documents = data.documents || [];
                    
                    const newDocument = {
                        id: Date.now().toString(),
                        name: file.name,
                        type: type === 'certificate' ? 'other' : 'other', // Certificates stored as 'other' type
                        content: base64,
                        uploadDate: new Date().toISOString(),
                        size: file.size,
                        isActive: false,
                        tags: [context, type === 'certificate' ? 'certificate' : 'skill-document']
                    };
                    
                    documents.push(newDocument);
                    
                    // Save using proper cross-browser API
                    if (typeof browser !== 'undefined' && browser.storage) {
                        await browser.storage.local.set({ documents });
                    } else if (typeof chrome !== 'undefined' && chrome.storage) {
                        await new Promise<void>((resolve) => {
                            chrome.storage.local.set({ documents }, () => resolve());
                        });
                    }
                    
                    const documentType = type === 'certificate' ? 'Certificate' : 'Skill document';
                    alert(`${documentType} "${file.name}" has been uploaded and tagged with "${context}". You can manage it in the Document Manager.`);
                    
                    // Reset uploading state
                    uploading.value = false;
                };
                reader.readAsDataURL(file);
                
            } catch (error) {
                console.error('Failed to upload document:', error);
                alert('Failed to upload document. Please try again.');
                uploading.value = false;
            }
        };

        const saveData = () => {
            const newSkill = inputValue.value.trim();
            if (!chrome.storage || !newSkill) return;
            
            chrome.storage.local.get(['Resume_details'], (data) => {
                const resumeDetails = data['Resume_details'] || { skills: [], experiences: [] };
                
                const existingSkills = resumeDetails.skills || [];

                if (!existingSkills.includes(newSkill)) {
                    const updatedDetails = {
                        ...resumeDetails,
                        skills: [...existingSkills, newSkill]
                    };
                    
                    chrome.storage.local.set({ 'Resume_details': updatedDetails }, () => {
                        console.log(`'Resume_details' updated:`, updatedDetails);
                        // Clear draft when successfully saving
                        chrome.storage.local.remove('skill_draft');
                        loadDetails();
                        emit('close');
                    });
                } else {
                    emit('close'); // Skill already exists, just close
                }
            });
        }
        return {
            inputValue,
            exit, 
            saveData,
            addCertificate,
            addSkillDocument,
            uploading,
            certificateInput,
            skillDocumentInput,
            handleCertificateFile,
            handleSkillDocumentFile,
            handleFileCancel
        };
    },
};
</script>
