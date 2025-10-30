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
    const modalAddToCartBtn = document.getElementById('modal-add-to-cart');

    // --- Elementos de cantidad ---
    const quantityInput = document.getElementById('modal-quantity');
    const quantityDecrease = document.getElementById('quantity-decrease');
    const quantityIncrease = document.getElementById('quantity-increase');

    const productLinks = document.querySelectorAll('.product-link');
    
    let currentProductName = "";
    let currentProductType = "standard";
    let currentQuantity = 1;
    let isEditingCartItem = false;
    let editingCartItemName = "";
    
    // --- Nuevas variables para funcionalidades mejoradas ---
    let cart = [];
    let favorites = [];
    let selectedPaymentMethod = '';
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
        updateCartDisplay();
        setupEventListeners();
        setupPaymentMethods();
        setupLogoAnimation();
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
        if (radioSize10cm) radioSize10cm.addEventListener('change', toggleCustomSize);
        if (radioSizeCustom) radioSizeCustom.addEventListener('change', toggleCustomSize);
        
        if (waButton) waButton.addEventListener('click', sendWhatsApp);
        if (igButton) igButton.addEventListener('click', sendInstagram);
        
        // Listeners para cantidad
        if (quantityDecrease) quantityDecrease.addEventListener('click', decreaseQuantity);
        if (quantityIncrease) quantityIncrease.addEventListener('click', increaseQuantity);
        if (quantityInput) quantityInput.addEventListener('input', updateQuantity);
        if (quantityInput) quantityInput.addEventListener('change', validateQuantity);
        
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
            cartContainer.addEventListener('click', () => toggleCart());
        }
        
        if (closeCartBtn) {
            closeCartBtn.addEventListener('click', () => toggleCart(true));
        }
        
        if (overlay) {
            overlay.addEventListener('click', () => toggleCart(true));
        }
        
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', proceedToCheckout);
        }
        
        if (continueShoppingBtn) {
            continueShoppingBtn.addEventListener('click', () => toggleCart(true));
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
            
            // Botones de agregar al carrito desde tarjetas - NUEVO: Abrir modal para seleccionar opciones
            if (e.target.closest('.add-to-cart-btn')) {
                e.preventDefault();
                const productCard = e.target.closest('.product-card');
                const viewBtn = productCard.querySelector('.view-btn');
                
                // Simular clic en el botón de ver detalles para abrir el modal
                if (viewBtn) {
                    viewBtn.click();
                }
            }
            
            // Botones de ver detalles
            if (e.target.closest('.view-btn')) {
                e.preventDefault();
                const btn = e.target.closest('.view-btn');
                if (btn.classList.contains('product-link')) {
                    openModal.call(btn, e);
                }
            }

            // Controles de cantidad en el carrito
            if (e.target.closest('.cart-quantity-btn')) {
                e.preventDefault();
                const btn = e.target.closest('.cart-quantity-btn');
                const cartItem = btn.closest('.cart-item');
                const productName = cartItem.querySelector('.cart-item-name').textContent;
                const isIncrease = btn.textContent === '+';
                
                updateCartItemQuantity(productName, isIncrease);
            }

            // Selectores de método de pago
            if (e.target.closest('.payment-option')) {
                const option = e.target.closest('.payment-option');
                selectPaymentMethod(option.dataset.method);
            }
            
            // Botones de editar producto en el carrito
            if (e.target.closest('.cart-item-edit')) {
                e.preventDefault();
                const btn = e.target.closest('.cart-item-edit');
                const cartItem = btn.closest('.cart-item');
                const productName = cartItem.querySelector('.cart-item-name').textContent;
                
                editCartItem(productName);
            }
        });
    }

    // --- Animación del logo ---
    function setupLogoAnimation() {
        const logo = document.getElementById('logo');
        if (logo) {
            logo.addEventListener('mouseenter', () => {
                logo.style.transform = 'scale(1.1)';
            });
            
            logo.addEventListener('mouseleave', () => {
                logo.style.transform = 'scale(1)';
            });
            
            logo.addEventListener('click', () => {
                logo.style.transform = 'scale(1.15)';
                setTimeout(() => {
                    logo.style.transform = 'scale(1)';
                }, 300);
            });
        }
    }

    // --- Funciones de cantidad ---
    function decreaseQuantity() {
        if (currentQuantity > 1) {
            currentQuantity--;
            updateQuantityDisplay();
        }
    }

    function increaseQuantity() {
        currentQuantity++;
        updateQuantityDisplay();
    }

    function updateQuantity() {
        const value = parseInt(quantityInput.value) || 1;
        currentQuantity = Math.max(1, value);
        updateQuantityDisplay();
    }

    function validateQuantity() {
        if (quantityInput.value === '' || parseInt(quantityInput.value) < 1) {
            currentQuantity = 1;
            updateQuantityDisplay();
        }
    }

    function updateQuantityDisplay() {
        if (quantityInput) {
            quantityInput.value = currentQuantity;
        }
    }

    // --- Funciones de método de pago ---
    function setupPaymentMethods() {
        // Seleccionar WhatsApp por defecto
        selectPaymentMethod('whatsapp');
    }

    function selectPaymentMethod(method) {
        selectedPaymentMethod = method;
        
        // Actualizar UI
        document.querySelectorAll('.payment-option').forEach(option => {
            option.classList.remove('selected');
        });
        
        const selectedOption = document.querySelector(`.payment-option[data-method="${method}"]`);
        if (selectedOption) {
            selectedOption.classList.add('selected');
        }
        
        updateCheckoutButton();
    }

    function updateCheckoutButton() {
        if (!checkoutBtn) return;
        
        const hasItems = cart.length > 0;
        const hasPaymentMethod = selectedPaymentMethod !== '';
        
        if (hasItems && hasPaymentMethod) {
            checkoutBtn.disabled = false;
            checkoutBtn.classList.remove('checkout-disabled');
            
            // Actualizar texto y estilo según método seleccionado
            if (selectedPaymentMethod === 'whatsapp') {
                checkoutBtn.textContent = 'Finalizar Pedido por WhatsApp';
                checkoutBtn.className = 'btn-checkout btn-checkout-whatsapp';
            } else {
                checkoutBtn.textContent = 'Finalizar Pedido por Instagram';
                checkoutBtn.className = 'btn-checkout btn-checkout-instagram';
            }
        } else {
            checkoutBtn.disabled = true;
            checkoutBtn.classList.add('checkout-disabled');
            checkoutBtn.textContent = 'Finalizar Pedido';
        }
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
    function addToCart(name, price, img, details = '', quantity = 1, size = '', packaging = '') {
        // Si estamos editando, actualizar el producto existente
        if (isEditingCartItem) {
            const itemIndex = cart.findIndex(item => item.name === editingCartItemName);
            if (itemIndex !== -1) {
                cart[itemIndex].name = name;
                cart[itemIndex].price = price;
                cart[itemIndex].img = img;
                cart[itemIndex].details = details;
                cart[itemIndex].quantity = quantity;
                cart[itemIndex].size = size;
                cart[itemIndex].packaging = packaging;
                
                // Resetear estado de edición
                isEditingCartItem = false;
                editingCartItemName = "";
            }
        } else {
            // Buscar si ya existe un producto con el mismo nombre y detalles
            const existingIndex = cart.findIndex(item => 
                item.name === name && item.details === details
            );
            
            if (existingIndex !== -1) {
                // Actualizar cantidad si ya existe
                cart[existingIndex].quantity += quantity;
            } else {
                // Agregar nuevo producto
                cart.push({
                    name,
                    price,
                    img,
                    details,
                    quantity: quantity,
                    size: size,
                    packaging: packaging
                });
            }
        }
        
        saveCartToStorage();
        updateCartCounter();
        updateCartDisplay();
        updateCheckoutButton();
        
        // Animación del contador
        if (cartCounter) {
            cartCounter.classList.add('pulse');
            setTimeout(() => {
                cartCounter.classList.remove('pulse');
            }, 1000);
        }
    }

    function updateCartItemQuantity(productName, isIncrease) {
        const itemIndex = cart.findIndex(item => item.name === productName);
        
        if (itemIndex !== -1) {
            if (isIncrease) {
                cart[itemIndex].quantity += 1;
            } else {
                if (cart[itemIndex].quantity > 1) {
                    cart[itemIndex].quantity -= 1;
                } else {
                    // Eliminar si la cantidad llega a 0
                    cart.splice(itemIndex, 1);
                }
            }
            
            saveCartToStorage();
            updateCartCounter();
            updateCartDisplay();
            updateCheckoutButton();
        }
    }
    
    function removeFromCart(name) {
        cart = cart.filter(item => item.name !== name);
        saveCartToStorage();
        updateCartCounter();
        updateCartDisplay();
        updateCheckoutButton();
    }
    
    // --- Función para abrir/cerrar carrito ---
    function toggleCart(forceClose = false) {
        if (cartSidebar && overlay) {
            if (forceClose) {
                // Forzar cierre
                cartSidebar.classList.remove('active');
                overlay.classList.remove('active');
                document.body.style.overflow = '';
            } else {
                // Toggle normal
                cartSidebar.classList.toggle('active');
                overlay.classList.toggle('active');
                document.body.style.overflow = cartSidebar.classList.contains('active') ? 'hidden' : '';
            }
        }
    }
    
    // --- Función para editar producto en el carrito ---
    function editCartItem(productName) {
        const itemIndex = cart.findIndex(item => item.name === productName);
        
        if (itemIndex !== -1) {
            const item = cart[itemIndex];
            
            // Cerrar el carrito primero
            toggleCart(true); // true para forzar cierre
            
            // Buscar el botón de vista correspondiente en la página
            const productCards = document.querySelectorAll('.product-card');
            let viewBtn = null;
            
            productCards.forEach(card => {
                if (card.querySelector('h3').textContent === productName) {
                    viewBtn = card.querySelector('.view-btn');
                }
            });
            
            if (viewBtn) {
                // Configurar estado de edición
                isEditingCartItem = true;
                editingCartItemName = productName;
                
                // Abrir el modal con el producto después de un pequeño delay
                setTimeout(() => {
                    viewBtn.click();
                    
                    // Pre-cargar los valores actuales del producto
                    setTimeout(() => {
                        if (item.size && item.size !== "No especificado") {
                            if (item.size === "10cm (Estándar)") {
                                if (radioSize10cm) radioSize10cm.checked = true;
                            } else {
                                if (radioSizeCustom) {
                                    radioSizeCustom.checked = true;
                                    if (textSizeCustom) {
                                        textSizeCustom.value = item.size;
                                        textSizeCustom.style.display = 'block';
                                    }
                                }
                            }
                        }
                        
                        if (item.packaging && item.packaging !== "No especificado") {
                            if (modalPackagingSelect) {
                                modalPackagingSelect.value = item.packaging;
                            }
                        }
                        
                        if (item.quantity) {
                            currentQuantity = item.quantity;
                            updateQuantityDisplay();
                        }
                        
                        // Actualizar el texto del botón para indicar que estamos editando
                        if (modalAddToCartBtn) {
                            modalAddToCartBtn.textContent = '🛒 Actualizar Producto';
                        }
                    }, 100);
                }, 300); // Pequeño delay para que se cierre el carrito primero
            }
        }
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
            
            // Crear descripción unificada
            let description = '';
            if (item.size && item.size !== "No especificado") {
                description += `<div class="cart-item-detail"><strong>Tamaño:</strong> ${item.size}</div>`;
            }
            if (item.packaging && item.packaging !== "No especificado") {
                description += `<div class="cart-item-detail"><strong>Empaque:</strong> ${item.packaging}</div>`;
            }
            
            itemElement.innerHTML = `
                <img src="${item.img}" alt="${item.name}">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-details">
                        ${description}
                    </div>
                    <div class="cart-item-price">${item.price} c/u</div>
                    <div class="cart-item-controls">
                        <button class="cart-quantity-btn">-</button>
                        <input type="text" class="cart-quantity-input" value="${item.quantity}" readonly>
                        <button class="cart-quantity-btn">+</button>
                        <button class="cart-item-edit" data-name="${item.name}">✏️ Editar</button>
                    </div>
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
        
        // Agregar event listeners a los botones de editar
        document.querySelectorAll('.cart-item-edit').forEach(btn => {
            btn.addEventListener('click', function() {
                editCartItem(this.dataset.name);
            });
        });
    }
    
    function proceedToCheckout() {
        if (cart.length === 0) {
            alert('Tu carrito está vacío');
            return;
        }

        if (!selectedPaymentMethod) {
            alert('Por favor selecciona un método de contacto');
            return;
        }
        
        let message = "¡Hola! Me interesan los siguientes productos:\n\n";
        
        cart.forEach(item => {
            message += `• ${item.name} - ${item.price} x ${item.quantity}\n`;
            if (item.size && item.size !== "No especificado") {
                message += `  Tamaño: ${item.size}\n`;
            }
            if (item.packaging && item.packaging !== "No especificado") {
                message += `  Empaque: ${item.packaging}\n`;
            }
        });
        
        message += `\nTotal: ${cartTotalElement ? cartTotalElement.textContent : '$0.00'}\n\n`;
        message += "Quedo atento/a a la confirmación. ¡Gracias!";
        
        if (selectedPaymentMethod === 'whatsapp') {
            const encodedMessage = encodeURIComponent(message);
            const waNumber = "593999406153";
            const waLink = `https://wa.me/${waNumber}?text=${encodedMessage}`;
            window.open(waLink, '_blank');
        } else {
            // Instagram - copiar al portapapeles
            try {
                navigator.clipboard.writeText(message);
                alert("✅ Se ha copiado tu pedido al portapapeles. Ahora abre Instagram y pégalo en nuestro chat @tejidosdelight");
                const igLink = "https://www.instagram.com/tejidosdelight/";
                window.open(igLink, '_blank');
            } catch (err) {
                alert("No se pudo copiar el mensaje. Por favor, abre Instagram y escribe tu pedido manualmente.");
            }
        }
        
        // Limpiar carrito después del pedido
        cart = [];
        saveCartToStorage();
        updateCartCounter();
        updateCartDisplay();
        updateCheckoutButton();
        toggleCart(true); // Cerrar carrito después del pedido
    }
    
    // --- Almacenamiento local ---
    function saveCartToStorage() {
        localStorage.setItem('tejidosDelightCart', JSON.stringify(cart));
    }
    
    function loadCartFromStorage() {
        const savedCart = localStorage.getItem('tejidosDelightCart');
        if (savedCart) {
            try {
                cart = JSON.parse(savedCart);
                // Asegurarse de que todos los items tengan cantidad
                cart.forEach(item => {
                    if (!item.quantity) item.quantity = 1;
                });
            } catch (e) {
                console.error('Error loading cart:', e);
                cart = [];
            }
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
    
    // --- Funciones del modal ---
    function openModal(event) {
        event.preventDefault(); 
        const link = this; 
        
        currentProductName = link.dataset.name;
        currentProductType = link.dataset.type || 'standard';
        currentQuantity = 1; // Resetear cantidad
        
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
        
        // Resetear cantidad
        updateQuantityDisplay();
        
        // Remover highlights de error
        removeErrorHighlights();
        
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
        
        // Si no estamos editando, resetear el texto del botón
        if (!isEditingCartItem && modalAddToCartBtn) {
            modalAddToCartBtn.textContent = '🛒 Añadir al Carrito';
        }
        
        // Actualizar estado del botón
        setTimeout(updateAddToCartButton, 100);
        
        modalOverlay.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        modalOverlay.style.display = 'none';
        document.body.style.overflow = '';
        
        // Resetear estado de edición al cerrar el modal
        isEditingCartItem = false;
        editingCartItemName = "";
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
        
        // Remover highlights anteriores
        removeErrorHighlights();
        
        // Ocultar mensajes de error anteriores
        document.querySelectorAll('.error-message').forEach(error => {
            error.style.display = 'none';
        });
        
        // Validar tamaño
        if (currentProductType === 'custom') {
            const customSize = modalSizeCustomInput ? modalSizeCustomInput.value.trim() : '';
            if (!customSize) {
                const errorElement = document.getElementById('error-size-custom');
                if (errorElement) {
                    errorElement.style.display = 'block';
                    errorElement.textContent = 'Por favor especifica el tamaño deseado';
                }
                if (modalSizeCustomInput) modalSizeCustomInput.classList.add('error-highlight');
                isValid = false;
            }
        } else {
            const sizeSelected = (radioSize10cm && radioSize10cm.checked) || 
                               (radioSizeCustom && radioSizeCustom.checked);
            if (!sizeSelected) {
                const errorElement = document.getElementById('error-size-standard');
                if (errorElement) {
                    errorElement.style.display = 'block';
                    errorElement.textContent = 'Por favor selecciona un tamaño';
                }
                isValid = false;
            } else if (radioSizeCustom && radioSizeCustom.checked) {
                const customSize = textSizeCustom ? textSizeCustom.value.trim() : '';
                if (!customSize) {
                    const errorElement = document.getElementById('error-size-custom-text');
                    if (errorElement) {
                        errorElement.style.display = 'block';
                        errorElement.textContent = 'Por favor especifica el tamaño personalizado';
                    }
                    if (textSizeCustom) textSizeCustom.classList.add('error-highlight');
                    isValid = false;
                }
            }
        }
        
        // Validar empaque
        const packaging = modalPackagingSelect ? modalPackagingSelect.value : '';
        if (!packaging) {
            const errorElement = document.getElementById('error-packaging');
            if (errorElement) {
                errorElement.style.display = 'block';
                errorElement.textContent = 'Por favor selecciona un tipo de empaque';
            }
            if (modalPackagingSelect) modalPackagingSelect.classList.add('error-highlight');
            isValid = false;
        }
        
        return isValid;
    }

    function removeErrorHighlights() {
        document.querySelectorAll('.error-highlight').forEach(element => {
            element.classList.remove('error-highlight');
        });
    }

    // --- Función para añadir al carrito desde el modal ---
    function addToCartFromModal() {
        if (!validateForm()) {
            // Mostrar mensaje general de error
            showFavoritesMessage('Por favor completa todos los campos requeridos');
            return; // Detener si la validación falla
        }
        
        const { size, packaging } = getFormData();
        
        const productDetails = `
Tamaño: ${size}
Empaque: ${packaging}
        `.trim();
        
        addToCart(currentProductName, modalPrice.textContent, modalImg.src, productDetails, currentQuantity, size, packaging);
        
        // Mostrar confirmación
        if (modalAddToCartBtn) {
            const originalText = modalAddToCartBtn.innerHTML;
            const successText = isEditingCartItem ? '✓ Producto Actualizado' : '✓ Producto Añadido';
            modalAddToCartBtn.innerHTML = successText;
            modalAddToCartBtn.style.backgroundColor = '#25D366';
            modalAddToCartBtn.disabled = true;
            
            setTimeout(() => {
                modalAddToCartBtn.innerHTML = originalText;
                modalAddToCartBtn.style.backgroundColor = '';
                modalAddToCartBtn.disabled = false;
                closeModal();
            }, 1500);
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
        // Validar formulario antes de enviar
        if (!validateForm()) {
            showFavoritesMessage('Por favor completa todos los campos requeridos');
            return;
        }
        
        const { size, packaging } = getFormData();
        
        const baseMessage = `¡Hola! Me interesa el producto: *${currentProductName}*.\n\n*Tamaño:* ${size}\n*Empaque:* ${packaging}\n\nQuedo atento/a a la cotización. ¡Gracias!`;
        const encodedMessage = encodeURIComponent(baseMessage);
        const waNumber = "593999406153";
        
        const waLink = `https://wa.me/${waNumber}?text=${encodedMessage}`;
        window.open(waLink, '_blank');
    }

    function sendInstagram() {
        // Validar formulario antes de enviar
        if (!validateForm()) {
            showFavoritesMessage('Por favor completa todos los campos requeridos');
            return;
        }
        
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