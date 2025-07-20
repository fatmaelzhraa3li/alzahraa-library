document.addEventListener("DOMContentLoaded", () => {
  const booksContainer = document.getElementById("booksContainer");
  
  fetch("https://edu-me01.github.io/Json-Data/Digital-Library.json")
    .then(response => {
      if (!response.ok) throw new Error("فشل تحميل البيانات");
      return response.json();
    })
    .then(data => {
      const books = data.books;
      if (!books || !Array.isArray(books)) throw new Error("البيانات غير صالحة");
      
      books.forEach(book => {
        const card = document.createElement("div");
        card.className = "book-card";
        
        // صورة الغلاف
        const img = document.createElement("img");
        img.alt = "غلاف الكتاب";
        img.src = book.cover || "https://via.placeholder.com/220x300?text=No+Image";
        img.onerror = () => {
          img.src = "https://via.placeholder.com/220x300?text=No+Image";
        };
        
        // اسم الكتاب
        const title = document.createElement("h3");
        title.textContent = book.title;
        
        // المؤلف
        const author = document.createElement("p");
        author.textContent = "📚 المؤلف: " + (book.author || "غير معروف");
        
        // الوصف (لو موجود)
        const description = document.createElement("p");
        description.textContent = book.description || "";
        
        card.append(img, title, author, description);
        booksContainer.appendChild(card);
      });
    })
    .catch(error => {
      booksContainer.innerHTML = `<p style="color:red;">${error.message}</p>`;
      console.error(error);
    });
});