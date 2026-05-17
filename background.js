const FOLDER_NAME = "Snoozed 💤";
let WAIT_MIN = 30;
let GHOST_MIN = 60;
let WHITELIST = [];

async function init() {
    const data = await chrome.storage.local.get({ waitMin: 30, ghostMin: 60, whitelist: "" });
    WAIT_MIN = data.waitMin;
    GHOST_MIN = data.ghostMin;
    WHITELIST = data.whitelist.split('\n').map(s => s.trim()).filter(s => s !== "");
    await updateBadge();
}
init();
chrome.storage.onChanged.addListener(init);

async function updateBadge() {
    try {
        const groups = await chrome.tabGroups.query({ title: FOLDER_NAME });
        const count = (await chrome.tabs.query({})).filter(t => groups.map(g => g.id).includes(t.groupId)).length;
        chrome.action.setBadgeText({ text: count > 0 ? count.toString() : "" });
        chrome.action.setBadgeBackgroundColor({ color: "#38bdf8" });
    } catch (e) { }
}

// ☀️ RÉVEIL : On nettoie TOUT (Sablier et Zzz)
chrome.tabs.onActivated.addListener(async (activeInfo) => {
    chrome.storage.local.set({ [activeInfo.tabId.toString()]: Date.now() });
    setTimeout(async () => {
        try {
            const tab = await chrome.tabs.get(activeInfo.tabId);
            // On nettoie le titre direct
            const clean = tab.title.replace(/[⏳💤]\s*/g, "");
            await updateTitle(tab.id, clean);

            const groups = await chrome.tabGroups.query({ title: FOLDER_NAME, windowId: tab.windowId });
            if (groups.length > 0 && tab.groupId === groups[0].id) {
                await chrome.tabs.ungroup(tab.id);
                await updateBadge();
            }
        } catch (e) { }
    }, 400);
});

// 🕵️ PATROUILLE
chrome.alarms.create("checkTabs", { periodInMinutes: 1 });
chrome.alarms.onAlarm.addListener(async () => {
    const tabs = await chrome.tabs.query({ active: false, pinned: false });
    const now = Date.now();

    for (let tab of tabs) {
        if (tab.groupId !== -1 || WHITELIST.some(site => tab.url.includes(site))) continue;

        const data = await chrome.storage.local.get(tab.id.toString());
        const diff = (now - (data[tab.id.toString()] || now)) / 1000 / 60;

        if (diff > GHOST_MIN) {
            await moveToDormitory(tab);
        } else if (diff > WAIT_MIN && !tab.title.includes("⏳")) {
            const clean = tab.title.replace(/[⏳💤]\s*/g, "");
            await updateTitle(tab.id, "⏳ " + clean);
        }
    }
    await updateBadge();
});

// 💤 MISE EN SNOOZE (Le fix est ici !)
async function moveToDormitory(tab) {
    try {
        // 1. CHANGER LE TITRE EN PREMIER (Indispensable avant le discard)
        const clean = tab.title.replace(/[⏳💤]\s*/g, "");
        await updateTitle(tab.id, "💤 " + clean);

        // 2. GÉRER LE GROUPE
        let groups = await chrome.tabGroups.query({ title: FOLDER_NAME, windowId: tab.windowId });
        let groupId = groups.length > 0 ? groups[0].id : await chrome.tabs.group({ tabIds: tab.id });

        if (groups.length === 0) {
            await chrome.tabGroups.update(groupId, { title: FOLDER_NAME, color: "pink" });
        }

        await chrome.tabs.group({ groupId: groupId, tabIds: tab.id });
        await chrome.tabGroups.update(groupId, { collapsed: true });

        // 3. GEL DE L'ONGLET EN DERNIER
        setTimeout(() => { chrome.tabs.discard(tab.id); }, 500);

        await updateBadge();
    } catch (e) { }
}

async function updateTitle(tabId, newTitle) {
    try {
        await chrome.scripting.executeScript({
            target: { tabId: tabId },
            func: (t) => { document.title = t; },
            args: [newTitle]
        });
    } catch (e) { }
}