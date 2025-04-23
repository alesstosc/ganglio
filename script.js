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
document.getElementById('saveArticle').addEventListener('click', () => {
    const title = document.getElementById('articleTitle').value;
    const content = document.getElementById('articleContent').value;
    const imageUrl = document.getElementById('articleImageUrl').value;
    const imageFile = document.getElementById('articleImageFile').files[0];
    
    if (!title || !content) {
        alert('Inserisci titolo e contenuto!');
        return;
    }
    
    const newArticle = { title, content };
    
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