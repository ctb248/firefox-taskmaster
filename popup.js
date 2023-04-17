document.getElementById("save").addEventListener("click", saveScript);
document.getElementById("run").addEventListener("click", runScript);

document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => switchTab(tab.dataset.tab));
});

const domainInput = document.getElementById("domain");
const scriptInput = document.getElementById("script");

const editor = CodeMirror.fromTextArea(scriptInput, {
  theme: "monokai",
  mode: "javascript",
});

function setStatus(status) {
  document.getElementById("status").innerText = status;
}

function saveScript() {
  const domain = domainInput.value;
  const script = scriptInput.value;

  if (domain && script) {
    const data = {};
    data[domain] = script;
    browser.storage.local.set(data).then(() => {
      setStatus("Script saved!");
      domainInput.value = "";
      scriptInput.value = "";
      loadDomainsList();
    });
  }
}

async function runScriptForCurrentDomain() {
  try {
    const tabs = await browser.tabs.query({
      active: true,
      currentWindow: true,
    });
    const currentTab = tabs[0];
    const url = new URL(currentTab.url);

    const storedData = await browser.storage.sync.get(null);
    const matchingDomain = Object.keys(storedData).find((domain) =>
      url.includes(domain)
    );

    if (matchingDomain && storedData[matchingDomain]) {
      browser.tabs.executeScript({
        code: storedData[matchingDomain],
      });
      setStatus("Script executed.");
    } else {
      setStatus("No script found for this domain.");
    }
  } catch (error) {
    setStatus(`Error: ${error}`);
  }
}

function editScript(domain, script) {
  switchTab("scriptEntry");

  domainInput.value = domain;

  scriptInput.value = script;
}

function loadDomainsList() {
  const domainsList = document.getElementById("domainsList");
  domainsList.innerHTML = "";

  browser.storage.local.get(null).then((items) => {
    for (const domain in items) {
      const listItem = document.createElement("li");
      listItem.className = "script-item";
      const domainName = document.createElement("span");
      domainName.textContent = domain;

      const editButton = document.createElement("button");
      editButton.className = "btn edit-btn";
      editButton.dataset.domain = domain;
      editButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-edit"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`;

      editButton.addEventListener("click", () => {
        editScript(domain, items[domain]);
      });

      listItem.appendChild(domainName);
      listItem.appendChild(editButton);
      domainsList.appendChild(listItem);
    }
  });
}

function switchTab(tabId) {
  const tabs = document.getElementsByClassName("tab");
  const tabContents = document.getElementsByClassName("tab-content");

  for (let i = 0; i < tabs.length; i++) {
    tabs[i].classList.remove("active");
  }

  for (let i = 0; i < tabContents.length; i++) {
    tabContents[i].classList.remove("visible");
  }

  const selectedTab = document.querySelector(`[data-tab='${tabId}']`);
  const selectedContent = document.getElementById(tabId);

  selectedTab.classList.add("active");
  selectedContent.classList.add("visible");
}
// Initialize the UI
loadDomainsList();
switchTab("scriptEntry");
