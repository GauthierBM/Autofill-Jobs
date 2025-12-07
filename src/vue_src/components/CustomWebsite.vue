<template>
  <div class="p-4 bg-white rounded-lg shadow">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold">Add Custom Website</h3>
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
    
    <!-- Website URL Input -->
    <div class="mb-4">
      <label class="block text-sm font-medium text-gray-700 mb-2">Website URL</label>
      <input
        v-model="websiteUrl"
        type="url"
        placeholder="https://example.com/jobs"
        class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>

    <!-- Instructions -->
    <div class="mb-4 p-3 bg-blue-50 rounded-md">
      <p class="text-sm text-blue-800">
        <strong>How to add custom inputs:</strong><br>
        1. Enter the website URL above<br>
        2. Click "Start Input Detection"<br>
        3. Go to the website and click on any input field you want to configure<br>
        4. Define what question that input answers<br>
        5. Save your configuration
      </p>
    </div>

    <!-- Detection Controls -->
    <div class="mb-4">
      <button
        v-if="!isDetecting"
        @click="startDetection"
        class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 mr-2"
      >
        Start Input Detection
      </button>
      <button
        v-else
        @click="stopDetection"
        class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 mr-2"
      >
        Stop Detection
      </button>
      
      <button
        v-if="detectedInputs.length > 0"
        @click="saveConfiguration"
        class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        Save Configuration
      </button>
    </div>

    <!-- Detected Inputs List -->
    <div v-if="detectedInputs.length > 0" class="space-y-3">
      <h4 class="text-md font-medium text-gray-700">Detected Inputs ({{ detectedInputs.length }})</h4>
      
      <div
        v-for="(input, index) in detectedInputs"
        :key="input.id"
        class="p-3 border border-gray-200 rounded-md"
      >
        <div class="flex justify-between items-start mb-2">
          <div class="flex-1">
            <p class="text-sm font-medium text-gray-900">{{ input.label || input.name || input.type }}</p>
            <p class="text-xs text-gray-500">
              Type: {{ input.type }} | Name: {{ input.name || 'N/A' }} | ID: {{ input.id || 'N/A' }}
            </p>
            <p class="text-xs text-gray-400">Selector: {{ input.selector }}</p>
          </div>
          <button
            @click="removeInput(index)"
            class="text-red-600 hover:text-red-800 text-sm"
          >
            Remove
          </button>
        </div>
        
        <div class="mt-2">
          <label class="block text-xs font-medium text-gray-700 mb-1">
            What question does this input answer?
          </label>
          <select
            v-model="input.questionKey"
            class="w-full p-1 text-sm border border-gray-300 rounded"
          >
            <option value="">Select a question...</option>
            <option value="Full Name">Full Name</option>
            <option value="First Name">First Name</option>
            <option value="Last Name">Last Name</option>
            <option value="Email">Email</option>
            <option value="Phone">Phone</option>
            <option value="Location (City)">Location (City)</option>
            <option value="LinkedIn">LinkedIn</option>
            <option value="Github">Github</option>
            <option value="Website">Website</option>
            <option value="Current Employer">Current Employer</option>
            <option value="Resume">Resume</option>
            <option value="School">School</option>
            <option value="Degree">Degree</option>
            <option value="Discipline">Discipline</option>
            <option value="Start Date Month">Start Date Month</option>
            <option value="Start Date Year">Start Date Year</option>
            <option value="End Date Month">End Date Month</option>
            <option value="End Date Year">End Date Year</option>
            <option value="custom">Custom Question</option>
          </select>
          
          <input
            v-if="input.questionKey === 'custom'"
            v-model="input.customQuestion"
            type="text"
            placeholder="Enter custom question text"
            class="w-full mt-2 p-1 text-sm border border-gray-300 rounded"
          />
        </div>
      </div>
    </div>

    <!-- Saved Configurations -->
    <div v-if="savedConfigurations.length > 0" class="mt-6">
      <h4 class="text-md font-medium text-gray-700 mb-3">Saved Configurations</h4>
      <div class="space-y-2">
        <div
          v-for="config in savedConfigurations"
          :key="config.id"
          class="p-3 border border-gray-200 rounded-md flex justify-between items-center"
        >
          <div>
            <p class="text-sm font-medium text-gray-900">{{ config.domain }}</p>
            <p class="text-xs text-gray-500">{{ config.inputs.length }} inputs configured</p>
          </div>
          <button
            @click="deleteConfiguration(config.id)"
            class="text-red-600 hover:text-red-800 text-sm"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

// Define emits
const emit = defineEmits(['close']);

interface DetectedInput {
  id: string;
  selector: string;
  label: string;
  name: string;
  type: string;
  questionKey: string;
  customQuestion: string;
}

interface SavedConfiguration {
  id: string;
  domain: string;
  url: string;
  inputs: DetectedInput[];
}

const websiteUrl = ref('');
const isDetecting = ref(false);
const detectedInputs = ref<DetectedInput[]>([]);
const savedConfigurations = ref<SavedConfiguration[]>([]);

let messageListener: ((event: MessageEvent) => void) | null = null;

const startDetection = async () => {
  if (!websiteUrl.value) {
    alert('Please enter a website URL first');
    return;
  }

  try {
    const [tab] = await (typeof browser !== 'undefined' ? browser.tabs : chrome.tabs).query({ active: true, currentWindow: true });
    
    if (!tab.url?.includes(new URL(websiteUrl.value).hostname)) {
      alert('Please navigate to the website you want to configure before starting detection');
      return;
    }

    isDetecting.value = true;
    detectedInputs.value = [];

    // Inject content script for input detection
    await (typeof browser !== 'undefined' ? browser.scripting : chrome.scripting).executeScript({
      target: { tabId: tab.id! },
      files: ['contentScripts/inputDetector.js']
    });

    // Send message to start detection
    await (typeof browser !== 'undefined' ? browser.tabs : chrome.tabs).sendMessage(tab.id!, { 
      action: 'startInputDetection' 
    });

    // Listen for detected inputs
    messageListener = (event: MessageEvent) => {
      if (event.data.type === 'inputDetected') {
        const input = event.data.input;
        
        // Check if we already detected this input
        if (!detectedInputs.value.find(existing => existing.selector === input.selector)) {
          detectedInputs.value.push({
            ...input,
            questionKey: '',
            customQuestion: ''
          });
        }
      }
    };

    window.addEventListener('message', messageListener);

  } catch (error) {
    console.error('Failed to start input detection:', error);
    alert('Failed to start input detection. Make sure you\'re on the correct website.');
    isDetecting.value = false;
  }
};

const stopDetection = async () => {
  isDetecting.value = false;
  
  if (messageListener) {
    window.removeEventListener('message', messageListener);
    messageListener = null;
  }

  try {
    const [tab] = await (typeof browser !== 'undefined' ? browser.tabs : chrome.tabs).query({ active: true, currentWindow: true });
    await (typeof browser !== 'undefined' ? browser.tabs : chrome.tabs).sendMessage(tab.id!, { 
      action: 'stopInputDetection' 
    });
  } catch (error) {
    console.error('Failed to stop detection:', error);
  }
};

const removeInput = (index: number) => {
  detectedInputs.value.splice(index, 1);
};

const saveConfiguration = async () => {
  if (!websiteUrl.value || detectedInputs.value.length === 0) {
    alert('Please add at least one input configuration');
    return;
  }

  // Validate that all inputs have questions assigned
  const invalidInputs = detectedInputs.value.filter(input => 
    !input.questionKey || (input.questionKey === 'custom' && !input.customQuestion)
  );

  if (invalidInputs.length > 0) {
    alert('Please assign questions to all detected inputs');
    return;
  }

  const domain = new URL(websiteUrl.value).hostname;
  const configuration: SavedConfiguration = {
    id: Date.now().toString(),
    domain,
    url: websiteUrl.value,
    inputs: detectedInputs.value
  };

  const storageAPI = typeof browser !== 'undefined' && browser.storage ? browser.storage : chrome.storage;
  const existing = await storageAPI.local.get('custom_website_configs');
  const configs = existing.custom_website_configs || [];
  
  // Remove existing config for this domain if it exists
  const filteredConfigs = configs.filter((c: SavedConfiguration) => c.domain !== domain);
  filteredConfigs.push(configuration);

  await storageAPI.local.set({ custom_website_configs: filteredConfigs });
  
  await loadConfigurations();
  
  // Reset form
  detectedInputs.value = [];
  websiteUrl.value = '';
  
  alert('Configuration saved successfully!');
};

const loadConfigurations = async () => {
  const storageAPI = typeof browser !== 'undefined' && browser.storage ? browser.storage : chrome.storage;
  const existing = await storageAPI.local.get('custom_website_configs');
  savedConfigurations.value = existing.custom_website_configs || [];
};

const deleteConfiguration = async (configId: string) => {
  if (!confirm('Are you sure you want to delete this configuration?')) {
    return;
  }

  const storageAPI = typeof browser !== 'undefined' && browser.storage ? browser.storage : chrome.storage;
  const existing = await storageAPI.local.get('custom_website_configs');
  const configs = existing.custom_website_configs || [];
  
  const filteredConfigs = configs.filter((c: SavedConfiguration) => c.id !== configId);
  await storageAPI.local.set({ custom_website_configs: filteredConfigs });
  
  await loadConfigurations();
};

onMounted(() => {
  loadConfigurations();
});

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
