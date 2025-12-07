// Custom website autofill handler
class CustomWebsiteAutofill {
    constructor() {
        this.configurations = [];
        this.loadConfigurations();
    }

    async loadConfigurations() {
        try {
            const storageAPI = typeof browser !== 'undefined' && browser.storage ? browser.storage : chrome.storage;
            const data = await storageAPI.local.get('custom_website_configs');
            this.configurations = data.custom_website_configs || [];
        } catch (error) {
            console.error('Failed to load custom website configurations:', error);
        }
    }

    async autofillForm(formData) {
        const currentDomain = window.location.hostname;
        
        // Find configuration for current domain
        const config = this.configurations.find(c => 
            c.domain === currentDomain || 
            currentDomain.includes(c.domain) || 
            c.domain.includes(currentDomain)
        );

        if (!config) {
            console.log('No custom configuration found for domain:', currentDomain);
            return false;
        }

        console.log(`Found custom configuration for ${config.domain} with ${config.inputs.length} inputs`);

        let filledCount = 0;
        
        for (const inputConfig of config.inputs) {
            try {
                const element = document.querySelector(inputConfig.selector);
                
                if (!element) {
                    console.warn(`Element not found for selector: ${inputConfig.selector}`);
                    continue;
                }

                let valueToFill = '';
                
                // Get the value based on the question key
                if (inputConfig.questionKey === 'custom') {
                    // For custom questions, try to find a matching saved answer
                    valueToFill = await this.getCustomAnswer(inputConfig.customQuestion);
                } else {
                    // Use standard form data
                    valueToFill = formData[inputConfig.questionKey] || '';
                }

                if (valueToFill) {
                    await this.fillInputElement(element, valueToFill, inputConfig.type);
                    filledCount++;
                    console.log(`Filled ${inputConfig.questionKey}: ${valueToFill}`);
                }

                // Add delay between inputs to avoid triggering anti-bot measures
                await this.sleep(100 + Math.random() * 200);

            } catch (error) {
                console.error(`Failed to fill input ${inputConfig.questionKey}:`, error);
            }
        }

        console.log(`Custom autofill completed. Filled ${filledCount} inputs.`);
        return filledCount > 0;
    }

    async fillInputElement(element, value, inputType) {
        // Focus the element first
        element.focus();
        await this.sleep(50);

        // Clear existing value
        element.value = '';
        
        // Trigger change event after clearing
        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new Event('change', { bubbles: true }));

        await this.sleep(50);

        if (inputType === 'select-one') {
            // Handle select dropdowns
            const options = element.options;
            for (let i = 0; i < options.length; i++) {
                if (options[i].text.toLowerCase().includes(value.toLowerCase()) ||
                    options[i].value.toLowerCase().includes(value.toLowerCase())) {
                    element.selectedIndex = i;
                    break;
                }
            }
        } else if (inputType === 'file') {
            // Handle file inputs (resume upload)
            // This is more complex and may require user interaction
            console.log('File input detected - manual upload may be required');
        } else {
            // Handle text inputs, textareas, etc.
            element.value = value;
            
            // Trigger input and change events
            element.dispatchEvent(new Event('input', { bubbles: true }));
            element.dispatchEvent(new Event('change', { bubbles: true }));
            
            // Dispatch keyboard events for better compatibility
            element.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true }));
            element.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));
        }

        // Blur the element
        element.blur();
    }

    async getCustomAnswer(question) {
        try {
            const storageAPI = typeof browser !== 'undefined' && browser.storage ? browser.storage : chrome.storage;
            const data = await storageAPI.local.get('saved_answers');
            const savedAnswers = data.saved_answers || [];

            // Try to find a matching answer by question similarity
            const questionLower = question.toLowerCase();
            
            for (const cluster of savedAnswers) {
                // Check if any question in the cluster matches
                const matchingQuestion = cluster.questions.find(q => 
                    q.question.toLowerCase().includes(questionLower) ||
                    questionLower.includes(q.question.toLowerCase())
                );
                
                if (matchingQuestion) {
                    return cluster.answer;
                }
            }

            // If no exact match, try semantic similarity if available
            if (window.semanticAutofill && window.semanticAutofill.findSimilarAnswer) {
                const similarAnswer = await window.semanticAutofill.findSimilarAnswer(question);
                if (similarAnswer) {
                    return similarAnswer.answer;
                }
            }

            return '';
        } catch (error) {
            console.error('Failed to get custom answer:', error);
            return '';
        }
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    isSupportedDomain() {
        const currentDomain = window.location.hostname;
        return this.configurations.some(config => 
            config.domain === currentDomain || 
            currentDomain.includes(config.domain) || 
            config.domain.includes(currentDomain)
        );
    }
}

// Export for use in main autofill script
window.customWebsiteAutofill = new CustomWebsiteAutofill();
