document.addEventListener("DOMContentLoaded", () => {
    // --- Variables del Modal ---
    const modalOverlay = document.getElementById('modal-overlay');
    const modalCloseBtn = document.getElementById('modal-close');
    
    // --- Contenido del Modal ---
    const modalImg = document.getElementById('modal-img');
    const modalName = document.getElementById('modal-name');
    const modalPrice = document.getElementById('modal-price');

    // --- Grupos de Formularios ---
    const formSizeStandard = document.getElementById('form-size-standard');
    const formSizeCustom = document.getElementById('form-size-custom');
    const formPackaging = document.getElementById('form-packaging');
    
    // --- Grupos de Instrucciones ---
    const instructionsStandard = document.getElementById('instructions-standard');
    const instructionsCustom = document.getElementById('instructions-custom');

    // --- Inputs Estándar (Tamaño) ---
    const radioSize10cm = document.getElementById('size-standard-10');
    const radioSizeCustom = document.getElementById('size-standard-custom');
    const textSizeCustom = document.getElementById('size-standard-custom-text');
    
    // --- Inputs Personalizados (Tamaño) ---
    const modalSizeCustomInput = document.getElementById('modal-size-custom');
    
    // --- Inputs de Empaque (Unificados) ---
    const modalPackagingSelect = document.getElementById('modal-packaging-select');

    // --- Botones de Acción ---
    const waButton = document.getElementById('modal-wa-btn');
    const igButton = document.getElementById('modal-ig-btn');
    const modalAddToCartBtn = document.getElementById('modal-add-to-cart'); // MOVIDO AQUÍ

    const productLinks = document.querySelectorAll('.product-link');
    
    let currentProductName = "";
    let currentProductType = "standard";
    
    // --- Nuevas variables para funcionalidades mejoradas ---
    let cart = [];
    let favorites = [];
    const searchInput = document.getElementById('search-input');
    const filterButtons = document.querySelectorAll('.nav-btn');
    const cartCounter = document.querySelector('.cart-counter');
    const cartContainer = document.querySelector('.cart-container');
    const cartSidebar = document.getElementById('cart-sidebar');
    const overlay = document.getElementById('overlay');
    const closeCartBtn = document.getElementById('close-cart');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalElement = document.getElementById('cart-total');
    const checkoutBtn = document.getElementById('checkout-btn');
    const continueShoppingBtn = document.getElementById('continue-shopping');
    const favoritesMessage = document.getElementById('favorites-message');
    
    // --- Función para inicializar todas las funcionalidades ---
    function init() {
        loadCartFromStorage();
        loadFavoritesFromStorage();
        updateCartCounter();
        setupEventListeners();
    }
    
    // --- Configurar todos los event listeners ---
    function setupEventListeners() {
        // Event listeners existentes
        productLinks.forEach(link => {
            link.addEventListener('click', openModal);
        });

        modalCloseBtn.addEventListener('click', closeModal);
        modalOverlay.addEventListener('click', (event) => {
            if (event.target === modalOverlay) {
                closeModal();
            }
        });
        
        // Listeners de formularios
        radioSize10cm.addEventListener('change', toggleCustomSize);
        radioSizeCustom.addEventListener('change', toggleCustomSize);
        
        waButton.addEventListener('click', sendWhatsApp);
        igButton.addEventListener('click', sendInstagram);
        
        // Nuevos event listeners
        if (searchInput) {
            searchInput.addEventListener('input', filterProducts);
        }
        
        if (filterButtons.length > 0) {
            filterButtons.forEach(button => {
                button.addEventListener('click', filterByCategory);
            });
        }
        
        if (cartContainer) {
            cartContainer.addEventListener('click', toggleCart);
        }
        
        if (closeCartBtn) {
            closeCartBtn.addEventListener('click', toggleCart);
        }
        
        if (overlay) {
            overlay.addEventListener('click', toggleCart);
        }
        
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', proceedToCheckout);
        }
        
        if (continueShoppingBtn) {
            continueShoppingBtn.addEventListener('click', toggleCart);
        }
        
        // Listeners para validación en tiempo real
        if (modalSizeCustomInput) {
            modalSizeCustomInput.addEventListener('input', updateAddToCartButton);
        }
        if (textSizeCustom) {
            textSizeCustom.addEventListener('input', updateAddToCartButton);
        }
        if (modalPackagingSelect) {
            modalPackagingSelect.addEventListener('change', updateAddToCartButton);
        }
        if (radioSize10cm) {
            radioSize10cm.addEventListener('change', updateAddToCartButton);
        }
        if (radioSizeCustom) {
            radioSizeCustom.addEventListener('change', updateAddToCartButton);
        }

        // Listener para el botón de añadir al carrito en el modal
        if (modalAddToCartBtn) {
            modalAddToCartBtn.addEventListener('click', addToCartFromModal);
        }
        
        // Event delegation para botones de favoritos y agregar al carrito
        document.addEventListener('click', function(e) {
            // Botones de favoritos
            if (e.target.closest('.favorite-btn')) {
                e.preventDefault();
                const productCard = e.target.closest('.product-card');
                const productName = productCard.querySelector('h3').textContent;
                const productPrice = productCard.querySelector('.precio').textContent;
                const productImg = productCard.querySelector('img').src;
                
                toggleFavorite(productName, productPrice, productImg, e.target.closest('.favorite-btn'));
            }
            
            // Botones de agregar al carrito
            if (e.target.closest('.add-to-cart-btn')) {
                e.preventDefault();
                const productCard = e.target.closest('.product-card');
                const productName = productCard.querySelector('h3').textContent;
                const productPrice = productCard.querySelector('.precio').textContent;
                const productImg = productCard.querySelector('img').src;
                
                addToCart(productName, productPrice, productImg);
                
                // Animación de confirmación
                const btn = e.target.closest('.add-to-cart-btn');
                const originalText = btn.innerHTML;
                btn.innerHTML = '✓';
                btn.style.color = 'white';
                btn.style.backgroundColor = '#25D366';
                
                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.style.color = '';
                    btn.style.backgroundColor = '';
                }, 1500);
            }
            
            // Botones de ver detalles
            if (e.target.closest('.view-btn')) {
                e.preventDefault();
                const btn = e.target.closest('.view-btn');
                if (btn.classList.contains('product-link')) {
                    openModal.call(btn, e);
                }
            }
        });
    }
    
    // --- Funcionalidad de búsqueda ---
    function filterProducts() {
        const searchTerm = searchInput.value.toLowerCase();
        const productCards = document.querySelectorAll('.product-card');
        
        productCards.forEach(card => {
            const productName = card.querySelector('h3').textContent.toLowerCase();
            
            if (productName.includes(searchTerm)) {
                card.style.display = 'block';
                card.classList.add('fade-in');
            } else {
                card.style.display = 'none';
            }
        });
    }
    
    // --- Funcionalidad de filtrado por categoría ---
    function filterByCategory(e) {
        const category = e.target.dataset.category;
        
        // Actualizar botones activos
        filterButtons.forEach(btn => {
            btn.classList.remove('active');
        });
        e.target.classList.add('active');
        
        const productCards = document.querySelectorAll('.product-card');
        
        if (category === 'all') {
            productCards.forEach(card => {
                card.style.display = 'block';
                card.classList.add('fade-in');
            });
        } else {
            productCards.forEach(card => {
                const productCategory = card.dataset.category;
                
                if (productCategory === category) {
                    card.style.display = 'block';
                    card.classList.add('fade-in');
                } else {
                    card.style.display = 'none';
                }
            });
        }
    }
    
    // --- Funcionalidad de favoritos ---
    function toggleFavorite(name, price, img, button) {
        const existingIndex = favorites.findIndex(item => item.name === name);
        
        if (existingIndex !== -1) {
            // Quitar de favoritos
            favorites.splice(existingIndex, 1);
            button.classList.remove('active');
            showFavoritesMessage('Producto eliminado de favoritos');
        } else {
            // Agregar a favoritos
            favorites.push({ name, price, img });
            button.classList.add('active');
            showFavoritesMessage('Producto agregado a favoritos');
        }
        
        saveFavoritesToStorage();
    }
    
    // Mostrar mensaje de favoritos
    function showFavoritesMessage(message) {
        if (favoritesMessage) {
            favoritesMessage.textContent = message;
            favoritesMessage.classList.add('show');
            
            setTimeout(() => {
                favoritesMessage.classList.remove('show');
            }, 2000);
        }
    }
    
    // --- Funcionalidad del carrito ---
    function addToCart(name, price, img, details = '') {
        const existingItem = cart.find(item => item.name === name && item.details === details);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                name,
                price,
                img,
                details,
                quantity: 1
            });
        }
        
        saveCartToStorage();
        updateCartCounter();
        updateCartDisplay();
        
        // Animación del contador
        if (cartCounter) {
            cartCounter.classList.add('pulse');
            setTimeout(() => {
                cartCounter.classList.remove('pulse');
            }, 1000);
        }
    }
    
    function removeFromCart(name) {
        cart = cart.filter(item => item.name !== name);
        saveCartToStorage();
        updateCartCounter();
        updateCartDisplay();
    }
    
    function updateCartCounter() {
        if (cartCounter) {
            const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
            cartCounter.textContent = totalItems;
            cartCounter.style.display = totalItems > 0 ? 'flex' : 'none';
        }
    }
    
    function updateCartDisplay() {
        if (!cartItemsContainer) return;
        
        cartItemsContainer.innerHTML = '';
        
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="empty-cart">Tu carrito está vacío</p>';
            if (cartTotalElement) cartTotalElement.textContent = '$0.00';
            return;
        }
        
        let total = 0;
        
        cart.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'cart-item';
            
            // Calcular precio numérico
            const priceValue = parseFloat(item.price.replace('$', '')) || 0;
            const itemTotal = priceValue * item.quantity;
            total += itemTotal;
            
            itemElement.innerHTML = `
                <img src="${item.img}" alt="${item.name}">
                <div class="cart-item-details">
                    <div class="cart-item-name">${item.name}</div>
                    ${item.details ? `<div class="cart-item-details-text">${item.details}</div>` : ''}
                    <div class="cart-item-price">${item.price} x ${item.quantity}</div>
                </div>
                <button class="cart-item-remove" data-name="${item.name}">&times;</button>
            `;
            
            cartItemsContainer.appendChild(itemElement);
        });
        
        if (cartTotalElement) cartTotalElement.textContent = `$${total.toFixed(2)}`;
        
        // Agregar event listeners a los botones de eliminar
        document.querySelectorAll('.cart-item-remove').forEach(btn => {
            btn.addEventListener('click', function() {
                removeFromCart(this.dataset.name);
            });
        });
    }
    
    function toggleCart() {
        if (cartSidebar && overlay) {
            cartSidebar.classList.toggle('active');
            overlay.classList.toggle('active');
            document.body.style.overflow = cartSidebar.classList.contains('active') ? 'hidden' : '';
        }
    }
    
    function proceedToCheckout() {
        if (cart.length === 0) {
            alert('Tu carrito está vacío');
            return;
        }
        
        let message = "¡Hola! Me interesan los siguientes productos:\n\n";
        
        cart.forEach(item => {
            message += `• ${item.name} - ${item.price} x ${item.quantity}\n`;
            if (item.details) {
                message += `  ${item.details}\n`;
            }
        });
        
        message += `\nTotal: ${cartTotalElement ? cartTotalElement.textContent : '$0.00'}\n\n`;
        message += "Quedo atento/a a la confirmación. ¡Gracias!";
        
        const encodedMessage = encodeURIComponent(message);
        const waNumber = "593999406153";
        
        const waLink = `https://wa.me/${waNumber}?text=${encodedMessage}`;
        window.open(waLink, '_blank');
        
        // Limpiar carrito después del pedido
        cart = [];
        saveCartToStorage();
        updateCartCounter();
        updateCartDisplay();
        toggleCart();
    }
    
    // --- Almacenamiento local ---
    function saveCartToStorage() {
        localStorage.setItem('tejidosDelightCart', JSON.stringify(cart));
    }
    
    function loadCartFromStorage() {
        const savedCart = localStorage.getItem('tejidosDelightCart');
        if (savedCart) {
            cart = JSON.parse(savedCart);
        }
    }
    
    function saveFavoritesToStorage() {
        localStorage.setItem('tejidosDelightFavorites', JSON.stringify(favorites));
    }
    
    function loadFavoritesFromStorage() {
        const savedFavorites = localStorage.getItem('tejidosDelightFavorites');
        if (savedFavorites) {
            favorites = JSON.parse(savedFavorites);
            
            // Actualizar botones de favoritos
            document.querySelectorAll('.product-card').forEach(card => {
                const productName = card.querySelector('h3').textContent;
                const favoriteBtn = card.querySelector('.favorite-btn');
                
                if (favoriteBtn && favorites.some(item => item.name === productName)) {
                    favoriteBtn.classList.add('active');
                }
            });
        }
    }
    
    // --- Funciones existentes del modal ---
    function openModal(event) {
        event.preventDefault(); 
        const link = this; 
        
        currentProductName = link.dataset.name;
        currentProductType = link.dataset.type || 'standard';
        
        modalImg.src = link.dataset.img;
        modalName.textContent = currentProductName;
        modalPrice.textContent = link.dataset.price;
        
        // --- Resetear formularios ---
        if (radioSize10cm) radioSize10cm.checked = true;
        if (radioSizeCustom) radioSizeCustom.checked = false;
        if (textSizeCustom) {
            textSizeCustom.value = "";
            textSizeCustom.style.display = 'none';
        }
        if (modalSizeCustomInput) modalSizeCustomInput.value = "";
        if (modalPackagingSelect) modalPackagingSelect.value = "";
        
        // Ocultar mensajes de error
        document.querySelectorAll('.error-message').forEach(error => {
            error.style.display = 'none';
        });
        
        // --- Lógica condicional para mostrar/ocultar ---
        if (formPackaging) formPackaging.style.display = 'block';

        if (currentProductType === 'custom') {
            if (formSizeStandard) formSizeStandard.style.display = 'none';
            if (formSizeCustom) formSizeCustom.style.display = 'block';
            if (instructionsStandard) instructionsStandard.style.display = 'none';
            if (instructionsCustom) instructionsCustom.style.display = 'block';
        } else {
            if (formSizeStandard) formSizeStandard.style.display = 'block';
            if (formSizeCustom) formSizeCustom.style.display = 'none';
            if (instructionsStandard) instructionsStandard.style.display = 'block';
            if (instructionsCustom) instructionsCustom.style.display = 'none';
        }
        
        // Actualizar estado del botón
        setTimeout(updateAddToCartButton, 100);
        
        modalOverlay.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        modalOverlay.style.display = 'none';
        document.body.style.overflow = '';
    }

    function toggleCustomSize() {
        if (radioSizeCustom && radioSizeCustom.checked) {
            if (textSizeCustom) textSizeCustom.style.display = 'block';
        } else {
            if (textSizeCustom) {
                textSizeCustom.style.display = 'none';
                textSizeCustom.value = "";
            }
        }
        updateAddToCartButton();
    }
    
    // --- Función para validar formulario ---
    function validateForm() {
        let isValid = true;
        
        // Ocultar mensajes de error anteriores
        document.querySelectorAll('.error-message').forEach(error => {
            error.style.display = 'none';
        });
        
        // Validar tamaño
        if (currentProductType === 'custom') {
            const customSize = modalSizeCustomInput ? modalSizeCustomInput.value.trim() : '';
            if (!customSize) {
                const errorElement = document.getElementById('error-size-custom');
                if (errorElement) errorElement.style.display = 'block';
                isValid = false;
            }
        } else {
            const sizeSelected = (radioSize10cm && radioSize10cm.checked) || 
                               (radioSizeCustom && radioSizeCustom.checked);
            if (!sizeSelected) {
                const errorElement = document.getElementById('error-size-standard');
                if (errorElement) errorElement.style.display = 'block';
                isValid = false;
            } else if (radioSizeCustom && radioSizeCustom.checked) {
                const customSize = textSizeCustom ? textSizeCustom.value.trim() : '';
                if (!customSize) {
                    const errorElement = document.getElementById('error-size-custom-text');
                    if (errorElement) errorElement.style.display = 'block';
                    isValid = false;
                }
            }
        }
        
        // Validar empaque
        const packaging = modalPackagingSelect ? modalPackagingSelect.value : '';
        if (!packaging) {
            const errorElement = document.getElementById('error-packaging');
            if (errorElement) errorElement.style.display = 'block';
            isValid = false;
        }
        
        return isValid;
    }

    // --- Función para añadir al carrito desde el modal ---
    function addToCartFromModal() {
        if (!validateForm()) {
            return; // Detener si la validación falla
        }
        
        const { size, packaging } = getFormData();
        
        const productDetails = `
Tamaño: ${size}
Empaque: ${packaging}
        `.trim();
        
        addToCart(currentProductName, modalPrice.textContent, modalImg.src, productDetails);
        
        // Mostrar confirmación
        if (modalAddToCartBtn) {
            const originalText = modalAddToCartBtn.innerHTML;
            modalAddToCartBtn.innerHTML = '✓ Producto Añadido';
            modalAddToCartBtn.style.backgroundColor = '#25D366';
            modalAddToCartBtn.disabled = true;
            
            setTimeout(() => {
                modalAddToCartBtn.innerHTML = originalText;
                modalAddToCartBtn.style.backgroundColor = '';
                modalAddToCartBtn.disabled = false;
            }, 2000);
        }
    }
    
    // --- Función para actualizar estado del botón ---
    function updateAddToCartButton() {
        if (modalAddToCartBtn) {
            // Habilitar/deshabilitar basado en validación básica
            const packaging = modalPackagingSelect ? modalPackagingSelect.value : '';
            let sizeValid = false;
            
            if (currentProductType === 'custom') {
                const customSize = modalSizeCustomInput ? modalSizeCustomInput.value.trim() : '';
                sizeValid = customSize !== '';
            } else {
                const hasStandardSize = radioSize10cm && radioSize10cm.checked;
                const hasCustomSize = radioSizeCustom && radioSizeCustom.checked && 
                                    textSizeCustom && textSizeCustom.value.trim() !== '';
                sizeValid = hasStandardSize || hasCustomSize;
            }
            
            modalAddToCartBtn.disabled = !(sizeValid && packaging);
        }
    }
    
    function getFormData() {
        let size = "No especificado";
        let packaging = "No especificado";

        // 1. Obtener TAMAÑO
        if (currentProductType === 'custom') {
            size = modalSizeCustomInput ? modalSizeCustomInput.value.trim() || "No especificado" : "No especificado";
        } else {
            if (radioSize10cm && radioSize10cm.checked) {
                size = "10cm (Estándar)";
            } else if (radioSizeCustom && radioSizeCustom.checked) {
                size = textSizeCustom ? textSizeCustom.value.trim() || "Personalizado (No descrito)" : "Personalizado (No descrito)";
            }
        }
        
        // 2. Obtener EMPAQUE
        packaging = modalPackagingSelect ? modalPackagingSelect.value || "No especificado" : "No especificado";
        
        return { size, packaging };
    }

    function sendWhatsApp() {
        const { size, packaging } = getFormData();
        
        const baseMessage = `¡Hola! Me interesa el producto: *${currentProductName}*.\n\n*Tamaño:* ${size}\n*Empaque:* ${packaging}\n\nQuedo atento/a a la cotización. ¡Gracias!`;
        const encodedMessage = encodeURIComponent(baseMessage);
        const waNumber = "593999406153";
        
        const waLink = `https://wa.me/${waNumber}?text=${encodedMessage}`;
        window.open(waLink, '_blank');
    }

    function sendInstagram() {
        const { size, packaging } = getFormData();
        const message = `¡Hola! Me interesa el producto: ${currentProductName}.\n\nTamaño: ${size}\nEmpaque: ${packaging}\n\nQuedo atento/a a la cotización. ¡Gracias!`;

        try {
            navigator.clipboard.writeText(message);
            alert("Se ha copiado el mensaje de tu pedido al portapapeles. Pégalo en el chat de Instagram. 👍");
        } catch (err) {
            alert("No se pudo copiar el mensaje. Por favor, abre Instagram y escribe tu pedido.");
        }
        
        const igLink = "https://ig.me/m/tejidosdelight";
        window.open(igLink, '_blank');
    }
    
    // Inicializar la aplicación
    init();
});