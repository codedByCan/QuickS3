const translations = {
    en: {
        loginTitle: "Sign in to QuickS3 Editor",
        username: "Username",
        password: "Password",
        loginBtn: "Sign In",
        selectWorkspace: "Select Workspace",
        selectBucket: "Select Bucket",
        selectFolder: "Select Folder (Optional)",
        openEditor: "Open Editor",
        loading: "Loading...",
        error: "Error",
        save: "Save",
        saved: "Saved successfully",
        delete: "Delete",
        rename: "Rename",
        newFile: "New File",
        search: "Search",
        files: "Files",
        welcome: "Welcome",
        noOpenFiles: "No files open",
        logout: "Logout",
        confirmDelete: "Are you sure you want to delete this file?",
        enterNewName: "Enter new name:",
        folderEmpty: "Folder is empty",
        searchResults: "Search Results",
        noResults: "No results found",
        searching: "Searching...",
        root: "Root Directory"
    },
    tr: {
        loginTitle: "QuickS3 Editör'e Giriş Yap",
        username: "Kullanıcı Adı",
        password: "Şifre",
        loginBtn: "Giriş Yap",
        selectWorkspace: "Çalışma Alanı Seç",
        selectBucket: "Bucket Seç",
        selectFolder: "Klasör Seç (İsteğe Bağlı)",
        openEditor: "Editörü Aç",
        loading: "Yükleniyor...",
        error: "Hata",
        save: "Kaydet",
        saved: "Başarıyla kaydedildi",
        delete: "Sil",
        rename: "Yeniden Adlandır",
        newFile: "Yeni Dosya",
        search: "Ara",
        files: "Dosyalar",
        welcome: "Hoşgeldiniz",
        noOpenFiles: "Açık dosya yok",
        logout: "Çıkış",
        confirmDelete: "Bu dosyayı silmek istediğinizden emin misiniz?",
        enterNewName: "Yeni adı girin:",
        folderEmpty: "Klasör boş",
        searchResults: "Arama Sonuçları",
        noResults: "Sonuç bulunamadı",
        searching: "Aranıyor...",
        root: "Kök Dizin"
    }
};

const lang = navigator.language.startsWith('tr') ? 'tr' : 'en';

function t(key) {
    return translations[lang][key] || key;
}

function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (el.placeholder) {
            el.placeholder = t(key);
        } else {
            el.textContent = t(key);
        }
    });
}
