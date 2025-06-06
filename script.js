// Database JSON
let articlesDB = [];

// Carica gli articoli dal localStorage
function loadArticles() {
    const saved = localStorage.getItem('schoolJournal');
    if (saved) {
        articlesDB = JSON.parse(saved);
        renderArticles();
    }
}

// Salva gli articoli nel localStorage
function saveArticles() {
    localStorage.setItem('schoolJournal', JSON.stringify(articlesDB));
}

// Mostra gli articoli nella pagina
function renderArticles() {
    const container = document.getElementById('articles-container');
    container.innerHTML = '';
    
    // Dividi gli articoli in gruppi di 3 per le colonne
    for (let i = 0; i < articlesDB.length; i += 3) {
        const row = document.createElement('div');
        row.className = 'row mb-4';
        
        for (let j = 0; j < 3; j++) {
            if (i + j < articlesDB.length) {
                const article = articlesDB[i + j];
                const col = document.createElement('div');
                col.className = 'col-md-4';
                
                col.innerHTML = `
                    <div class="card h-100">
                        ${article.imageUrl ? 
                            `<img src="${article.imageUrl}" class="card-img-top" alt="${article.title}">` : 
                            article.imageData ? 
                            `<img src="${article.imageData}" class="card-img-top" alt="${article.title}">` :
                            '<div class="card-img-top bg-secondary" style="height: 200px;"></div>'
                        }
                        <div class="card-body">
                            <h5 class="card-title">${article.title}</h5>
                            <p class="card-text">${article.content}</p>
                        </div>
                    </div>
                `;
                
                row.appendChild(col);
            }
        }
        
        container.appendChild(row);
    }
}

// Gestione del form per nuovi articoli
// Aggiungi questa funzione per eliminare articoli vecchi
function deleteOldArticles(daysThreshold = 30) {
    const now = new Date();
    const thresholdDate = new Date(now.setDate(now.getDate() - daysThreshold));
    
    articlesDB = articlesDB.filter(article => {
        if (!article.createdAt) return true; // Mantieni articoli senza data
        const articleDate = new Date(article.createdAt);
        return articleDate > thresholdDate;
    });
    
    saveArticles();
    renderArticles();
}

// Modifica la funzione saveArticle per aggiungere la data di creazione
document.getElementById('saveArticle').addEventListener('click', () => {
    const title = document.getElementById('articleTitle').value;
    const content = document.getElementById('articleContent').value;
    const imageUrl = document.getElementById('articleImageUrl').value;
    const imageFile = document.getElementById('articleImageFile').files[0];
    
    if (!title || !content) {
        alert('Inserisci titolo e contenuto!');
        return;
    }
    
    const newArticle = { 
        title, 
        content,
        createdAt: new Date().toISOString() // Aggiungi timestamp
    };
    
    if (imageUrl) {
        newArticle.imageUrl = imageUrl;
    } else if (imageFile) {
        const reader = new FileReader();
        reader.onload = function(e) {
            newArticle.imageData = e.target.result;
            articlesDB.push(newArticle);
            saveArticles();
            renderArticles();
            bootstrap.Modal.getInstance(document.getElementById('addArticleModal')).hide();
            document.getElementById('articleForm').reset();
        };
        reader.readAsDataURL(imageFile);
        return;
    }
    
    articlesDB.push(newArticle);
    saveArticles();
    renderArticles();
    bootstrap.Modal.getInstance(document.getElementById('addArticleModal')).hide();
    document.getElementById('articleForm').reset();
});

// Inizializzazione
document.addEventListener('DOMContentLoaded', loadArticles);


// Nuove funzioni per gestire il backup su file
function exportToJSON() {
    const dataStr = JSON.stringify(articlesDB);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'giornalino_backup.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

function importFromJSON(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            if (Array.isArray(importedData)) {
                articlesDB = importedData;
                saveArticles();
                renderArticles();
                alert('Database importato con successo!');
            } else {
                alert('Il file non contiene un database valido');
            }
        } catch (error) {
            alert('Errore durante la lettura del file: ' + error.message);
        }
    };
    reader.readAsText(file);
}

// Aggiungi pulsanti di import/export all'interfaccia
function addExportButtons() {
    const container = document.querySelector('.container');
    
    const btnGroup = document.createElement('div');
    btnGroup.className = 'd-flex gap-2 mt-3';
    
    const exportBtn = document.createElement('button');
    exportBtn.className = 'btn btn-success';
    exportBtn.textContent = 'Esporta Database';
    exportBtn.onclick = exportToJSON;
    
    const importBtn = document.createElement('button');
    importBtn.className = 'btn btn-info';
    importBtn.textContent = 'Importa Database';
    
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';
    fileInput.style.display = 'none';
    fileInput.onchange = importFromJSON;
    
    importBtn.onclick = () => fileInput.click();
    
    btnGroup.appendChild(exportBtn);
    btnGroup.appendChild(importBtn);
    btnGroup.appendChild(fileInput);
    container.appendChild(btnGroup);
}

// Modifica l'inizializzazione per includere i nuovi pulsanti
// Aggiungi pulsante per pulizia articoli
function addCleanupButton() {
    const container = document.querySelector('.container');
    
    const cleanupBtn = document.createElement('button');
    cleanupBtn.className = 'btn btn-warning mt-2 ms-2';
    cleanupBtn.textContent = 'Pulisci Articoli Obsoleti';
    cleanupBtn.onclick = () => {
        if (confirm('Eliminare gli articoli più vecchi di 30 giorni?')) {
            deleteOldArticles();
        }
    };
    
    const btnGroup = document.querySelector('.d-flex');
    btnGroup.appendChild(cleanupBtn);
}

// Modifica l'inizializzazione
function addAdminButton() {
    const container = document.querySelector('.container');
    
    const adminBtn = document.createElement('button');
    adminBtn.className = 'btn btn-dark mt-2 ms-2';
    adminBtn.textContent = 'Amministrazione';
    adminBtn.onclick = () => {
        document.getElementById('articles-container').style.display = 'none';
        document.getElementById('admin-articles-container').style.display = 'block';
        renderAdminArticles();
    };
    
    const btnGroup = document.querySelector('.d-flex');
    btnGroup.appendChild(adminBtn);
}

// Chiamare questa funzione all'inizializzazione
document.addEventListener('DOMContentLoaded', () => {
    loadArticles();
    addExportButtons();
    addCleanupButton();
    addAdminButton(); // Aggiungi questa linea
});


function deleteArticle(articleId) {
    articlesDB = articlesDB.filter((article, index) => index !== articleId);
    saveArticles();
    renderArticles();
}

function renderAdminArticles() {
    const container = document.getElementById('admin-articles-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    articlesDB.forEach((article, index) => {
        const articleDiv = document.createElement('div');
        articleDiv.className = 'card mb-3';
        
        articleDiv.innerHTML = `
            <div class="card-body">
                <h5 class="card-title">${article.title}</h5>
                <p class="card-text">${article.content}</p>
                <button onclick="deleteArticle(${index})" class="btn btn-danger">Elimina</button>
            </div>
        `;
        
        container.appendChild(articleDiv);
    });
}