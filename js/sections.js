document.addEventListener('DOMContentLoaded', () => {

    // الرابط الفعلي للـ API الذي قدمته
    const API_DATA_URL = 'https://edu-me01.github.io/Json-Data/Digital-Library.json';

    // وظيفة لتحويل اسم الفئة إلى ID حاوية الكتب الداخلية
    const getContainerIdFromCategory = (categoryName) => {
        // تحويل "Science Fiction" إلى "science-fiction-books-container"
        return `${categoryName.toLowerCase().replace(/\s/g, '-')}-books-container`;
    };

    // وظيفة لتحويل اسم الفئة إلى ID عداد الكتب
    const getBookCountIdFromCategory = (categoryName) => {
        // تحويل "Romantic" إلى "romantic-book-count"
        return `${categoryName.toLowerCase().replace(/\s/g, '-')}-book-count`;
    };

    // وظيفة لإنشاء بطاقة كتاب واحدة
    const createBookCard = (book) => {
        const bookCard = document.createElement('div');
        bookCard.classList.add('book-card');
        bookCard.setAttribute('data-book-id', book.id);

        const isFavorited = localStorage.getItem(`favorite-${book.id}`) === 'true';

        bookCard.innerHTML = `
            <img src="${book.image || 'https://via.placeholder.com/200x250?text=No+Image'}"
                 alt="${book.title} Cover" class="book-cover">
            <div class="book-info">
                <h3 class="book-title">${book.title}</h3>
                <p class="book-author">${book.author}</p>
                <p class="book-price">${book.price ? book.price.toFixed(2) + ' EGP' : 'N/A'}</p>
            </div>
            <div class="card-actions">
                <button class="add-to-cart-btn" data-book-id="${book.id}">Add to Cart</button>
                <button class="favorite-btn ${isFavorited ? 'favorited' : ''}" data-book-id="${book.id}">
                    <i class="${isFavorited ? 'fas' : 'far'} fa-heart"></i>
                </button>
            </div>
        `;
        return bookCard;
    };

    // وظيفة لعرض الكتب في قسم معين (باستخدام ID حاوية الكتب الداخلية) وتحديث العدد
    const displayBooksInSpecificContainer = (containerId, booksArray, categoryName) => {
        const container = document.getElementById(containerId);
        if (!container) {
            console.warn(`Container with ID '${containerId}' not found in HTML.`);
            return;
        }

        container.innerHTML = ''; // مسح المحتوى القديم (مثل رسالة "Loading...")

        if (booksArray && booksArray.length > 0) {
            booksArray.forEach(book => {
                container.appendChild(createBookCard(book));
            });
        } else {
            container.innerHTML = '<p style="text-align: center; width: 100%; color: #666;">No books available in this section.</p>';
        }

        // !!! تحديث عدد الكتب الآن !!!
        const bookCountSpanId = getBookCountIdFromCategory(categoryName);
        const bookCountSpan = document.getElementById(bookCountSpanId);
        if (bookCountSpan) {
            bookCountSpan.textContent = `(${booksArray ? booksArray.length : 0} Books)`;
        }
    };

    // وظيفة لجلب جميع البيانات (الفئات والكتب) من الـ API وتوزيعها
    const fetchAndDistributeData = async () => {
        let allCategoriesFromAPI = [];
        let allBooks = [];

        try {
            // تحديث رسائل التحميل لجميع حاويات الكتب
            document.querySelectorAll('.books-container').forEach(container => {
                container.innerHTML = '<p style="text-align: center; width: 100%; color: #888;">جاري تحميل الكتب...</p>';
            });

            const response = await fetch(API_DATA_URL);
            if (!response.ok) {
                throw new Error(`خطأ في الشبكة! الحالة: ${response.status} - لا يمكن جلب البيانات من ${API_DATA_URL}`);
            }
            const data = await response.json();

            allCategoriesFromAPI = data.categories || [];
            allBooks = data.books || [];

            console.log('Data fetched from API:', data);

        } catch (error) {
            console.error('حدث خطأ أثناء جلب البيانات من API:', error);
            document.querySelectorAll('.books-container').forEach(container => {
                container.innerHTML = '<p style="color: red; text-align: center; width: 100%;">عذرًا، فشل تحميل الكتب. الرجاء المحاولة لاحقًا.</p>';
            });
            return;
        }

        // 1. تجميع الكتب حسب الفئة (genre)
        const categorizedBooks = {};
        allBooks.forEach(book => {
            if (book.genre) {
                if (!categorizedBooks[book.genre]) {
                    categorizedBooks[book.genre] = [];
                }
                categorizedBooks[book.genre].push(book);
            }
        });

        // 2. عرض الكتب في الأقسام المناسبة وتحديث العدد
        document.querySelectorAll('.book-section').forEach(section => {
            // انتبه: هنا نحصل على اسم الفئة من النص المباشر لـ h3.section-title
            const sectionTitleElement = section.querySelector('.section-title');
            if (sectionTitleElement) {
                // للوصول إلى اسم الفئة "Romance" فقط، سنتجاهل الـ span الخاص بالعدد مؤقتًا
                // أو الأفضل، في الـ HTML، ضع Romance داخل span أول، والعدد في span ثانٍ.
                // بناءً على آخر HTML أرسلته (h3>Romance<)، هذه الطريقة ستعمل:
                const categoryNameSpan = sectionTitleElement.querySelector('span:first-child'); // ابحث عن أول سبان (اسم الفئة)
                let categoryName;

                if (categoryNameSpan) {
                    categoryName = categoryNameSpan.textContent.trim();
                } else {
                    // إذا لم يكن هناك سبان، فافترض أن النص المباشر لـ h3 هو اسم الفئة
                    categoryName = sectionTitleElement.textContent.trim();
                    // قد تحتاج لإزالة أي نص بين الأقواس إذا كان موجودًا
                    const match = categoryName.match(/(.*?)\s*\(.*?\)/); // يطابق "النص (أي شيء)"
                    if (match && match[1]) {
                        categoryName = match[1].trim(); // يأخذ الجزء قبل القوسين
                    }
                }


                const containerId = getContainerIdFromCategory(categoryName);
                const booksForCategory = categorizedBooks[categoryName] || [];
                
                // !!! التعديل المهم هنا: تمرير categoryName إلى دالة العرض !!!
                displayBooksInSpecificContainer(containerId, booksForCategory, categoryName);
            }
        });

        // 3. إضافة مستمعي الأحداث لأزرار السلة والمفضلة بعد عرض كل الكتب
        addCardEventListeners();
    };

    // وظيفة لإضافة مستمعي الأحداث (click) لأزرار السلة والمفضلة
    const addCardEventListeners = () => {
        document.querySelectorAll('.add-to-cart-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const bookId = event.currentTarget.dataset.bookId;
                console.log(`Book ID ${bookId} added to cart!`);
                alert(`"${bookId}" added to cart!`);
            });
        });

        document.querySelectorAll('.favorite-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const bookId = event.currentTarget.dataset.bookId;
                const icon = event.currentTarget.querySelector('i');

                if (event.currentTarget.classList.contains('favorited')) {
                    event.currentTarget.classList.remove('favorited');
                    icon.classList.remove('fas');
                    icon.classList.add('far');
                    localStorage.removeItem(`favorite-${bookId}`);
                    console.log(`Book ID ${bookId} removed from favorites.`);
                } else {
                    event.currentTarget.classList.add('favorited');
                    icon.classList.remove('far');
                    icon.classList.add('fas');
                    localStorage.setItem(`favorite-${bookId}`, 'true');
                    console.log(`Book ID ${bookId} added to favorites!`);
                }
            });
        });
    };

    // وظيفة تهيئة الصفحة: جلب وعرض كل شيء
    const initializePage = () => {
        fetchAndDistributeData(); // جلب الكتب وتوزيعها
    };

    // بدء تهيئة الصفحة عند تحميل DOM
    initializePage();
});
