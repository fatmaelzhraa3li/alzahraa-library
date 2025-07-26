document.addEventListener('DOMContentLoaded', () => {
    const booksContainer = document.getElementById('booksContainer');
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.querySelector('.search button');
    const API_URL = 'https://edu-me01.github.io/Json-Data/Digital-Library.json';

    let allBooks = [];
    let favorites = JSON.parse(localStorage.getItem('favoritesContainer')) || [];


    function getCartItems() {
        try {
            return JSON.parse(localStorage.getItem('cartItems')) || [];
        } catch {
            return [];
        }
    }

    function saveCartItems(items) {
        localStorage.setItem('cartItems', JSON.stringify(items));
    }

    function isBookFavorited(bookId) {
        return favorites.some(book => book.id === bookId);
    }

    function toggleFavorite(book) {
        const index = favorites.findIndex(fav => fav.id === book.id);

        if (index > -1) {
            favorites.splice(index, 1);
            Swal.fire({
                icon: 'info',
                title: 'Removed from Favorites',
                text: '${book.title} removed.' ,
                timer: 1200,
                showConfirmButton: false
            });
        } else {
            favorites.push(book);
            Swal.fire({
                icon: 'success',
                title: 'Added to Favorites',
                text: '${book.title} added to your favorites.' ,
                timer: 1200,
                showConfirmButton: false
            });
        }

        localStorage.setItem('favorites', JSON.stringify(favorites));
        displayBooks(allBooks);
    }

    function addToCart(bookId) {
        let cart = getCartItems();
        const index = cart.findIndex(item => item.bookId === bookId);

        if (index > -1) {
            cart[index].quantity += 1;
        } else {
            cart.push({ bookId: bookId, quantity: 1 });
        }

        saveCartItems(cart);

        Swal.fire({
            icon: 'success',
            title: 'Added to Cart',
            text: 'Book added to your cart!',
            timer: 1200,
            showConfirmButton: false
        });
    }

    function createBookCard(book) {
        const card = document.createElement('div');
        card.classList.add('book-card');

        const img = document.createElement('img');
        img.src = book.coverImage || '../images/book.png';
        img.alt = book.title;
        img.onerror = () => img.src = '../images/book.png';
        card.appendChild(img);

        const title = document.createElement('h3');
        title.textContent = book.title;
        card.appendChild(title);

        const author = document.createElement('p');
        author.textContent = 'Author: ${book.author}';
        card.appendChild(author);

        const description = document.createElement('p');
        description.classList.add('description');
        description.textContent = book.description;
        card.appendChild(description);

        const actions = document.createElement('div');
        actions.classList.add('actions');

        const addToCartBtn = document.createElement('button');
        addToCartBtn.className = 'add-to-cart-btn';
        addToCartBtn.textContent = 'Add to Cart';
        addToCartBtn.addEventListener('click', () => addToCart(book.id));
        actions.appendChild(addToCartBtn);

        const favoriteBtn = document.createElement('button');
        favoriteBtn.className = 'favorite-btn';
        const heartIcon = document.createElement('i');
        heartIcon.classList.add('fas', 'fa-heart');
        favoriteBtn.appendChild(heartIcon);
        if (isBookFavorited(book.id)) {
            favoriteBtn.classList.add('favorited');
        }

        favoriteBtn.addEventListener('click', () => toggleFavorite(book));
        actions.appendChild(favoriteBtn);

        card.appendChild(actions);

        return card;
    }

    function displayBooks(books) {
        booksContainer.innerHTML = '';


if (books.length === 0) {
    booksContainer.innerHTML ='<p style="text-align: center; width: 100%; font-size: 1.2em; color: #555; margin-top: 30px;">No books found.</p>';
    return;
}

books.forEach(book => {
    const card = createBookCard(book);
    booksContainer.appendChild(card);
});
}

async function fetchBooks() {
try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error('HTTP error! status: ${res.status}');
    const data = await res.json();
    allBooks = data.books;
    displayBooks(allBooks);
} catch (error) {
    console.error('Fetch Error:', error);
    booksContainer.innerHTML = '<p style="text-align: center; color: red;">Failed to load books.</p>';
}
}

function searchBooks() {
const term = searchInput.value.toLowerCase().trim();
if (!term) return displayBooks(allBooks);

const filtered = allBooks.filter(book =>
    (book.title && book.title.toLowerCase().includes(term)) ||
    (book.author && book.author.toLowerCase().includes(term)) ||
    (book.description && book.description.toLowerCase().includes(term)) ||
    (book.category && book.category.toLowerCase().includes(term)) ||
    (book.subcategory && book.subcategory.toLowerCase().includes(term)) ||
    (book.tags && book.tags.some(tag => tag.toLowerCase().includes(term)))
);

displayBooks(filtered);
}

searchButton?.addEventListener('click', searchBooks);
searchInput?.addEventListener('keypress', e => {
if (e.key === 'Enter') searchBooks();
});

fetchBooks();
});