// Standalone page JavaScript
// Load the extension app
function loadExtension() {
    const appContent = document.getElementById('app-content');
    
    // Get the extension's base URL
    const baseUrl = window.location.href.replace(/\/[^\/]*$/, '/');
    
    // Create an iframe to load the extension
    const iframe = document.createElement('iframe');
    iframe.src = baseUrl + 'index.html';
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    iframe.onload = function() {
        console.log('Extension loaded successfully');
    };
    iframe.onerror = function() {
        showError('Failed to load extension. Please make sure the extension is properly installed.');
    };
    
    // Clear existing content safely
    while (appContent.firstChild) {
        appContent.removeChild(appContent.firstChild);
    }
    appContent.appendChild(iframe);
}

function showError(message) {
    const appContent = document.getElementById('app-content');
    
    // Clear existing content
    while (appContent.firstChild) {
        appContent.removeChild(appContent.firstChild);
    }
    
    // Create error elements safely
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error';
    
    const innerDiv = document.createElement('div');
    
    const errorIcon = document.createElement('div');
    errorIcon.className = 'error-icon';
    errorIcon.textContent = '⚠️';
    
    const title = document.createElement('h3');
    title.textContent = 'Loading Error';
    
    const paragraph = document.createElement('p');
    paragraph.textContent = message;
    
    const retryButton = document.createElement('button');
    retryButton.id = 'retry-button';
    retryButton.textContent = 'Try Again';
    retryButton.style.cssText = `
        margin-top: 16px;
        padding: 8px 16px;
        background: #3b82f6;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    `;
    
    // Assemble the error message
    innerDiv.appendChild(errorIcon);
    innerDiv.appendChild(title);
    innerDiv.appendChild(paragraph);
    innerDiv.appendChild(retryButton);
    errorDiv.appendChild(innerDiv);
    appContent.appendChild(errorDiv);
    
    // Add event listener for retry button
    retryButton.addEventListener('click', function() {
        location.reload();
    });
}

// Load the extension when the page loads
window.addEventListener('load', function() {
    loadExtension();
    
    // Add event listeners for footer links
    const closeLink = document.getElementById('close-link');
    const reloadLink = document.getElementById('reload-link');
    
    if (closeLink) {
        closeLink.addEventListener('click', function(e) {
            e.preventDefault();
            window.close();
        });
    }
    
    if (reloadLink) {
        reloadLink.addEventListener('click', function(e) {
            e.preventDefault();
            location.reload();
        });
    }
});

// Handle extension messages
window.addEventListener('message', function(event) {
    // Handle messages from the extension iframe if needed
    console.log('Received message:', event.data);
});

// Provide some utility functions for the standalone mode
window.standaloneUtils = {
    isStandalone: true,
    reloadExtension: loadExtension,
    closeStandalone: function() {
        window.close();
    }
};
