// favorites.js

document.addEventListener('DOMContentLoaded', () => {
    const emptyFavorites = document.getElementById('emptyFavorites');
    const favoritesContainer = document.getElementById('favoritesContainer');

    const API_URL = 'https://edu-me01.github.io/Json-Data/Digital-Library.json';

    // ** الدوال المساعدة (Helper Functions) - موحدة مع sections.js/index.js **

    // دالة لجلب IDs الكتب المفضلة من Local Storage
    function getFavoriteBookIds() {
        const favoritesString = localStorage.getItem('favoriteBooks');
        try {
            return favoritesString ? JSON.parse(favoritesString) : [];
        } catch (error) {
            console.error('Error parsing favorite book IDs from localStorage:', error);
            return [];
        }
    }

    // دالة لحفظ IDs الكتب المفضلة في Local Storage
    function saveFavoriteBookIds(ids) {
        localStorage.setItem('favoriteBooks', JSON.stringify(ids));
    }

    // دالة لجلب عناصر سلة التسوق من Local Storage (جديدة هنا لكي يعمل زر السلة)
    function getCartItems() {
        const cartItemsString = localStorage.getItem('cartItems');
        try {
            return cartItemsString ? JSON.parse(cartItemsString) : [];
        } catch (error) {
            console.error('Error parsing cart items from localStorage:', error);
            return [];
        }
    }

    // دالة لحفظ عناصر سلة التسوق في Local Storage (جديدة هنا لكي يعمل زر السلة)
    function saveCartItems(items) {
        localStorage.setItem('cartItems', JSON.stringify(items));
    }

    async function fetchAllBooks() {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data.books || [];
        } catch (error) {
            console.error('Error fetching all books from API:', error);
            return [];
        }
    }

    // دالة لإنشاء كارت (بطاقة) كتاب واحد
    // تم تعديلها لإعادة إضافة زر "Add to Cart" والتعامل مع زر المفضلة كـ "toggle"
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
                <div class="actions">
                    <button class="add-to-cart-btn" data-book-id="${book.id}" ${isInCart ? 'disabled' : ''}>
                        ${isInCart ? 'Added to Cart' : 'Add to Cart'}
                    </button>
                    <button class="favorite-btn ${isFavorited ? 'favorited' : ''}" data-book-id="${book.id}">
                        <i class="fas fa-heart"></i>
                    </button>
                </div>
            </div>
        `;
    }

    // دالة لإضافة كتاب إلى سلة التسوق (نسخة من sections.js/index.js)
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
        alert('Book added to cart!'); // يمكنك تغيير هذا إلى توست أو أي إشعار آخر
    }

    // دالة لتبديل حالة الإضافة للمفضلة (إضافة/إزالة) (نسخة من sections.js/index.js)
    function toggleFavorite(bookId) {
        let favorites = getFavoriteBookIds();
        const index = favorites.indexOf(bookId);
        // لا نحتاج للبحث عن الزر هنا لأننا سنعيد رسم الصفحة بعد التغيير
        
        if (index > -1) {
            favorites.splice(index, 1); // إذا كان موجوداً، أزله
        } else {
            favorites.push(bookId); // إذا لم يكن موجوداً، أضفه
        }
        saveFavoriteBookIds(favorites); // حفظ المفضلة المحدثة
        displayFavorites(); // إعادة عرض قائمة المفضلة بعد التغيير
    }

    // دالة لتحديث نص زر "Add to Cart" وحالته (نسخة من sections.js/index.js)
    function updateCartButtonText(bookId, isInCart) {
        const button = document.querySelector(`.add-to-cart-btn[data-book-id="${bookId}"]`);
        if (button) {
            button.textContent = isInCart ? 'Added to Cart' : 'Add to Cart';
            button.disabled = isInCart;
        }
    }

    // دالة لعرض الكتب المفضلة
    async function displayFavorites() {
        favoritesContainer.innerHTML = ''; // مسح المحتوى الحالي
        
        const favoriteBookIds = getFavoriteBookIds(); // جلب الـ IDs المفضلة
        const cartItems = getCartItems(); // جلب عناصر السلة لـ "Add to Cart"
        const allBooks = await fetchAllBooks(); // جلب جميع الكتب من الـ API

        // تصفية الكتب المجلوبة من الـ API بناءً على الـ IDs المفضلة
        const favoriteBooks = allBooks.filter(book => favoriteBookIds.includes(book.id));

        if (favoriteBooks.length === 0) {
            emptyFavorites.style.display = 'block';
            favoritesContainer.style.display = 'none';
        } else {
            emptyFavorites.style.display = 'none';
            favoritesContainer.style.display = 'flex';
            favoritesContainer.style.flexWrap = 'wrap';
            favoritesContainer.style.gap = '30px';
            favoritesContainer.style.justifyContent = 'center';

            favoriteBooks.forEach(book => {
                const isFavorited = true; // في صفحة المفضلة، الكتاب المعروض هو مفضل دائماً
                const isInCart = cartItems.some(item => item.bookId === book.id);
                const cardHtml = renderBookCard(book, isFavorited, isInCart); // استخدام renderBookCard العادية
                favoritesContainer.insertAdjacentHTML('beforeend', cardHtml);
            });

            // إضافة مستمعي الأحداث لأزرار "Add to Cart"
            document.querySelectorAll('.add-to-cart-btn').forEach(button => {
                button.addEventListener('click', (event) => {
                    const bookId = parseInt(event.target.dataset.bookId);
                    addToCart(bookId);
                });
            });

            // إضافة مستمعي الأحداث لأزرار "Favorite" (لتبديل الحالة)
            document.querySelectorAll('.favorite-btn').forEach(button => {
                button.addEventListener('click', (event) => {
                    const bookId = parseInt(event.currentTarget.dataset.bookId);
                    toggleFavorite(bookId);
                });
            });
        }
    }

    // استدعاء دالة عرض المفضلة عند تحميل الصفحة لأول مرة
    displayFavorites();
});
