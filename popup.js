const FOLDER_NAME = "Snoozed 💤"; // Doit être identique au background !

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Charger les réglages
    const data = await chrome.storage.local.get({ waitMin: 30, ghostMin: 60, whitelist: "" });

    if (document.getElementById('waitMin')) document.getElementById('waitMin').value = data.waitMin;
    if (document.getElementById('ghostMin')) document.getElementById('ghostMin').value = data.ghostMin;
    if (document.getElementById('whitelist')) document.getElementById('whitelist').value = data.whitelist;

    // 2. Compter en direct
    const groups = await chrome.tabGroups.query({ title: FOLDER_NAME });
    let count = 0;

    if (groups.length > 0) {
        const groupIds = groups.map(g => g.id);
        const allTabs = await chrome.tabs.query({});
        count = allTabs.filter(t => groupIds.includes(t.groupId)).length;
    }

    // 3. Mise à jour de l'affichage
    const ghostSpan = document.getElementById('ghostCount');
    if (ghostSpan) ghostSpan.textContent = count;

    const ramSpan = document.getElementById('ramCount');
    if (ramSpan) {
        const ramValue = count * 50;
        ramSpan.textContent = ramValue >= 1000 ? (ramValue / 1000).toFixed(1) + " Go" : ramValue + " Mo";
    }
});

// Enregistrement
const saveBtn = document.getElementById('saveBtn');
if (saveBtn) {
    saveBtn.addEventListener('click', () => {
        const waitMin = parseInt(document.getElementById('waitMin').value);
        const ghostMin = parseInt(document.getElementById('ghostMin').value);
        const whitelist = document.getElementById('whitelist').value.toLowerCase();

        chrome.storage.local.set({ waitMin, ghostMin, whitelist }, () => {
            saveBtn.textContent = "✅ Enregistré !";
            setTimeout(() => { window.close(); }, 800);
        });
    });
}