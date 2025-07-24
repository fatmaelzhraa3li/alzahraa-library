// js/index.js

// الانتظار حتى يتم تحميل كل محتوى HTML في الصفحة
document.addEventListener('DOMContentLoaded', () => {

    // 1. جلب العناصر الأساسية من الـ DOM (Document Object Model)
    const booksContainer = document.getElementById('booksContainer');
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.querySelector('.search button'); // أو getElementById لو الزر له ID محدد

    // 2. تعريف رابط الـ API
    const API_URL = 'https://edu-me01.github.io/Json-Data/Digital-Library.json';

    // 3. تعريف متغيرات الحالة (State Variables)
    let allBooks = []; // مصفوفة لتخزين جميع الكتب التي سيتم جلبها من الـ API
    let favorites = JSON.parse(localStorage.getItem('favorites')) || []; // الكتب المفضلة
    // لا نحتاج لمتغير للسلة هنا، فقط دوال التعامل معها

    // --- وظائف مساعدة مشتركة (يمكن وضعها في ملف common.js إذا كانت تستخدم في أكثر من صفحة) ---

    /**
     * 4. دالة getCartItems()
     * تسترجع عناصر السلة من localStorage بأمان.
     */
    function getCartItems() {
        const cartItemsString = localStorage.getItem('cartItems');
        try {
            return cartItemsString ? JSON.parse(cartItemsString) : [];
        } catch (error) {
            console.error('Error parsing cart items from localStorage:', error);
            return [];
        }
    }

    /**
     * 5. دالة saveCartItems(items)
     * تحفظ عناصر السلة في localStorage.
     */
    function saveCartItems(items) {
        localStorage.setItem('cartItems', JSON.stringify(items));
    }

    // --- وظائف خاصة بصفحة Index ---

    /**
     * 6. دالة isBookFavorited(bookId)
     * تتحقق مما إذا كان الكتاب مفضلاً.
     * @param {string} bookId - المعرف الفريد للكتاب.
     * @returns {boolean} - true إذا كان الكتاب مفضلاً.
     */
    function isBookFavorited(bookId) {
        return favorites.some(favBook => favBook.id === bookId);
    }

    /**
     * 7. دالة toggleFavorite(book)
     * تضيف أو تزيل كتاباً من المفضلة وتحدث localStorage.
     * @param {object} book - كائن الكتاب المراد إضافته/إزالته.
     */
    function toggleFavorite(book) {
        const index = favorites.findIndex(favBook => favBook.id === book.id);

        if (index > -1) {
            favorites.splice(index, 1);
            alert(`"${book.title}" removed from favorites.`);
        } else {
            favorites.push(book);
            alert(`"${book.title}" added to favorites!`);
        }
        localStorage.setItem('favorites', JSON.stringify(favorites));

        // بعد تحديث المفضلة، أعد عرض الكتب لتحديث أيقونات القلب فورًا
        displayBooks(allBooks);
    }

    /**
     * 8. دالة addToCart(bookId)
     * تضيف كتابًا إلى سلة التسوق أو تزيد كميته إذا كان موجودًا بالفعل.
     * @param {number} bookId - معرف الكتاب المراد إضافته.
     */
    function addToCart(bookId) {
        let cart = getCartItems(); // جلب عناصر السلة الحالية
        const existingItemIndex = cart.findIndex(item => item.bookId === bookId);

        if (existingItemIndex > -1) {
            // إذا كان الكتاب موجودًا بالفعل في السلة، قم بزيادة الكمية
            cart[existingItemIndex].quantity += 1;
        } else {
            // إذا كان الكتاب غير موجود، قم بإضافته بكمية 1
            cart.push({ bookId: bookId, quantity: 1 });
        }
        saveCartItems(cart); // حفظ السلة المحدثة
        alert('Book added to cart successfully!'); // رسالة تأكيد للمستخدم
        // هنا يمكنك تحديث أيقونة أو عداد السلة في الـ Header لو موجود
    }

    /**
     * 9. دالة createBookCard(book)
     * تنشئ عنصر HTML (كارت الكتاب) بناءً على بيانات كتاب واحد.
     * @param {object} book - كائن الكتاب الذي يحتوي على تفاصيله.
     * @returns {HTMLElement} - عنصر الـ div الذي يمثل كارت الكتاب.
     */
    function createBookCard(book) {
        const bookCard = document.createElement('div');
        bookCard.classList.add('book-card');

        const img = document.createElement('img');
        img.src = book.coverImage || './images/book.jpg'; // مسار افتراضي لصورة بديلة
        img.alt = book.title;
        img.onerror = function() {
            this.onerror = null;
            this.src = './images/book.jpg'; // تأكد من المسار الصحيح للصورة البديلة
        };
        bookCard.appendChild(img);

        const title = document.createElement('h3');
        title.textContent = book.title;
        bookCard.appendChild(title);

        const author = document.createElement('p');
        author.textContent = `Author: ${book.author}`;
        bookCard.appendChild(author);

        const description = document.createElement('p');
        description.classList.add('description');
        description.textContent = book.description;
        bookCard.appendChild(description);

        const actionsDiv = document.createElement('div');
        actionsDiv.classList.add('actions');

        // زر "Add to Cart"
        const addToCartBtn = document.createElement('button');
        addToCartBtn.textContent = 'Add to Cart';
        addToCartBtn.classList.add('add-to-cart-btn');
        // هنا نربط الزر بدالة addToCart
        addToCartBtn.dataset.bookId = book.id; // تخزين معرف الكتاب في الزر
        addToCartBtn.addEventListener('click', (event) => {
            const bookId = parseInt(event.target.dataset.bookId); // استخراج معرف الكتاب
            addToCart(bookId); // استدعاء دالة إضافة الكتاب للسلة
        });
        actionsDiv.appendChild(addToCartBtn);

        // زر/أيقونة Favorite
        const favoriteBtn = document.createElement('button');
        favoriteBtn.classList.add('favorite-btn');
        const heartIcon = document.createElement('i');
        heartIcon.classList.add('fas', 'fa-heart');
        favoriteBtn.appendChild(heartIcon);

        if (isBookFavorited(book.id)) {
            favoriteBtn.classList.add('favorited');
        }

        favoriteBtn.addEventListener('click', () => {
            toggleFavorite(book);
            // لا حاجة لـ toggle هنا، `displayBooks` ستقوم بتحديثه
        });
        actionsDiv.appendChild(favoriteBtn);

        bookCard.appendChild(actionsDiv);

        return bookCard;
    }

    /**
     * 10. دالة displayBooks(booksToDisplay)
     * تعرض مجموعة من الكتب في الحاوية المخصصة لذلك.
     * @param {Array} booksToDisplay - مصفوفة الكتب المراد عرضها.
     */
    function displayBooks(booksToDisplay) {
        booksContainer.innerHTML = '';

        if (booksToDisplay.length === 0) {
            booksContainer.innerHTML = '<p style="text-align: center; width: 100%; font-size: 1.2em; color: #555; margin-top: 30px;">No books found matching your search.</p>';
            return;
        }

        booksToDisplay.forEach(book => {
            const card = createBookCard(book);
            booksContainer.appendChild(card);
        });
        // لا نحتاج لـ attachAddToCartListeners() منفصلة هنا
        // لأننا بنربط الـ event listener مباشرة داخل createBookCard
    }

    /**
     * 11. دالة fetchBooks()
     * لجلب بيانات الكتب من الـ API بشكل غير متزامن.
     */
    async function fetchBooks() {
        try {
            const response = await fetch(API_URL);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            allBooks = data.books; // تخزين جميع الكتب المسترجعة

            displayBooks(allBooks); // عرض جميع الكتب عند التحميل الأولي
        } catch (error) {
            console.error('Error fetching books:', error);
            booksContainer.innerHTML = '<p style="text-align: center; width: 100%; font-size: 1.2em; color: red; margin-top: 30px;">Failed to load books. Please try again later.</p>';
        }
    }

    /**
     * 12. دالة searchBooks()
     * تقوم بتصفية الكتب المعروضة بناءً على نص البحث المدخل من المستخدم.
     */
    function searchBooks() {
        const searchTerm = searchInput.value.toLowerCase().trim();

        if (!searchTerm) {
            displayBooks(allBooks);
            return;
        }

        const filteredBooks = allBooks.filter(book =>
            (book.title && book.title.toLowerCase().includes(searchTerm)) ||
            (book.author && book.author.toLowerCase().includes(searchTerm)) ||
            (book.description && book.description.toLowerCase().includes(searchTerm)) ||
            (book.category && book.category.toLowerCase().includes(searchTerm)) || // أضفت البحث في التصنيف
            (book.subcategory && book.subcategory.toLowerCase().includes(searchTerm)) || // وأيضاً في التصنيف الفرعي
            (book.tags && book.tags.some(tag => tag.toLowerCase().includes(searchTerm))) // وأيضاً في الـ tags
        );

        displayBooks(filteredBooks);
    }

    // --- ربط الوظائف بأحداث الواجهة (Event Listeners) ---

    // 13. عند النقر على زر البحث، يتم استدعاء دالة searchBooks
    searchButton.addEventListener('click', searchBooks);

    // 14. عند الضغط على مفتاح في حقل البحث، يتم التحقق إذا كان المفتاح هو 'Enter'
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchBooks();
        }
    });

    // 15. استدعاء دالة جلب الكتب عند تحميل الصفحة لأول مرة
    fetchBooks();
});
