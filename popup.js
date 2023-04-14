document.getElementById("save").addEventListener("click", saveScript);
document.getElementById("run").addEventListener("click", runScript);
document
  .getElementById("scriptEntryTab")
  .addEventListener("click", () => switchTab("scriptEntry"));
document
  .getElementById("listViewTab")
  .addEventListener("click", () => switchTab("listView"));

function saveScript() {
  const domain = document.getElementById("domain").value;
  const script = document.getElementById("script").value;

  if (domain && script) {
    const data = {};
    data[domain] = script;
    browser.storage.local.set(data).then(() => {
      document.getElementById("status").innerText = "Script saved!";
      loadDomainsList();
    });
  }
}

function runScript() {
  browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
    const activeTab = tabs[0];
    browser.storage.local.get(activeTab.url).then((result) => {
      console.log(activeTab);
      console.log(activeTab.url);
      const script = result[activeTab.url];
      if (script) {
        browser.tabs.sendMessage(activeTab.id, { script });
      } else {
        document.getElementById("status").innerText =
          "No script found for this domain.";
      }
    });
  });
}

function editScript(domain, script) {
  switchTab("scriptEntry");
  const domainInput = document.getElementById("domain");
  domainInput.value = domain;

  const scriptInput = document.getElementById("script");
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
      editButton.textContent = "Edit";

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

  document.getElementById(tabId).classList.add("visible");
  document.getElementById(`${tabId}Tab`).classList.add("active");
}

// Initialize the UI
loadDomainsList();
switchTab("scriptEntry");