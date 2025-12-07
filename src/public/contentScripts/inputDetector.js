// Input detection script for custom website configuration
let isDetecting = false;
let highlightedElements = [];

// Function to generate a unique selector for an element
function generateSelector(element) {
    if (element.id) {
        return `#${element.id}`;
    }
    
    if (element.className) {
        const classes = element.className.split(' ').filter(c => c.trim());
        if (classes.length > 0) {
            return `${element.tagName.toLowerCase()}.${classes.join('.')}`;
        }
    }
    
    // Generate path-based selector
    const path = [];
    let current = element;
    
    while (current.parentElement) {
        let selector = current.tagName.toLowerCase();
        
        // Add nth-child if there are siblings of the same type
        const siblings = Array.from(current.parentElement.children).filter(
            child => child.tagName === current.tagName
        );
        
        if (siblings.length > 1) {
            const index = siblings.indexOf(current) + 1;
            selector += `:nth-child(${index})`;
        }
        
        path.unshift(selector);
        current = current.parentElement;
    }
    
    return path.join(' > ');
}

// Function to get input information
function getInputInfo(element) {
    const input = element;
    
    return {
        id: input.id || '',
        selector: generateSelector(element),
        label: getInputLabel(element),
        name: input.name || '',
        type: input.type || element.tagName.toLowerCase(),
        placeholder: input.placeholder || ''
    };
}

// Function to find the label for an input
function getInputLabel(element) {
    // Check for explicit label
    if (element.id) {
        const label = document.querySelector(`label[for="${element.id}"]`);
        if (label) {
            return label.textContent?.trim() || '';
        }
    }
    
    // Check for parent label
    const parentLabel = element.closest('label');
    if (parentLabel) {
        return parentLabel.textContent?.trim() || '';
    }
    
    // Check for preceding text nodes or elements
    let previous = element.previousElementSibling;
    while (previous) {
        if (previous.tagName === 'LABEL' || previous.tagName === 'SPAN' || previous.tagName === 'DIV') {
            const text = previous.textContent?.trim();
            if (text && text.length < 100) { // Reasonable label length
                return text;
            }
        }
        previous = previous.previousElementSibling;
    }
    
    // Check for aria-label
    const ariaLabel = element.getAttribute('aria-label');
    if (ariaLabel) {
        return ariaLabel;
    }
    
    // Check for placeholder
    const placeholder = element.getAttribute('placeholder');
    if (placeholder) {
        return placeholder;
    }
    
    return '';
}

// Function to highlight an element
function highlightElement(element) {
    element.style.outline = '2px solid #3b82f6';
    element.style.outlineOffset = '2px';
    element.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
    highlightedElements.push(element);
}

// Function to remove highlights
function removeHighlights() {
    highlightedElements.forEach(element => {
        element.style.outline = '';
        element.style.outlineOffset = '';
        element.style.backgroundColor = '';
    });
    highlightedElements = [];
}

// Function to handle input click
function handleInputClick(event) {
    event.preventDefault();
    event.stopPropagation();
    
    const element = event.target;
    
    // Only handle input-like elements
    const tagName = element.tagName.toLowerCase();
    const inputTypes = ['input', 'textarea', 'select'];
    
    if (!inputTypes.includes(tagName)) {
        return;
    }
    
    const inputInfo = getInputInfo(element);
    
    // Send message to popup with input info
    window.postMessage({
        type: 'inputDetected',
        input: inputInfo
    }, '*');
    
    // Visual feedback
    removeHighlights();
    highlightElement(element);
    
    // Remove highlight after 2 seconds
    setTimeout(() => {
        element.style.outline = '';
        element.style.outlineOffset = '';
        element.style.backgroundColor = '';
        const index = highlightedElements.indexOf(element);
        if (index > -1) {
            highlightedElements.splice(index, 1);
        }
    }, 2000);
}

// Function to handle mouseover for highlighting
function handleMouseOver(event) {
    if (!isDetecting) return;
    
    const element = event.target;
    const tagName = element.tagName.toLowerCase();
    const inputTypes = ['input', 'textarea', 'select'];
    
    if (inputTypes.includes(tagName)) {
        element.style.outline = '2px solid #10b981';
        element.style.outlineOffset = '2px';
        element.style.cursor = 'pointer';
    }
}

// Function to handle mouseout for removing highlight
function handleMouseOut(event) {
    const element = event.target;
    
    // Only remove highlight if it's not a permanently highlighted element
    if (!highlightedElements.includes(element)) {
        element.style.outline = '';
        element.style.outlineOffset = '';
        element.style.cursor = '';
    }
}

// Function to start input detection
function startInputDetection() {
    isDetecting = true;
    highlightedElements = [];
    
    // Add event listeners
    document.addEventListener('click', handleInputClick, true);
    document.addEventListener('mouseover', handleMouseOver, true);
    document.addEventListener('mouseout', handleMouseOut, true);
    
    // Visual indicator
    document.body.style.cursor = 'crosshair';
    
    // Show notification
    showNotification('Input detection started. Click on any input field to add it to your configuration.');
}

// Function to stop input detection
function stopInputDetection() {
    isDetecting = false;
    
    // Remove event listeners
    document.removeEventListener('click', handleInputClick, true);
    document.removeEventListener('mouseover', handleMouseOver, true);
    document.removeEventListener('mouseout', handleMouseOut, true);
    
    // Remove all highlights
    removeHighlights();
    
    // Reset cursor
    document.body.style.cursor = '';
    
    showNotification('Input detection stopped.');
}

// Function to show notification
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #1f2937;
        color: white;
        padding: 12px 16px;
        border-radius: 8px;
        font-family: system-ui, -apple-system, sans-serif;
        font-size: 14px;
        z-index: 10000;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        max-width: 300px;
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.parentElement.removeChild(notification);
        }
    }, 3000);
}

// Listen for messages from popup
window.addEventListener('message', (event) => {
    if (event.data.action === 'startInputDetection') {
        startInputDetection();
    } else if (event.data.action === 'stopInputDetection') {
        stopInputDetection();
    }
});

// Make functions globally available
window.startInputDetection = startInputDetection;
window.stopInputDetection = stopInputDetection;
