<script setup lang="ts">
import { ref, onMounted } from 'vue';
//Component imports
import InputField from '@/components/InputField.vue';
import GridDataField from '@/components/GridDataField.vue';
import GithubStars from '@/components/GithubStars.vue';
import PrivacyToggle from '@/components/PrivacyToggle.vue';
import Explanation from '@/components/Explanation.vue';
import EnterSkill from '@/components/EnterSkill.vue';
import EnterWorkExperience from '@/components/EnterWorkExperience.vue';
import SavedAnswers from '@/components/SavedAnswers.vue';
import CustomWebsite from '@/components/CustomWebsite.vue';
import DocumentManager from '@/components/DocumentManager.vue';

const currentView = ref<'main' | 'addSkill' | 'addWorkExperience' | 'customWebsite' | 'documentManager'>('main');
const editingExperienceIndex = ref<number | null>(null);

function showAddSkill() {
  currentView.value = 'addSkill';
}

function showAddWorkExperience() {
  currentView.value = 'addWorkExperience';
}

function showEditWorkExperience(index: number) {
  editingExperienceIndex.value = index;
  currentView.value = 'addWorkExperience';
}

function showCustomWebsite() {
  currentView.value = 'customWebsite';
}

function showDocumentManager() {
  currentView.value = 'documentManager';
}

function showMain() {
  currentView.value = 'main';
  editingExperienceIndex.value = null;
}

function openStandalone() {
  // Open the standalone page in a new tab
  const url = browser?.runtime.getURL('standalone.html') || chrome?.runtime.getURL('standalone.html');
  if (url) {
    if (typeof browser !== 'undefined' && browser.tabs) {
      browser.tabs.create({ url });
    } else if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.create({ url });
    }
  }
}

// Check for draft data on mount and restore view if needed
onMounted(() => {
  const storageAPI = typeof browser !== 'undefined' && browser.storage ? browser.storage : chrome.storage;
  if (storageAPI) {
    storageAPI.local.get(['work_experience_draft', 'skill_draft'], (data) => {
      if (data['work_experience_draft']) {
        // If there's a work experience draft, restore the work experience form
        currentView.value = 'addWorkExperience';
        editingExperienceIndex.value = null;
      } else if (data['skill_draft']) {
        // If there's a skill draft, restore the skill form
        currentView.value = 'addSkill';
      }
    });
  }
});
</script>


<template>
  <EnterWorkExperience v-if="currentView === 'addWorkExperience'" :experience-index="editingExperienceIndex" @close="showMain" />
  <EnterSkill v-if="currentView === 'addSkill'" @close="showMain" />
  <CustomWebsite v-if="currentView === 'customWebsite'" @close="showMain" />
  <DocumentManager v-if="currentView === 'documentManager'" @close="showMain" />
  <Explanation/>
  
  <div v-if="currentView === 'main'" class="p-6 flex flex-col gap-8">
    <header class="flex justify-between items-center">
      <div class="flex items-center gap-2">
        <!-- Standalone button in top-left -->
        <button 
          @click="openStandalone"
          class="h-8 w-8 inline-flex items-center justify-center rounded-md text-sm font-medium border border-border bg-transparent hover:bg-muted transition-colors"
          title="Open in standalone mode"
        >
          <svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="16px" fill="currentColor">
            <path d="M180-120q-33 0-56.5-23.5T100-200v-680q0-33 23.5-56.5T180-960h680q33 0 56.5 23.5T940-880v680q0 33-23.5 56.5T860-120H180Zm0-80h680v-680H180v680Zm0 0v-680 680Z"/>
          </svg>
        </button>
        <h1 class="text-xl font-semibold text-primary">Autofill Jobs</h1>
      </div>
      <div class="flex items-center gap-2">
        <GithubStars/>
        <PrivacyToggle/>
      </div>
    </header>

    <main class="flex flex-col gap-10">
      <section class="flex flex-col gap-4">
        <h2 class="text-base font-medium text-muted-foreground">Personal Details</h2>
        <InputField label="First Name" placeHolder="John" />
        <InputField label="Last Name" placeHolder="Pork" />
        <InputField label="Full Name" placeHolder="John Pork Sr." />
        <InputField label="Email" placeHolder="jpork@mit.edu" />
        <InputField label="Phone" placeHolder="123-345-6789" />
        <InputField label="Phone Type" :placeHolder="['Landline', 'Mobile', 'Office Phone']" />
      </section>

      <section class="flex flex-col gap-4">
        <h2 class="text-base font-medium text-muted-foreground">Experience</h2>
        <InputField label="Resume" placeHolder="No file found" explanation="Upload resumes and documents in the Document Manager first"/>
        <GridDataField label="Work Experience" @add-item="showAddWorkExperience" @edit-item="showEditWorkExperience" />
        <GridDataField label="Skills" @add-item="showAddSkill" />
        <InputField label="API Key" explanation="The API Key field requires a Gemini-1.5-flash api key. This field is optional and is used to autofill the work experience and skills fields directly from your resume." placeHolder="AIyKwaSyBTOk..." />
        <InputField label="Current Employer" placeHolder="Apple" />
      </section>
      
      <section class="flex flex-col gap-4">
        <h2 class="text-base font-medium text-muted-foreground">Socials</h2>
        <InputField label="Twitter/X" placeHolder="https://x.com/" />
        <InputField label="LinkedIn" placeHolder="https://linkedin.com/in/johnpork" />
        <InputField label="Github" placeHolder="https://github.com/andrewmillercode" />
        <InputField label="Website" placeHolder="johnpork.com" />
      </section>

      <section class="flex flex-col gap-4">
        <h2 class="text-base font-medium text-muted-foreground">Location</h2>
        <InputField label="Location (Street)" placeHolder="123 Sesame St" />
        <InputField label="Location (City)" placeHolder="Albuquerque" />
        <InputField label="Location (State/Region)" placeHolder="New Mexico" />
        <InputField label="Location (Country)" placeHolder="United States of America" />
        <InputField label="Postal/Zip Code" placeHolder="87104" />
      </section>

      <section class="flex flex-col gap-4">
        <h2 class="text-base font-medium text-muted-foreground">Education</h2>
        <InputField label="School" placeHolder="Massachusetts Institute of Technology" />
        <InputField label="Degree" :placeHolder="[
          'Associate\'s Degree',
          'Bachelor\'s Degree',
          'Doctor of Medicine (M.D.)',
          'Doctor of Philosophy (Ph.D.)',
          'Engineer\'s Degree',
          'High School',
          'Juris Doctor (J.D.)',
          'Master of Business Administration (M.B.A.)',
          'Master\'s Degree',
          'Other'
        ]" />
        <InputField label="Discipline" placeHolder="Computer Science" />
        <InputField label="Start Date Month" :placeHolder="[
          'January',
          'February',
          'March',
          'April',
          'May',
          'June',
          'July',
          'August',
          'September',
          'October',
          'November',
          'December'
        ]" />
        <InputField label="Start Date Year" placeHolder="2024" />
        <InputField label="End Date Month" :placeHolder="[
          'January',
          'February',
          'March',
          'April',
          'May',
          'June',
          'July',
          'August',
          'September',
          'October',
          'November',
          'December'
        ]" />
        <InputField label="End Date Year" placeHolder="2025" />
        <InputField label="GPA" placeHolder="3.94" />
      </section>

      <section class="flex flex-col gap-4">
        <h2 class="text-base font-medium text-muted-foreground">Voluntary Identification</h2>
        <InputField label="Gender" :placeHolder="['Male', 'Female', 'Decline To Self Identify']" />
        <InputField label="Race" :placeHolder="[
          'American Indian or Alaskan Native',
          'Asian',
          'Black or African American',
          'White',
          'Native Hawaiian or Other Pacific Islander',
          'Two or More Races',
          'Decline To Self Identify'
        ]" />
        <InputField label="Hispanic/Latino" :placeHolder="['Yes', 'No', 'Decline To Self Identify']" />
        <InputField label="Veteran Status"
          :placeHolder="['I am not a protected veteran', 'I identify as one or more of the classifications of a protected veteran', 'I don\'t wish to answer']" />
        <InputField label="Disability Status"
          :placeHolder="['Yes, I have a disability, or have had one in the past', 'No, I do not have a disability and have not had one in the past', 'I do not want to answer']" />
      </section>

      <SavedAnswers />
      
      <section class="flex flex-col gap-4">
        <h2 class="text-base font-medium text-muted-foreground">Custom Websites</h2>
        <button 
          @click="showCustomWebsite"
          class="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-sm font-medium"
        >
          Add Custom Website Support
        </button>
        <p class="text-xs text-gray-600">
          Configure the extension to work on any job board by selecting inputs and defining what questions they answer.
        </p>
      </section>

      <section class="flex flex-col gap-4">
        <h2 class="text-base font-medium text-muted-foreground">Document Manager</h2>
        <button 
          @click="showDocumentManager"
          class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors text-sm font-medium"
        >
          Manage Documents
        </button>
        <p class="text-xs text-gray-600">
          Upload and manage multiple resumes, cover letters, and other documents for different job applications.
        </p>
      </section>
    </main>
  </div>
</template>
