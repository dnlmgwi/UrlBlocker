// background.js

// Listener for when the extension is installed or updated
chrome.runtime.onInstalled.addListener(() => {
    console.log('URL Blocker Extension installed.');
    // Fetch URLs from your server
    fetch('https://run.mocky.io/v3/cd8a0d55-23ab-4888-9c84-25754dd14f50').then(response => response.json())
        .then(data => {
            console.log(data);
            // Validate and sanitize data here
            const validUrls = data.filter(url => isValidUrl(url)); // Implement isValidUrl

            // Store the URLs in local storage
            chrome.storage.local.set({ 'blockedUrls': validUrls }, function () {
                console.log('URLs are saved locally.');
            });

            // Update the `declarativeNetRequest` rules
            updateBlockingRules(validUrls);


            // Initialize or update your extension's settings, if necessary
            // For example, you might want to set up initial blocking rules here
            // using chrome.declarativeNetRequest.updateDynamicRules if they are not static.

            // Fetch URLs and update rules on startup
            fetchStoredUrls(function (validUrls) {
                console.log("Fetching Store Urls");
                updateBlockingRules(validUrls);
            });
        })
        .catch(error => {
            console.error('Error fetching URLs:', error);
        });
});

function updateBlockingRules(urls) {
    // Map URLs to rules
    const rules = urls.map((url, index) => ({
        id: index + 1,
        priority: 1,
        action: { type: 'block' },
        condition: { urlFilter: url, resourceTypes: ['main_frame'] },
    }));

    // Update the dynamic rules
    chrome.declarativeNetRequest.updateDynamicRules({ addRules: rules, removeRuleIds: rules.map(rule => rule.id) });
}

function fetchStoredUrls(callback) {
    chrome.storage.local.get(['blockedUrls'], function (result) {
        if (result.blockedUrls) {
            callback(result.blockedUrls);
        } else {
            callback([]);
        }
    });
}

function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (e) {
        return false;
    }
}

// Listen for changes in local storage
chrome.storage.onChanged.addListener(function (changes, namespace) {
    for (let [key, { newValue }] of Object.entries(changes)) {
        if (key === 'blockedUrls') {
            updateBlockingRules(newValue);
        }
    }
});

// Listener for messages from popup or content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'blockURL') {
        // Handle URL blocking logic here if you need dynamic rule updates
        // For example, you could update the blocking rules based on the received URL

        // Example code to add a new rule (this is just a placeholder and needs real rule details)
        const rule = {
            id: new Date().getTime(),
            priority: 1,
            action: { type: 'block' },
            condition: { urlFilter: message.url, resourceTypes: ['main_frame'] }
        };

        // chrome.declarativeNetRequest.updateDynamicRules({ addRules: [newRule] }, () => {
        //     console.log(`Blocking rule for ${message.url} has been added.`);
        //     sendResponse({ result: 'URL blocked successfully.' });
        // });

        // Return true to indicate you wish to send a response asynchronously
        // return true;
        chrome.declarativeNetRequest.updateDynamicRules({
            addRules: [rule],
            // removeRuleIds: [rule.id] // If you want to remove existing rules
        });
    }
});

