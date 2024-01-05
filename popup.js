document.getElementById('blockButton').addEventListener('click', () => {
    const url = document.getElementById('urlInput').value;
    // Send the URL to background.js
    chrome.runtime.sendMessage({
        action: 'blockUrl',
        url: url
    });
});
