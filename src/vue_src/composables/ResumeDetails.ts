import { ref, computed } from 'vue';

const details = ref({});
export function useResumeDetails() {
  const loadDetails = () => {
    if (typeof browser !== 'undefined' && browser.storage) {
      browser.storage.local.get('Resume_details').then((data) => {
        let val = data['Resume_details'];
        if (val) {
            if(typeof val === "string") {
                let jsonData = JSON.parse(val);
                details.value = jsonData;
                return;
            }
            details.value = val;
        }
      });
    } else if (typeof chrome !== 'undefined' && chrome.storage) { // Fallback to Chrome
      chrome.storage.local.get('Resume_details', (data) => {
        let val = data['Resume_details'];
        if (val) {
            if(typeof val === "string") {
                let jsonData = JSON.parse(val);
                details.value = jsonData;
                return;
            }
            details.value = val;
        }
      });
    }
  };
loadDetails();
  return {
    details: computed(() => details.value), 
    loadDetails
  };
}
