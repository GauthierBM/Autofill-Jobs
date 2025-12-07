<template>
    <div class="p-6 flex flex-col gap-6">
        <header class="flex justify-between items-center">
            <h1 class="text-xl font-semibold text-primary">{{ pageTitle }}</h1>
        </header>

        <main class="flex flex-col gap-4">
            <div class="flex flex-col gap-1.5">
                <label for="jobTitle" class="text-sm font-medium text-muted-foreground">Job Title</label>
                <input id="jobTitle" placeholder="Software Engineer I" v-model="jobTitle" class="h-9 px-3 py-2 text-sm bg-transparent rounded-md border border-input ring-offset-background placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" />
            </div>

            <div class="flex flex-col gap-1.5">
                <label for="jobEmployer" class="text-sm font-medium text-muted-foreground">Job Employer</label>
                <input id="jobEmployer" placeholder="Google" v-model="jobEmployer" class="h-9 px-3 py-2 text-sm bg-transparent rounded-md border border-input ring-offset-background placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" />
            </div>

            <div class="grid grid-cols-2 gap-4">
                <div class="flex flex-col gap-1.5">
                    <label for="startMonth" class="text-sm font-medium text-muted-foreground">Start Month</label>
                    <select id="startMonth" v-model="startMonth" class="h-9 px-3 py-2 text-sm bg-transparent rounded-md border border-input ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                         <option value="" disabled>Select Month</option>
                         <option v-for="option in months" :key="option" :value="option">{{ option }}</option>
                    </select>
                </div>
                <div class="flex flex-col gap-1.5">
                    <label for="startYear" class="text-sm font-medium text-muted-foreground">Start Year</label>
                    <input id="startYear" placeholder="2024" v-model="startYear" class="h-9 px-3 py-2 text-sm bg-transparent rounded-md border border-input ring-offset-background placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" />
                </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
                 <div class="flex flex-col gap-1.5">
                    <label for="endMonth" class="text-sm font-medium text-muted-foreground">End Month</label>
                    <select id="endMonth" v-model="endMonth" class="h-9 px-3 py-2 text-sm bg-transparent rounded-md border border-input ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                        <option value="" disabled>Select Month</option>
                        <option v-for="option in months" :key="option" :value="option">{{ option }}</option>
                    </select>
                </div>
                <div class="flex flex-col gap-1.5">
                    <label for="endYear" class="text-sm font-medium text-muted-foreground">End Year</label>
                    <input id="endYear" placeholder="Present" v-model="endYear" class="h-9 px-3 py-2 text-sm bg-transparent rounded-md border border-input ring-offset-background placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" />
                </div>
            </div>
            
            <div class="flex flex-col gap-1.5">
                <label for="roleDescription" class="text-sm font-medium text-muted-foreground">Description</label>
                <textarea id="roleDescription" placeholder="• Spearheaded the development of a new feature..." v-model="roleDescription" rows="5" class="p-3 text-sm bg-transparent rounded-md border border-input ring-offset-background placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none" />
            </div>

            <!-- Document Management Section -->
            <div class="flex flex-col gap-3">
                <label class="text-sm font-medium text-muted-foreground">Related Documents</label>
                <div class="flex gap-3">
                    <button 
                        @click="addCoverLetter"
                        class="flex-1 h-9 px-3 inline-flex items-center justify-center rounded-md text-sm font-medium border border-blue-600 text-blue-600 bg-transparent hover:bg-blue-50 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="16px" fill="currentColor" class="mr-2">
                            <path d="M320-240h320v-80H320v80Zm0-160h320v-80H320v80ZM240-80q-33 0-56.5-23.5T160-160v-640q0-33 23.5-56.5T240-880h320l240 240v480q0 33-23.5 56.5T720-80H240Zm280-520v-200H240v640h480v-440H520ZM240-800v200-200 640-640Z"/>
                        </svg>
                        Add Cover Letter
                    </button>
                    <button 
                        @click="addOtherDocument"
                        class="flex-1 h-9 px-3 inline-flex items-center justify-center rounded-md text-sm font-medium border border-purple-600 text-purple-600 bg-transparent hover:bg-purple-50 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="16px" fill="currentColor" class="mr-2">
                            <path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z"/>
                        </svg>
                        Add Other Document
                    </button>
                </div>
                <p class="text-xs text-gray-500">
                    Upload cover letters or additional documents related to this work experience
                </p>
            </div>
        </main>

        <footer class="flex justify-end gap-3 pt-2">
            <button @click="exit" class="h-9 px-4 inline-flex items-center justify-center rounded-md text-sm font-medium border border-border bg-transparent hover:bg-muted">Cancel</button>
            <button @click="saveData" class="h-9 px-4 inline-flex items-center justify-center rounded-md text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90">{{ saveButtonText }}</button>
        </footer>
        
        <!-- Hidden file inputs for document upload -->
        <input 
            ref="coverLetterInput"
            type="file"
            accept=".pdf,.doc,.docx"
            style="display: none"
            @change="handleCoverLetterFile"
            @cancel="handleFileCancel"
        />
        <input 
            ref="otherDocumentInput"
            type="file"
            accept=".pdf,.doc,.docx"
            style="display: none"
            @change="handleOtherDocumentFile"
            @cancel="handleFileCancel"
        />
    </div>
</template>

<script lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useResumeDetails } from '@/composables/ResumeDetails';
export default {
    props: {
        experienceIndex: {
            type: [Number, null],
            default: null,
        },
    },
    emits: ['close'],
    setup(props, { emit }) {
        const { loadDetails } = useResumeDetails();
        const isEditing = computed(() => props.experienceIndex !== null);
        const pageTitle = computed(() => isEditing.value ? 'Edit Work Experience' : 'Add Work Experience');
        const saveButtonText = computed(() => isEditing.value ? 'Save Changes' : 'Save Experience');

        const jobTitle = ref('');
        const jobEmployer = ref('');
        const startMonth = ref('');
        const startYear = ref('');
        const endMonth = ref('');
        const endYear = ref('');
        const roleDescription = ref('');
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June', 'July',
            'August', 'September', 'October', 'November', 'December'
        ];

        const loadExperienceData = () => {
            if (isEditing.value && props.experienceIndex !== null && typeof props.experienceIndex === 'number') {
                chrome.storage.local.get('Resume_details', (data) => {
                    const resumeDetails = data['Resume_details'];
                    if (resumeDetails && resumeDetails.experiences && resumeDetails.experiences[props.experienceIndex!]) {
                        const exp = resumeDetails.experiences[props.experienceIndex!];
                        jobTitle.value = exp.jobTitle || '';
                        jobEmployer.value = exp.jobEmployer || '';
                        roleDescription.value = exp.roleBulletsString || '';

                        const duration = exp.jobDuration || '';
                        const [start, end] = duration.split(' - ');

                        if (start) {
                            const startParts = start.trim().match(/^(\w+)\s(\d{4})$/);
                            if(startParts) {
                                startMonth.value = startParts[1] || '';
                                startYear.value = startParts[2] || '';
                            }
                        }
                        if (end) {
                            const endParts = end.trim().match(/^(\w+)\s([\d{4}]+|present|current)$/i);
                             if(endParts) {
                                endMonth.value = endParts[1] || '';
                                endYear.value = endParts[2] || '';
                            }
                        }
                    }
                });
            } else {
                // Check for draft data when creating new experience
                chrome.storage.local.get('work_experience_draft', (data) => {
                    const draft = data['work_experience_draft'];
                    if (draft) {
                        jobTitle.value = draft.jobTitle || '';
                        jobEmployer.value = draft.jobEmployer || '';
                        startMonth.value = draft.startMonth || '';
                        startYear.value = draft.startYear || '';
                        endMonth.value = draft.endMonth || '';
                        endYear.value = draft.endYear || '';
                        roleDescription.value = draft.roleDescription || '';
                    } else {
                        // Clear form when no draft exists
                        jobTitle.value = '';
                        jobEmployer.value = '';
                        startMonth.value = '';
                        startYear.value = '';
                        endMonth.value = '';
                        endYear.value = '';
                        roleDescription.value = '';
                    }
                });
            }
        };

        // Watch for changes in experienceIndex
        watch(() => props.experienceIndex, loadExperienceData, { immediate: true });

        // Auto-save draft when form data changes (only for new experiences)
        const saveDraft = () => {
            if (!isEditing.value && chrome.storage) {
                const draft = {
                    jobTitle: jobTitle.value,
                    jobEmployer: jobEmployer.value,
                    startMonth: startMonth.value,
                    startYear: startYear.value,
                    endMonth: endMonth.value,
                    endYear: endYear.value,
                    roleDescription: roleDescription.value
                };
                chrome.storage.local.set({ 'work_experience_draft': draft });
            }
        };

        // Watch all form fields for changes and auto-save
        watch([jobTitle, jobEmployer, startMonth, startYear, endMonth, endYear, roleDescription], saveDraft);

        // No message listener needed - upload works independently of popup

        const exit = () => {
            // Clear draft when canceling
            if (!isEditing.value && chrome.storage) {
                chrome.storage.local.remove('work_experience_draft');
            }
            emit('close');
        }

        const uploading = ref(false);
        const coverLetterInput = ref<HTMLInputElement | null>(null);
        const otherDocumentInput = ref<HTMLInputElement | null>(null);

        const addCoverLetter = () => {
            console.log('Add Cover Letter button clicked - starting upload');
            uploading.value = true;
            
            const experienceContext = `${jobEmployer.value} - ${jobTitle.value}`.trim() || 'New Experience';
            console.log('Experience context:', experienceContext);
            
            // Send upload request to background script - it will handle everything
            const message = {
                type: 'UPLOAD_DOCUMENT',
                data: {
                    type: 'cover_letter',
                    context: experienceContext
                }
            };
            
            if (typeof browser !== 'undefined' && browser.runtime) {
                console.log('Using browser API (Firefox)');
                browser.runtime.sendMessage(message).then((response) => {
                    console.log('Background script response:', response);
                    if (response.success) {
                        console.log('Upload started successfully, popup can close now');
                        // Reset uploading state after a short delay
                        setTimeout(() => {
                            uploading.value = false;
                        }, 2000);
                    } else {
                        console.error('Failed to start upload:', response.error);
                        uploading.value = false;
                        alert('Failed to start upload: ' + response.error);
                    }
                }).catch((error) => {
                    console.error('Error sending message to background script:', error);
                    uploading.value = false;
                    alert('Error: ' + error.message);
                });
            } else if (typeof chrome !== 'undefined' && chrome.runtime) {
                console.log('Using chrome API (Chrome)');
                chrome.runtime.sendMessage(message, (response) => {
                    console.log('Background script response:', response);
                    if (response.success) {
                        console.log('Upload started successfully, popup can close now');
                        // Reset uploading state after a short delay
                        setTimeout(() => {
                            uploading.value = false;
                        }, 2000);
                    } else {
                        console.error('Failed to start upload:', response.error);
                        uploading.value = false;
                        alert('Failed to start upload: ' + response.error);
                    }
                });
            } else {
                console.error('No runtime API available');
                uploading.value = false;
                alert('Extension runtime not available');
            }
        };

        const addOtherDocument = () => {
            console.log('Add Other Document button clicked - starting upload');
            uploading.value = true;
            
            const experienceContext = `${jobEmployer.value} - ${jobTitle.value}`.trim() || 'New Experience';
            console.log('Experience context:', experienceContext);
            
            // Send upload request to background script - it will handle everything
            const message = {
                type: 'UPLOAD_DOCUMENT',
                data: {
                    type: 'other',
                    context: experienceContext
                }
            };
            
            if (typeof browser !== 'undefined' && browser.runtime) {
                console.log('Using browser API (Firefox)');
                browser.runtime.sendMessage(message).then((response) => {
                    console.log('Background script response:', response);
                    if (response.success) {
                        console.log('Upload started successfully, popup can close now');
                        // Reset uploading state after a short delay
                        setTimeout(() => {
                            uploading.value = false;
                        }, 2000);
                    } else {
                        console.error('Failed to start upload:', response.error);
                        uploading.value = false;
                        alert('Failed to start upload: ' + response.error);
                    }
                }).catch((error) => {
                    console.error('Error sending message to background script:', error);
                    uploading.value = false;
                    alert('Error: ' + error.message);
                });
            } else if (typeof chrome !== 'undefined' && chrome.runtime) {
                console.log('Using chrome API (Chrome)');
                chrome.runtime.sendMessage(message, (response) => {
                    console.log('Background script response:', response);
                    if (response.success) {
                        console.log('Upload started successfully, popup can close now');
                        // Reset uploading state after a short delay
                        setTimeout(() => {
                            uploading.value = false;
                        }, 2000);
                    } else {
                        console.error('Failed to start upload:', response.error);
                        uploading.value = false;
                        alert('Failed to start upload: ' + response.error);
                    }
                });
            } else {
                console.error('No runtime API available');
                uploading.value = false;
                alert('Extension runtime not available');
            }
        };

        const handleCoverLetterFile = (event: Event) => {
            console.log('Cover letter file input change event triggered');
            const target = event.target as HTMLInputElement;
            const file = target.files?.[0];
            if (file) {
                console.log('File selected:', file.name, file.type, file.size);
                const experienceContext = `${jobEmployer.value} - ${jobTitle.value}`.trim() || 'New Experience';
                console.log('Experience context:', experienceContext);
                uploadDocument(file, 'cover_letter', experienceContext);
            } else {
                console.log('No file selected');
                uploading.value = false;
            }
        };

        const handleOtherDocumentFile = (event: Event) => {
            console.log('Other document file input change event triggered');
            const target = event.target as HTMLInputElement;
            const file = target.files?.[0];
            if (file) {
                console.log('File selected:', file.name, file.type, file.size);
                const experienceContext = `${jobEmployer.value} - ${jobTitle.value}`.trim() || 'New Experience';
                console.log('Experience context:', experienceContext);
                uploadDocument(file, 'other', experienceContext);
            } else {
                console.log('No file selected');
                uploading.value = false;
            }
        };

        const handleFileCancel = () => {
            console.log('File selection cancelled');
            uploading.value = false;
        };

        const uploadDocument = async (file: File, type: 'cover_letter' | 'other', context: string): Promise<void> => {
            console.log('Starting document upload:', { fileName: file.name, type, context });
            try {
                // Validate file
                const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
                if (!allowedTypes.includes(file.type)) {
                    console.log('File type validation failed:', file.type);
                    alert('Please upload a PDF, DOC, or DOCX file');
                    return;
                }
                
                if (file.size > 10 * 1024 * 1024) {
                    console.log('File size validation failed:', file.size);
                    alert('File size must be less than 10MB');
                    return;
                }

                console.log('File validation passed, starting file read');
                // Read file as base64
                const reader = new FileReader();
                reader.onload = async (e) => {
                    if (!e.target?.result) {
                        console.log('File read failed - no result');
                        return;
                    }
                    const base64 = (e.target.result as string).split(',')[1];
                    console.log('File read successfully, base64 length:', base64.length);
                    
                    // Store in document manager using proper cross-browser API
                    let data: { [key: string]: any };
                    
                    console.log('Checking storage APIs...');
                    if (typeof browser !== 'undefined' && browser.storage) {
                        console.log('Using browser API');
                        // Use browser API (Promise-based)
                        data = await browser.storage.local.get('documents');
                    } else if (typeof chrome !== 'undefined' && chrome.storage) {
                        console.log('Using Chrome API');
                        // Use Chrome API (callback-based)
                        data = await new Promise((resolve) => {
                            chrome.storage.local.get({ documents: true }, resolve);
                        });
                    } else {
                        console.log('No storage API available');
                        throw new Error('No storage API available');
                    }
                    
                    console.log('Retrieved existing documents:', data.documents?.length || 0);
                    const documents = data.documents || [];
                    
                    // Create new document with experience context
                    const newDocument = {
                        id: Date.now().toString(),
                        name: file.name,
                        type: type,
                        content: base64,
                        uploadDate: new Date().toISOString(),
                        size: file.size,
                        isActive: false,
                        tags: [context, type === 'cover_letter' ? 'cover-letter' : 'other-document']
                    };
                    
                    console.log('Created new document:', newDocument);
                    
                    // Add to documents
                    documents.push(newDocument);
                    console.log('Documents count after adding:', documents.length);
                    
                    // Save using proper cross-browser API
                    if (typeof browser !== 'undefined' && browser.storage) {
                        console.log('Saving with browser API');
                        await browser.storage.local.set({ documents });
                    } else if (typeof chrome !== 'undefined' && chrome.storage) {
                        console.log('Saving with Chrome API');
                        await new Promise<void>((resolve) => {
                            chrome.storage.local.set({ documents }, () => resolve());
                        });
                    }
                    
                    console.log('Document saved successfully');
                    // Show success message
                    const documentType = type === 'cover_letter' ? 'Cover letter' : 'Document';
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
            const experience = {
                "jobTitle": jobTitle.value.trim(),
                "jobEmployer": jobEmployer.value.trim(),
                "jobDuration": `${startMonth.value} ${startYear.value.trim()} - ${endMonth.value} ${endYear.value.trim()}`,
                "isCurrentEmployer": (endYear.value.toLowerCase().includes('present') || endYear.value.toLowerCase().includes('current')),
                "roleBulletsString": roleDescription.value.trim()
            };

            if (!chrome.storage || !experience.jobTitle || !experience.jobEmployer) {
                return; // Basic validation
            };

            chrome.storage.local.get(['Resume_details'], (data) => {
                const resumeDetails = data['Resume_details'] || { skills: [], experiences: [] };
                let experiences = Array.isArray(resumeDetails.experiences) ? [...resumeDetails.experiences] : [];

                if (isEditing.value && typeof props.experienceIndex === 'number' && experiences[props.experienceIndex] !== undefined) {
                    experiences[props.experienceIndex] = experience;
                } else {
                    experiences = experiences.filter((exp: any) => exp && exp.jobTitle);
                    experiences.push(experience);
                }

                const updatedDetails = { ...resumeDetails, experiences };

                chrome.storage.local.set({ 'Resume_details': updatedDetails }, () => {
                    console.log(`'Resume_details' updated:`, updatedDetails);
                    // Clear draft when successfully saving
                    if (!isEditing.value) {
                        chrome.storage.local.remove('work_experience_draft');
                    }
                    loadDetails();
                    emit('close');
                });
            });
        }
        return {
            jobTitle, jobEmployer, startMonth, startYear,
            endMonth, endYear, roleDescription, months,
            exit, saveData, pageTitle, saveButtonText,
            addCoverLetter, addOtherDocument, uploading,
            coverLetterInput, otherDocumentInput,
            handleCoverLetterFile, handleOtherDocumentFile, handleFileCancel
        };
    },
};
</script>
