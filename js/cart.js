// Function to safely parse JSON from localStorage
// دالة لتحليل بيانات JSON من localStorage بأمان
function getCartItems() {
    const cartItemsString = localStorage.getItem('cartItems');
    try {
        // Attempt to parse the string as JSON. If it's empty or invalid, return an empty array.
        // محاولة تحليل السلسلة كنص JSON. إذا كانت فارغة أو غير صالحة، قم بإرجاع مصفوفة فارغة.
        return cartItemsString ? JSON.parse(cartItemsString) : [];
    } catch (error) {
        // Log the error for debugging purposes if parsing fails
        // تسجيل الخطأ لأغراض التصحيح إذا فشل التحليل
        console.error('Error parsing cart items from localStorage:', error);
        return []; // Return empty array to prevent further errors
        // إرجاع مصفوفة فارغة لمنع حدوث المزيد من الأخطاء
    }
}

// Function to save cart items to localStorage
// دالة لحفظ عناصر سلة التسوق في localStorage
function saveCartItems(items) {
    localStorage.setItem('cartItems', JSON.stringify(items));
}

// Function to fetch book data from the API
// دالة لجلب بيانات الكتب من الـ API
async function fetchBookData(bookId) {
    try {
        const response = await fetch('https://edu-me01.github.io/Json-Data/Digital-Library.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        // Find the specific book by its ID within the 'books' array
        // البحث عن الكتاب المحدد بواسطة معرّفه (ID) داخل مصفوفة 'books'
        return data.books.find(book => book.id === bookId);
    } catch (error) {
        console.error('Error fetching book data:', error);
        return null; // Return null if fetching or finding fails
        // إرجاع قيمة خالية إذا فشل الجلب أو البحث
    }
}

// Function to render (display) cart items on the page
// دالة لعرض عناصر سلة التسوق في الصفحة
async function renderCart() {
    const cartItemsContainer = document.getElementById('cartItemsContainer');
    const emptyCartMessage = document.getElementById('emptyCartMessage');
    const totalItemsSpan = document.getElementById('totalItems');
    const totalPriceSpan = document.getElementById('totalPrice');

    const cart = getCartItems(); // Get current items from localStorage
    // الحصول على العناصر الحالية من localStorage

    // Show/hide empty cart message
    // إظهار/إخفاء رسالة "السلة فارغة"
    if (cart.length === 0) {
        emptyCartMessage.style.display = 'block';
        cartItemsContainer.innerHTML = ''; // Clear any existing items
        // مسح أي عناصر موجودة
        totalItemsSpan.textContent = '0';
        totalPriceSpan.textContent = '$0.00'; // Ensure total price is 0.00 when cart is empty
        // تأكد أن السعر الإجمالي هو 0.00 عندما تكون السلة فارغة
        return; // Exit if cart is empty
        // الخروج إذا كانت السلة فارغة
    } else {
        emptyCartMessage.style.display = 'none';
    }

    // Clear previous items before re-rendering
    // مسح العناصر السابقة قبل إعادة العرض
    cartItemsContainer.innerHTML = '';

    let totalItemsCount = 0;
    let overallTotalPrice = 0;

    // *** هنا تحديد السعر الافتراضي ***
    // Default price for a book if 'price' property is not found in the API data.
    // سعر افتراضي للكتاب إذا لم يتم العثور على خاصية 'price' في بيانات الـ API.
    const DEFAULT_BOOK_PRICE = 15.00; 

    // Loop through each item in the cart
    // التكرار على كل عنصر في السلة
    for (const item of cart) {
        // Fetch full book details using its ID from the API
        // جلب تفاصيل الكتاب الكاملة باستخدام معرّفه (ID) من الـ API
        const bookDetails = await fetchBookData(item.bookId);

        if (bookDetails) { // If book details are successfully fetched
            // Determine the price: use bookDetails.price if available, otherwise use DEFAULT_BOOK_PRICE.
            // تحديد السعر: استخدم bookDetails.price إذا كان متاحًا، وإلا استخدم السعر الافتراضي.
            const itemPrice = bookDetails.price ? bookDetails.price : DEFAULT_BOOK_PRICE;
            const itemTotalPrice = itemPrice * item.quantity; // Calculate total price for this item
            // حساب السعر الإجمالي لهذا العنصر

            totalItemsCount += item.quantity;
            overallTotalPrice += itemTotalPrice;

            const cartItemDiv = document.createElement('div');
            cartItemDiv.classList.add('cart-item');
            // Store bookId on the element for easy access in event listeners
            // تخزين معرّف الكتاب على العنصر لسهولة الوصول إليه في مستمعي الأحداث
            cartItemDiv.dataset.bookId = item.bookId;

            // Image handling: use coverImage from API, or a fallback if not available
            // التعامل مع الصور: استخدم coverImage من الـ API، أو صورة بديلة إذا لم تكن متاحة
            const imageUrl = bookDetails.coverImage || './images/book.jpg'; // Corrected relative path
            // مسار نسبي مصحح

            cartItemDiv.innerHTML = `
                <img src="${imageUrl}" alt="${bookDetails.title}" class="cart-item-image">
                <div class="cart-item-details">
                    <h4>${bookDetails.title}</h4>
                    <p>Author: ${bookDetails.author}</p>
                    <div class="quantity-controls">
                        <button class="quantity-minus" data-book-id="${item.bookId}">-</button>
                        <input type="number" class="item-quantity" value="${item.quantity}" min="1" data-book-id="${item.bookId}">
                        <button class="quantity-plus" data-book-id="${item.bookId}">+</button>
                    </div>
                    <button class="remove-item-btn" data-book-id="${item.bookId}">Remove</button>
                </div>
                <span class="cart-item-price">$${itemPrice.toFixed(2)}</span>
            `;
            // Display price formatted to two decimal places
            // عرض السعر منسقًا إلى رقمين عشريين

            cartItemsContainer.appendChild(cartItemDiv);
        }
    }

    // Update summary totals
    // تحديث الإجماليات في الملخص
    totalItemsSpan.textContent = totalItemsCount;
    totalPriceSpan.textContent = `$${overallTotalPrice.toFixed(2)}`;

    // Add event listeners for quantity changes and remove buttons after rendering
    // إضافة مستمعي الأحداث لتغييرات الكمية وأزرار الإزالة بعد العرض
    attachCartEventListeners();
}

// Function to attach event listeners to cart items
// دالة لإرفاق مستمعي الأحداث بعناصر السلة
function attachCartEventListeners() {
    // Quantity input change listener (if user types directly into the input field)
    // مستمع لتغيير الكمية (إذا قام المستخدم بالكتابة مباشرة في حقل الإدخال)
    document.querySelectorAll('.item-quantity').forEach(input => {
        input.onchange = (event) => {
            const bookId = parseInt(event.target.dataset.bookId);
            const newQuantity = parseInt(event.target.value);
            updateCartItemQuantity(bookId, newQuantity);
        };
    });

    // Quantity plus button listener
    // مستمع لزر الزيادة (+)
    document.querySelectorAll('.quantity-plus').forEach(button => {
        button.onclick = (event) => {
            const bookId = parseInt(event.target.dataset.bookId);
            // Find the corresponding quantity input field for this book
            // البحث عن حقل إدخال الكمية المطابق لهذا الكتاب
            const quantityInput = document.querySelector(`.item-quantity[data-book-id="${bookId}"]`);
            let newQuantity = parseInt(quantityInput.value) + 1; // Increment quantity
            // زيادة الكمية
            updateCartItemQuantity(bookId, newQuantity);
        };
    });

    // Quantity minus button listener
    // مستمع لزر النقصان (-)
    document.querySelectorAll('.quantity-minus').forEach(button => {
        button.onclick = (event) => {
            const bookId = parseInt(event.target.dataset.bookId);
            // Find the corresponding quantity input field for this book
            // البحث عن حقل إدخال الكمية المطابق لهذا الكتاب
            const quantityInput = document.querySelector(`.item-quantity[data-book-id="${bookId}"]`);
            let newQuantity = parseInt(quantityInput.value) - 1; // Decrement quantity
            // إنقاص الكمية
            updateCartItemQuantity(bookId, newQuantity);
        };
    });

    // Remove button listener
    // مستمع لزر الإزالة
    document.querySelectorAll('.remove-item-btn').forEach(button => {
        button.onclick = (event) => {
            const bookId = parseInt(event.target.dataset.bookId);
            removeCartItem(bookId);
        };
    });
}

// Function to update item quantity in cart
// دالة لتحديث كمية العنصر في السلة
function updateCartItemQuantity(bookId, newQuantity) {
    let cart = getCartItems();
    const itemIndex = cart.findIndex(item => item.bookId === bookId);

    if (itemIndex > -1) {
        if (newQuantity > 0) {
            cart[itemIndex].quantity = newQuantity;
        } else {
            // If quantity is 0 or less, remove the item from the cart
            // إذا كانت الكمية 0 أو أقل، قم بإزالة العنصر من السلة
            cart.splice(itemIndex, 1);
        }
        saveCartItems(cart); // Save updated cart
        renderCart(); // Re-render the cart to reflect changes
        // إعادة عرض السلة لعكس التغييرات
    }
}

// Function to remove item from cart
// دالة لإزالة عنصر من السلة
function removeCartItem(bookId) {
    let cart = getCartItems();
    cart = cart.filter(item => item.bookId !== bookId); // Filter out the item to be removed
    // تصفية (إزالة) العنصر المراد حذفه
    saveCartItems(cart); // Save updated cart
    renderCart(); // Re-render the cart
}

// Event listener for checkout button
// مستمع الحدث لزر "التقدم لإتمام الشراء"
document.getElementById('checkoutBtn').addEventListener('click', () => {
    alert('Proceeding to checkout! (This is a placeholder action)');
    // In a real application, you would navigate to a checkout page or process the order
    // في تطبيق حقيقي، ستقوم بالانتقال إلى صفحة الدفع أو معالجة الطلب
    // Optionally, clear the cart after checkout
    // اختياريًا، قم بتفريغ السلة بعد إتمام الشراء
    // saveCartItems([]);
    // renderCart();
});

// Initial render of the cart when the page loads
// العرض الأولي للسلة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', renderCart);
