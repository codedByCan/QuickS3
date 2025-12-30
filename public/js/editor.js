let editor = null;
let currentBucket = '';
let currentPrefix = '';
let fileList = [];
let openTabs = [];
let activeTabPath = null;

const els = {
    explorer: document.getElementById('file-explorer'),
    tabsBar: document.getElementById('tabs-bar'),
    welcomeScreen: document.getElementById('welcome-screen'),
    editorContainer: document.getElementById('monaco-editor-container'),
    contextMenu: document.getElementById('context-menu'),
    activityExplorer: document.getElementById('activity-explorer'),
    activitySearch: document.getElementById('activity-search'),
    viewExplorer: document.getElementById('view-explorer'),
    viewSearch: document.getElementById('view-search'),
    globalSearchInput: document.getElementById('global-search-input'),
    searchResults: document.getElementById('search-results'),
    statusLeft: document.querySelector('.status-left'),
    cursorPosition: document.getElementById('cursor-position'),
    fileLang: document.getElementById('file-lang'),
    btnRefresh: document.getElementById('btn-refresh'),
    btnNewFile: document.getElementById('btn-new-file'),
    activityLogout: document.getElementById('activity-logout')
};

document.addEventListener('DOMContentLoaded', async () => {
    if (typeof applyTranslations === 'function') applyTranslations();

    const urlParams = new URLSearchParams(window.location.search);
    currentBucket = urlParams.get('bucket');
    currentPrefix = urlParams.get('prefix') || '';

    if (!currentBucket) {
        window.location.href = '/selection';
        return;
    }

    await loadFiles();

    require(['vs/editor/editor.main'], () => {
    });

    setupEventListeners();
});

function setupEventListeners() {
    els.activityExplorer.addEventListener('click', () => switchView('explorer'));
    els.activitySearch.addEventListener('click', () => switchView('search'));
    els.activityLogout.addEventListener('click', () => window.location.href = '/api/auth/logout');

    els.btnRefresh.addEventListener('click', loadFiles);
    els.btnNewFile.addEventListener('click', createNewFile);

    let searchTimeout;
    els.globalSearchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => performGlobalSearch(e.target.value), 500);
    });

    document.addEventListener('click', (e) => {
        if (!els.contextMenu.contains(e.target)) els.contextMenu.style.display = 'none';
    });

    window.addEventListener('resize', () => {
        if (editor) editor.layout();
    });

}

    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            saveCurrentFile();
        }
    });
function switchView(view) {
    if (view === 'explorer') {
        els.activityExplorer.classList.add('active');
        els.activitySearch.classList.remove('active');
        els.viewExplorer.classList.remove('hidden');
        els.viewSearch.classList.add('hidden');
    } else {
        els.activityExplorer.classList.remove('active');
        els.activitySearch.classList.add('active');
        els.viewExplorer.classList.add('hidden');
        els.viewSearch.classList.remove('hidden');
        els.globalSearchInput.focus();
    }
}

async function loadFiles() {
    try {
        const res = await fetch(`/api/minio/files/${currentBucket}?prefix=${currentPrefix}`);
        const files = await res.json();
        fileList = files.filter(f => f.name !== currentPrefix);
        renderTree(fileList);
    } catch (err) {
        Toast.show(t('error'), 'error');
    }
}

function renderTree(files) {
    els.explorer.innerHTML = '';

    if (files.length === 0) {
        els.explorer.innerHTML = `<div class="p-4 text-gray-500 text-sm">${t('folderEmpty')}</div>`;
        return;
    }

    const root = {};

    files.forEach(file => {

        let relativePath = file.name;
        if (currentPrefix && file.name.startsWith(currentPrefix)) {
            relativePath = file.name.substring(currentPrefix.length);
        }

        if (relativePath.endsWith('/')) relativePath = relativePath.slice(0, -1);
        if (!relativePath) return;

        const parts = relativePath.split('/');
        let current = root;

        parts.forEach((part, index) => {
            if (!current[part]) {
                current[part] = {
                    name: part,
                    fullPath: file.name, 

                    isFolder: index < parts.length - 1 || file.name.endsWith('/'),
                    children: {}
                };
            }
            current = current[part].children;
        });
    });

    els.explorer.appendChild(createTreeElement(root));
}

function createTreeElement(node, depth = 0) {
    const container = document.createElement('div');

    const keys = Object.keys(node).sort((a, b) => {
        const nodeA = node[a];
        const nodeB = node[b];
        if (nodeA.isFolder && !nodeB.isFolder) return -1;
        if (!nodeA.isFolder && nodeB.isFolder) return 1;
        return a.localeCompare(b);
    });

    keys.forEach(key => {
        const item = node[key];
        const itemDiv = document.createElement('div');

        const header = document.createElement('div');
        header.className = 'file-item';
        header.style.paddingLeft = `${depth * 12 + 10}px`;
        header.innerHTML = `
            <i class="codicon codicon-${item.isFolder ? 'folder' : 'file'}"></i>
            <span>${item.name}</span>
        `;

        header.onclick = (e) => {
            e.stopPropagation();
            if (item.isFolder) {

                const childrenContainer = itemDiv.querySelector('.tree-children');
                if (childrenContainer) {
                    const isHidden = childrenContainer.style.display === 'none';
                    childrenContainer.style.display = isHidden ? 'block' : 'none';
                    const icon = header.querySelector('i');
                    icon.className = `codicon codicon-${isHidden ? 'folder-opened' : 'folder'}`;
                }
            } else {
                openFile(item.fullPath);
            }
        };

        if (!item.isFolder) {
            header.oncontextmenu = (e) => showContextMenu(e, item.fullPath);
        }

        itemDiv.appendChild(header);

        if (item.isFolder) {
            const childrenContainer = createTreeElement(item.children, depth + 1);
            childrenContainer.className = 'tree-children';
            childrenContainer.style.display = 'none'; 

            itemDiv.appendChild(childrenContainer);
        }

        container.appendChild(itemDiv);
    });

    return container;
}

async function openFile(path) {

    const existingTab = openTabs.find(t => t.path === path);
    if (existingTab) {
        setActiveTab(path);
        return;
    }

    try {
        const res = await fetch(`/api/minio/file/${currentBucket}?name=${encodeURIComponent(path)}`);
        const content = await res.text();

        const model = monaco.editor.createModel(content, undefined, monaco.Uri.file(path));

        const tab = {
            path,
            name: path.split('/').pop(),
            model,
            viewState: null,
            isDirty: false
        };

        openTabs.push(tab);
        renderTabs();
        setActiveTab(path);

    } catch (err) {
        Toast.show(t('error'), 'error');
    }
}

function setActiveTab(path) {
    activeTabPath = path;
    const tab = openTabs.find(t => t.path === path);

    if (!editor) {
        els.welcomeScreen.style.display = 'none';
        editor = monaco.editor.create(els.editorContainer, {
            theme: 'vs-dark',
            automaticLayout: true,
            minimap: { enabled: true },
            fontSize: 14,
            fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace"
        });

        editor.onDidChangeModelContent(() => {
            if (activeTabPath) {
                const t = openTabs.find(x => x.path === activeTabPath);
                if (t && !t.isDirty) {
                    t.isDirty = true;
                    renderTabs();
                }
            }
        });

        editor.onDidChangeCursorPosition((e) => {
            els.cursorPosition.textContent = `Ln ${e.position.lineNumber}, Col ${e.position.column}`;
        });
    }

    editor.setModel(tab.model);
    renderTabs();
    updateStatusBar(tab);
}

function renderTabs() {
    els.tabsBar.innerHTML = '';
    openTabs.forEach(tab => {
        const div = document.createElement('div');
        div.className = `tab ${tab.path === activeTabPath ? 'active' : ''}`;
        div.innerHTML = `
            <i class="codicon codicon-file${tab.path.endsWith('.js') ? '-code' : ''}"></i>
            <span class="tab-label">${tab.name}</span>
            ${tab.isDirty ? '<div class="dirty-indicator"></div>' : '<i class="codicon codicon-close close-tab"></i>'}
        `;

        div.onclick = (e) => {
            if (e.target.classList.contains('close-tab')) {
                e.stopPropagation();
                closeTab(tab.path);
            } else {
                setActiveTab(tab.path);
            }
        };
        els.tabsBar.appendChild(div);
    });
}

function closeTab(path) {
    const idx = openTabs.findIndex(t => t.path === path);
    if (idx === -1) return;

    const tab = openTabs[idx];
    if (tab.isDirty) {
        if (!confirm('Unsaved changes. Close anyway?')) return;
    }

    tab.model.dispose();
    openTabs.splice(idx, 1);

    if (openTabs.length === 0) {
        activeTabPath = null;
        if (editor) {
            editor.dispose();
            editor = null;
        }
        els.welcomeScreen.style.display = 'flex';
    } else {
        const newIdx = Math.min(idx, openTabs.length - 1);
        setActiveTab(openTabs[newIdx].path);
    }
    renderTabs();
}

async function saveCurrentFile() {
    if (!activeTabPath || !editor) return;

    const tab = openTabs.find(t => t.path === activeTabPath);
    const content = editor.getValue();

    try {
        await fetch(`/api/minio/file/${currentBucket}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: tab.path, content })
        });

        tab.isDirty = false;
        renderTabs();
        Toast.show(t('saved'), 'success');
    } catch (err) {
        Toast.show(t('error'), 'error');
    }
}

function updateStatusBar(tab) {
    const lang = tab.model.getLanguageId();
    els.fileLang.textContent = lang;
}

let contextMenuTarget = null;
function showContextMenu(e, path) {
    e.preventDefault();
    contextMenuTarget = path;
    els.contextMenu.style.display = 'block';
    els.contextMenu.style.left = e.pageX + 'px';
    els.contextMenu.style.top = e.pageY + 'px';
}

document.getElementById('ctx-rename').addEventListener('click', async () => {
    const newName = prompt(t('enterNewName'), contextMenuTarget.replace(currentPrefix, ''));
    if (newName && newName !== contextMenuTarget.replace(currentPrefix, '')) {
        const fullNewPath = currentPrefix + newName;
        try {
            const res = await fetch(`/api/minio/rename/${currentBucket}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ oldName: contextMenuTarget, newName: fullNewPath })
            });

            if (res.ok) {
                Toast.show('Renamed', 'success');
                loadFiles();
                closeTab(contextMenuTarget);
            } else {
                Toast.show(t('error'), 'error');
            }
        } catch (err) {
            Toast.show(t('error'), 'error');
        }
    }
});

document.getElementById('ctx-delete').addEventListener('click', async () => {
    if (confirm(t('confirmDelete'))) {
        try {
            await fetch(`/api/minio/file/${currentBucket}?name=${encodeURIComponent(contextMenuTarget)}`, {
                method: 'DELETE'
            });
            Toast.show('Deleted', 'success');
            loadFiles();
            closeTab(contextMenuTarget);
        } catch (err) {
            Toast.show(t('error'), 'error');
        }
    }
});

function createNewFile() {
    const name = prompt(t('enterNewName'));
    if (name) {
        const fullPath = currentPrefix + name;
        fetch(`/api/minio/file/${currentBucket}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: fullPath, content: '' })
        }).then(() => {
            loadFiles();
            openFile(fullPath);
        });
    }
}

async function performGlobalSearch(query) {
    if (!query) {
        els.searchResults.innerHTML = '';
        return;
    }

    els.searchResults.innerHTML = `<div class="p-2 text-gray-500">${t('searching')}</div>`;

    const results = fileList.filter(f => f.name.toLowerCase().includes(query.toLowerCase()));

    els.searchResults.innerHTML = '';
    if (results.length === 0) {
        els.searchResults.innerHTML = `<div class="p-2 text-gray-500">${t('noResults')}</div>`;
        return;
    }

    results.forEach(f => {
        const div = document.createElement('div');
        div.className = 'search-result-item';
        div.innerHTML = `
            <div class="file-name">${f.name.replace(currentPrefix, '')}</div>
            <div class="file-path">${f.name}</div>
        `;
        div.onclick = () => openFile(f.name);
        els.searchResults.appendChild(div);
    });
}