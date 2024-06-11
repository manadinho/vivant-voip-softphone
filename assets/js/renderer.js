const { ipcRenderer } = require('electron');

window.DOMAIN = null;

ipcRenderer.on('phone-number', (event, phoneNumber) => {
    const iframe = document.querySelector('#vivant-softphone-iframe');

    iframe.contentWindow.postMessage({ action: 'doDial', data: { phoneNumber }  }, '*');
});

ipcRenderer.on('domain-info', (event, domain) => {
    window.DOMAIN = domain;
    setIframeSrc();
});

function setDomain() {
    const domain = document.querySelector('#domain').value;

    if(!domain) return alert('Please enter a domain');

    ipcRenderer.send('configure-domain', domain);
}

function setIframeSrc() {
    const url = `https://fusionapi.vivantvoip.dev/softphone?subdomain=${window.DOMAIN}`;
    document.querySelector('#vivant-softphone-iframe').src = url;
}
