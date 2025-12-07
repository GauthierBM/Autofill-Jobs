/*
import {
  keyDownEvent,
  keyUpEvent,
  mouseUpEvent,
  changeEvent,
  inputEvent,
  sleep,
  curDateStr,
  base64ToArrayBuffer,
  monthToNumber,
  getTimeElapsed,
  delays,
  getStorageDataLocal,
  getStorageDataSync,
  setNativeValue,
  fields
} from "./utils";
import { workDayAutofill } from './workday';
// Import custom website autofill
import './customWebsiteAutofill.js';
*/

let initTime;
window.addEventListener("load", (_) => {
  console.log("AutofillJobs: found job page.");
  initTime = new Date().getTime();
  awaitForm();
});
const applicationFormQuery = "#application-form, #application_form, #applicationform, #_ashby-app-root_";


function inputQuery(jobParam, form) {
  let normalizedParam = jobParam.toLowerCase();
  let inputElement = Array.from(form.querySelectorAll("input")).find(
    (input) => {
      const attributes = [
        input.id?.toLowerCase().trim(),
        input.name?.toLowerCase().trim(),
        input.placeholder?.toLowerCase().trim(),
        input.getAttribute("aria-label")?.toLowerCase().trim(),
        input.getAttribute("aria-labelledby")?.toLowerCase().trim(),
        input.getAttribute("aria-describedby")?.toLowerCase().trim(),
        input.getAttribute("data-qa")?.toLowerCase().trim(),
      ];

      for (let i = 0; i < attributes.length; i++) {
        if (
          attributes[i] != undefined &&
          attributes[i].includes(normalizedParam)
        ) {
          return true;
        }
      }
      return false;
    }
  );
  return inputElement;
}

function formatCityStateCountry(data, param) {
  let formattedStr = `${data[param] != undefined ? `${data[param]},` : ""} ${
    data["Location (State/Region)"] != undefined
      ? `${data["Location (State/Region)"]},`
      : ""
  }`;
  if (formattedStr[formattedStr.length - 1] == ",")
    formattedStr = formattedStr.slice(0, formattedStr.length - 1);
  return formattedStr;
}

async function awaitForm() {
  // Create a MutationObserver to detect changes in the DOM
  const observer = new MutationObserver((_, observer) => {
    for (let jobForm in fields) {
      if (!window.location.hostname.includes(jobForm)) continue;
      //workday
      if (jobForm == "workday") {
        autofill(null);
        observer.disconnect();
        return;
      }
      let form = document.querySelector(applicationFormQuery);
      if (form) {
        observer.disconnect();
        autofill(form);
        return;
      } else {
        form = document.querySelector("form, #mainContent");
        if (form) {
          observer.disconnect();
          autofill(form);
          return;
        }
      }
    }
  });
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
  if (window.location.hostname.includes("lever")) {
    let form = document.querySelector("#application-form, #application_form");
    if (form) autofill(form);
  }
}

async function autofill(form) {
  console.log("Autofill Jobs: Starting autofill.");
  let res = await getStorageDataSync();
  res["Current Date"] = curDateStr();
  await sleep(delays.initial);
  for (let jobForm in fields) {
    if (!window.location.hostname.includes(jobForm)) continue;
    if (jobForm == "workday") {
      workDayAutofill(res);
      return;
    }

    for (let jobParam in fields[jobForm]) {
      if (jobParam.toLowerCase() == "resume") {
          let localData = await getStorageDataLocal();
          
          // Try to get active resume from document manager first
          let resumeContent = null;
          let resumeName = null;
          
          if (localData.documents) {
            const documents = localData.documents;
            const activeResume = documents.find(doc => doc.type === 'resume' && doc.isActive);
            if (activeResume) {
              resumeContent = activeResume.content;
              resumeName = activeResume.name;
            }
          }
          
          // Fallback to old storage if no active resume found
          if (!resumeContent) {
            resumeContent = localData.Resume;
            resumeName = localData.Resume_name;
          }
          
          if (!resumeContent) continue;

          let resumeDiv = {
            greenhouse: 'input[id="resume"]',
            lever: 'input[id="resume-upload-input"]',
            dover:
              'input[type="file"][accept=".pdf"], input[type="file"][accept="application/pdf"]',
            ashby: 'input[name="resume"]',
          };
          let el = document.querySelector(resumeDiv[jobForm]);
          if (!el) {
            //old greenhouse forms
            el = document.querySelector('input[type="file"]');
          }
          el.addEventListener("submit", function (event) {
            event.preventDefault();
          });
          
          const dt = new DataTransfer();
          let arrBfr = base64ToArrayBuffer(resumeContent);

          dt.items.add(
            new File([arrBfr], `${resumeName}`, {
              type: "application/pdf",
            })
          );
          el.files = dt.files;
          el.dispatchEvent(changeEvent);
          await sleep(delays.short);
          
        
        continue;
      }

      let useLongDelay = false;
      //gets param from user data
      const param = fields[jobForm][jobParam];
      let fillValue = res[param];
      if (!fillValue) continue;
      let inputElement = inputQuery(jobParam, form);
      if (!inputElement) continue;

      if (param === "Gender" || "Location (City)") useLongDelay = true;
      if (param === "Location (City)")  fillValue = formatCityStateCountry(res, param);

      setNativeValue(inputElement, fillValue);
      //for the dropdown elements
      let btn = inputElement.closest(".select__control--outside-label");
      if (!btn) continue;

      btn.dispatchEvent(mouseUpEvent);
      await sleep(useLongDelay ? delays.long : delays.short);
      btn.dispatchEvent(keyDownEvent);
      await sleep(delays.short);
    }
    console.log(`Autofill Jobs: Complete in ${getTimeElapsed(initTime)}s.`);
    break; //found site
  }
  
  // If no supported site was found, try custom website configurations
  if (foundSite === false && window.customWebsiteAutofill) {
    console.log("No supported site found, trying custom website configurations...");
    
    // Wait a bit for custom website autofill to load
    setTimeout(async () => {
      try {
        const storageAPI = typeof browser !== 'undefined' && browser.storage ? browser.storage : chrome.storage;
        const data = await storageAPI.local.get(null);
        
        // Get active resume from document manager
        const documents = data.documents || [];
        const activeResume = documents.find(doc => doc.type === 'resume' && doc.isActive);
        
        if (activeResume) {
          // Add active resume data to the data object for autofill
          data['Resume'] = activeResume.content;
          data['Resume_name'] = activeResume.name;
        }
        
        if (window.customWebsiteAutofill.isSupportedDomain()) {
          console.log("Found custom website configuration for current domain");
          const success = await window.customWebsiteAutofill.autofillForm(data);
          if (success) {
            console.log("Custom website autofill completed successfully");
          }
        } else {
          console.log("No custom website configuration found for current domain");
        }
      } catch (error) {
        console.error("Custom website autofill failed:", error);
      }
    }, 1000);
  }
  
}

