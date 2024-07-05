const { ipcRenderer } = require("electron");

window.DOMAIN = null;

ipcRenderer.on("doDial", (event, phoneNumber) => {
  const iframe = document.querySelector("#vivant-softphone-iframe");

  iframe.contentWindow.postMessage(
    { action: "doDial", data: { phoneNumber } },
    "*"
  );
});

ipcRenderer.on("set-subdomain", (event, domain) => {
  window.DOMAIN = domain;
  setIframeSrc();
});

// HANDLE RESET SETUP EVENT
ipcRenderer.on("reset-setup", () => {
  window.DOMAIN = null;
  const iframe = document.querySelector("#vivant-softphone-iframe");
  iframe.contentWindow.postMessage({ action: "doLogout" }, "*");
  ipcRenderer.send("reset-setup-done", {});
});

/**
 * Sets the domain for the softphone.
 */
function setDomain() {
  const [success, subdomainOrMessage] = extractingSubDomain(
    document.querySelector("#subdomain").value
  );
  if (!success) return alert(subdomainOrMessage);

  ipcRenderer.send("configure-subdomain", subdomainOrMessage);
}

/**
 * Sets the source URL of the iframe to display the softphone.
 */
function setIframeSrc() {
  const url = `https://fusionapi.vivantvoip.dev/softphone?subdomain=${window.DOMAIN}`;
  const iframe = document.querySelector("#vivant-softphone-iframe");
  if (!iframe) return;
  iframe.src = url;
}

/**
 * Extracts the subdomain from a given URL or validates if the input is a valid subdomain.
 * @param {string} input - The URL or subdomain input.
 * @returns {Array} - An array containing a boolean indicating if the subdomain is present, and the extracted subdomain or an error message.
 */
function extractingSubDomain(input) {
  try {
    // Try to construct a URL object; this throws if `input` is not a valid URL
    const urlObject = new URL(input);
    const hostname = urlObject.hostname;

    // Assuming domain format like "example.domain.com"
    const parts = hostname.split(".");

    // Assuming the base domain always consists of two parts (e.g., "domain.com")
    if (parts.length > 2) {
      parts.pop(); // Remove TLD
      parts.pop(); // Remove domain
      const subdomain = parts.join(".");
      return [true, subdomain];
    } else {
      return [false, "No Subdomain present"];
    }
  } catch (error) {
    // If the URL constructor fails, assume `input` is a subdomain or an invalid URL
    // Validate if input could plausibly be a subdomain
    if (/^[a-zA-Z0-9\-\.]+$/.test(input)) {
      return [true, input]; // Input looks like a valid subdomain
    } else {
      return [false, "Input is neither a valid URL nor a valid subdomain"];
    }
  }
}
