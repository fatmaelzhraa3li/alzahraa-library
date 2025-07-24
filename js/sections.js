// sections.js

// ** الدوال المساعدة (Helper Functions) **
function getCartItems() {
    const cartItemsString = localStorage.getItem('cartItems');
    try {
        return cartItemsString ? JSON.parse(cartItemsString) : [];
    } catch (error) {
        console.error('Error parsing cart items from localStorage:', error);
        return [];
    }
}

function saveCartItems(items) {
    localStorage.setItem('cartItems', JSON.stringify(items));
}

function getFavoriteItems() {
    const favoritesString = localStorage.getItem('favoriteBooks');
    try {
        return favoritesString ? JSON.parse(favoritesString) : [];
    } catch (error) {
        console.error('Error parsing favorite items from localStorage:', error);
        return [];
    }
}

function saveFavoriteItems(items) {
    localStorage.setItem('favoriteBooks', JSON.stringify(items));
}

const API_URL = 'https://edu-me01.github.io/Json-Data/Digital-Library.json';

async function fetchAllBooks() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data.books || [];
    } catch (error) {
        console.error('Error fetching books from API:', error);
        return [];
    }
}

// تم تحديث هذه الدالة لتعكس التغيير في اسم الكلاس من .card-actions إلى .actions
function renderBookCard(book, isFavorited, isInCart) {
    const defaultCover = './images/book.jpg';
    const defaultPrice = 15.00;
    const bookPrice = book.price !== undefined ? book.price : defaultPrice;

    return `
        <div class="book-card" data-book-id="${book.id}">
            <img src="${book.coverImage || defaultCover}" alt="${book.title}" class="book-cover">
            <div class="book-info">
                <h4 class="book-title" title="${book.title}">${book.title}</h4>
                <p class="book-author" title="${book.author}">Author: ${book.author}</p>
                <span class="book-price">$${bookPrice.toFixed(2)}</span>
            </div>
            <div class="actions"> <button class="add-to-cart-btn" data-book-id="${book.id}" ${isInCart ? 'disabled' : ''}>
                    ${isInCart ? 'Added to Cart' : 'Add to Cart'}
                </button>
                <button class="favorite-btn ${isFavorited ? 'favorited' : ''}" data-book-id="${book.id}">
                    <i class="fas fa-heart"></i>
                </button>
            </div>
        </div>
    `;
}

function addToCart(bookId) {
    let cart = getCartItems();
    const existingItem = cart.find(item => item.bookId === bookId);

    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ bookId: bookId, quantity: 1 });
    }
    saveCartItems(cart);
    updateCartButtonText(bookId, true);
}

function toggleFavorite(bookId) {
    let favorites = getFavoriteItems();
    const index = favorites.indexOf(bookId);
    const favoriteBtn = document.querySelector(`.favorite-btn[data-book-id="${bookId}"]`);

    if (index > -1) {
        favorites.splice(index, 1);
        favoriteBtn.classList.remove('favorited');
    } else {
        favorites.push(bookId);
        favoriteBtn.classList.add('favorited');
    }
    saveFavoriteItems(favorites);
}

function updateCartButtonText(bookId, isInCart) {
    const button = document.querySelector(`.add-to-cart-btn[data-book-id="${bookId}"]`);
    if (button) {
        button.textContent = isInCart ? 'Added to Cart' : 'Add to Cart';
        button.disabled = isInCart;
    }
}

async function loadSections() {
    const allBooks = await fetchAllBooks();
    const favoriteBooks = getFavoriteItems();
    const cartItems = getCartItems();

    const sectionsConfig = {
        'romantic': {
            containerId: 'romantic-books-container',
            countId: 'romantic-book-count',
            keywords: ['romance', 'romantic']
        },
        'science fiction': {
            containerId: 'science-fiction-books-container',
            countId: 'science-fiction-book-count',
            keywords: ['science fiction', 'sci-fi', 'futuristic', 'dystopian']
        },
        'fantasy': {
            containerId: 'fantasy-books-container',
            countId: 'fantasy-book-count',
            keywords: ['fantasy', 'epic', 'middle-earth', 'adventure']
        },
        'history': {
            containerId: 'history-books-container',
            countId: 'history-book-count',
            keywords: ['history', 'historical', 'ancient-wisdom']
        },
        'philosophy': {
            containerId: 'philosophy-books-container',
            countId: 'philosophy-book-count',
            keywords: ['philosophy', 'spiritual', 'spirituality', 'dreams']
        },
        'psychology': {
            containerId: 'psychology-books-container',
            countId: 'psychology-book-count',
            keywords: ['psychology', 'self-help', 'habits', 'productivity', 'personal-development', 'behavioral-economics']
        },
        'classic literature': {
            containerId: 'classic-literature-books-container',
            countId: 'classic-literature-book-count',
            keywords: ['classic', 'classic literature', 'coming-of-age', 'social-justice']
        }
    };

    const categorizedBooks = {};
    for (const key in sectionsConfig) {
        categorizedBooks[key] = [];
    }

    allBooks.forEach(book => {
        const bookTags = Array.isArray(book.tags) ? book.tags.map(tag => tag.toLowerCase()) : [];

        for (const sectionKey in sectionsConfig) {
            const keywords = sectionsConfig[sectionKey].keywords;
            const isMatch = keywords.some(keyword => bookTags.includes(keyword.toLowerCase()));

            if (isMatch) {
                categorizedBooks[sectionKey].push(book);
            }
        }
    });

    for (const sectionKey in sectionsConfig) {
        const config = sectionsConfig[sectionKey];
        const container = document.getElementById(config.containerId);
        const countSpan = document.getElementById(config.countId);

        if (container && countSpan) {
            const booksInSection = categorizedBooks[sectionKey];
            if (booksInSection.length > 0) {
                container.innerHTML = '';
                booksInSection.forEach(book => {
                    const isFavorited = favoriteBooks.includes(book.id);
                    const isInCart = cartItems.some(item => item.bookId === book.id);
                    container.innerHTML += renderBookCard(book, isFavorited, isInCart);
                });
                countSpan.textContent = `(${booksInSection.length} Books)`;
            } else {
                container.innerHTML = '<p class="empty-message">No books found in this section.</p>';
                countSpan.textContent = '(0 Books)';
            }
        }
    }

    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const bookId = parseInt(event.target.dataset.bookId);
            addToCart(bookId);
        });
    });

    document.querySelectorAll('.favorite-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const bookId = parseInt(event.currentTarget.dataset.bookId);
            toggleFavorite(bookId);
        });
    });
}

document.addEventListener('DOMContentLoaded', loadSections);
