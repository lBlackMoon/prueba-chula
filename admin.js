// Variables globales
let products = [];
let editingProductId = null;

// Inicialización cuando el DOM está listo
document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
    setupEventListeners();
});

// Configurar event listeners
function setupEventListeners() {
    // Formulario de producto
    document.getElementById('product-form').addEventListener('submit', saveProduct);
    
    // Vista previa de imagen
    document.getElementById('product-image').addEventListener('change', previewImage);
}

// Cargar productos desde localStorage
function loadProducts() {
    const savedProducts = localStorage.getItem('tejidosDelightProducts');
    
    if (savedProducts) {
        products = JSON.parse(savedProducts);
    } else {
        // Si no hay productos guardados, cargar los predeterminados
        loadDefaultProducts();
    }
    
    displayProducts();
}

// Cargar productos predeterminados
function loadDefaultProducts() {
    products = [
        {
            id: '1',
            name: 'Stitch',
            category: 'amigurumis',
            price: '$5.00',
            type: 'standard',
            image: 'imagenes/stitch.jpg'
        },
        {
            id: '2',
            name: 'Amigurumi Personalizado',
            category: 'amigurumis',
            price: 'A cotizar',
            type: 'custom',
            image: 'imagenes/personalizado.jpg'
        },
        {
            id: '3',
            name: 'Ramo de Hello Kitty',
            category: 'flores',
            price: '$5.00',
            type: 'standard',
            image: 'imagenes/ramo-hello-kitty.jpg'
        },
        {
            id: '4',
            name: 'Ramo Personalizado',
            category: 'flores',
            price: 'A cotizar',
            type: 'custom',
            image: 'imagenes/personalizado.jpg'
        },
        {
            id: '5',
            name: 'Llavero Totoro',
            category: 'llaveros',
            price: '$3.50',
            type: 'standard',
            image: 'imagenes/totoro.jpg'
        },
        {
            id: '6',
            name: 'Llavero Personalizado',
            category: 'llaveros',
            price: 'A cotizar',
            type: 'custom',
            image: 'imagenes/personalizado.jpg'
        },
        {
            id: '7',
            name: 'Pulsera Básica',
            category: 'pulseras',
            price: '$4.00',
            type: 'standard',
            image: 'imagenes/pulsera-basica.jpg'
        },
        {
            id: '8',
            name: 'Pulsera Personalizada',
            category: 'pulseras',
            price: 'A cotizar',
            type: 'custom',
            image: 'imagenes/personalizado.jpg'
        },
        {
            id: '9',
            name: 'Colgante Corazón',
            category: 'colgantes',
            price: '$3.50',
            type: 'standard',
            image: 'imagenes/colgante-corazon.jpg'
        },
        {
            id: '10',
            name: 'Colgante Personalizado',
            category: 'colgantes',
            price: 'A cotizar',
            type: 'custom',
            image: 'imagenes/personalizado.jpg'
        },
        {
            id: '11',
            name: 'Combo Amor',
            category: 'combos',
            price: '$12.00',
            type: 'standard',
            image: 'imagenes/combo-amor.jpg'
        },
        {
            id: '12',
            name: 'Combo Personalizado',
            category: 'combos',
            price: 'A cotizar',
            type: 'custom',
            image: 'imagenes/personalizado.jpg'
        },
        {
            id: '13',
            name: 'Bolsa Básica',
            category: 'bolsas',
            price: '$8.00',
            type: 'standard',
            image: 'imagenes/bolsa-basica.jpg'
        },
        {
            id: '14',
            name: 'Bolsa Personalizada',
            category: 'bolsas',
            price: 'A cotizar',
            type: 'custom',
            image: 'imagenes/personalizado.jpg'
        },
        {
            id: '15',
            name: 'Maceta Simple',
            category: 'macetas',
            price: '$6.00',
            type: 'standard',
            image: 'imagenes/maceta-simple.jpg'
        },
        {
            id: '16',
            name: 'Maceta Personalizada',
            category: 'macetas',
            price: 'A cotizar',
            type: 'custom',
            image: 'imagenes/personalizado.jpg'
        }
    ];
    
    saveProducts();
}

// Guardar productos en localStorage
function saveProducts() {
    localStorage.setItem('tejidosDelightProducts', JSON.stringify(products));
}

// Mostrar productos en la interfaz
function displayProducts(filteredProducts = null) {
    const productsToDisplay = filteredProducts || products;
    const container = document.getElementById('products-container');
    
    if (productsToDisplay.length === 0) {
        container.innerHTML = '<p>No hay productos para mostrar.</p>';
        return;
    }
    
    container.innerHTML = productsToDisplay.map(product => `
        <div class="admin-product-card">
            <img src="${product.image}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p><strong>Categoría:</strong> ${getCategoryName(product.category)}</p>
            <p><strong>Precio:</strong> ${product.price}</p>
            <p><strong>Tipo:</strong> ${product.type === 'standard' ? 'Estándar' : 'Personalizado'}</p>
            <div class="admin-product-actions">
                <button class="btn-edit" onclick="editProduct('${product.id}')">Editar</button>
                <button class="btn-delete" onclick="deleteProduct('${product.id}')">Eliminar</button>
            </div>
        </div>
    `).join('');
}

// Obtener nombre legible de la categoría
function getCategoryName(category) {
    const categories = {
        'amigurumis': 'Amigurumis',
        'flores': 'Flores y Ramos',
        'llaveros': 'Llaveros',
        'pulseras': 'Pulseras',
        'colgantes': 'Colgantes',
        'combos': 'Combos',
        'bolsas': 'Bolsas',
        'macetas': 'Macetas'
    };
    
    return categories[category] || category;
}

// Filtrar productos
function filterProducts() {
    const searchTerm = document.getElementById('search-products').value.toLowerCase();
    const filteredProducts = products.filter(product => 
        product.name.toLowerCase().includes(searchTerm) ||
        product.category.toLowerCase().includes(searchTerm) ||
        product.price.toLowerCase().includes(searchTerm)
    );
    
    displayProducts(filteredProducts);
}

// Mostrar sección específica
function showSection(sectionId) {
    // Ocultar todas las secciones
    document.querySelectorAll('.admin-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Mostrar la sección seleccionada
    document.getElementById(`${sectionId}-section`).classList.add('active');
    
    // Si es la sección de productos, actualizar la lista
    if (sectionId === 'products') {
        displayProducts();
    }
}

// Vista previa de imagen
function previewImage(event) {
    const file = event.target.files[0];
    const preview = document.getElementById('image-preview');
    
    if (file) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            preview.src = e.target.result;
            preview.style.display = 'block';
            document.getElementById('product-image-url').value = e.target.result;
        };
        
        reader.readAsDataURL(file);
    } else {
        preview.style.display = 'none';
        document.getElementById('product-image-url').value = '';
    }
}

// Guardar producto (nuevo o editado)
function saveProduct(event) {
    event.preventDefault();
    
    const productId = document.getElementById('product-id').value;
    const name = document.getElementById('product-name').value;
    const category = document.getElementById('product-category').value;
    const price = document.getElementById('product-price').value;
    const type = document.getElementById('product-type').value;
    const imageUrl = document.getElementById('product-image-url').value;
    const description = document.getElementById('product-description').value;
    
    // Validación básica
    if (!name || !category || !price || !type) {
        showAlert('Por favor completa todos los campos obligatorios.', 'error');
        return;
    }
    
    // Si estamos editando
    if (productId) {
        const productIndex = products.findIndex(p => p.id === productId);
        
        if (productIndex !== -1) {
            products[productIndex] = {
                ...products[productIndex],
                name,
                category,
                price,
                type,
                image: imageUrl || products[productIndex].image,
                description: description || products[productIndex].description
            };
            
            showAlert('Producto actualizado correctamente.', 'success');
        }
    } else {
        // Nuevo producto
        const newProduct = {
            id: generateId(),
            name,
            category,
            price,
            type,
            image: imageUrl || 'imagenes/personalizado.jpg',
            description: description || ''
        };
        
        products.push(newProduct);
        showAlert('Producto agregado correctamente.', 'success');
    }
    
    saveProducts();
    resetForm();
    showSection('products');
}

// Generar ID único
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Editar producto
function editProduct(id) {
    const product = products.find(p => p.id === id);
    
    if (product) {
        document.getElementById('form-title').textContent = 'Editar Producto';
        document.getElementById('product-id').value = product.id;
        document.getElementById('product-name').value = product.name;
        document.getElementById('product-category').value = product.category;
        document.getElementById('product-price').value = product.price;
        document.getElementById('product-type').value = product.type;
        document.getElementById('product-description').value = product.description || '';
        
        // Mostrar imagen actual si existe
        const preview = document.getElementById('image-preview');
        if (product.image && product.image.startsWith('data:')) {
            preview.src = product.image;
            preview.style.display = 'block';
            document.getElementById('product-image-url').value = product.image;
        } else if (product.image) {
            preview.src = product.image;
            preview.style.display = 'block';
        }
        
        document.getElementById('submit-btn').textContent = 'Actualizar Producto';
        document.getElementById('cancel-btn').style.display = 'inline-block';
        
        showSection('add-product');
    }
}

// Eliminar producto
function deleteProduct(id) {
    if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
        products = products.filter(p => p.id !== id);
        saveProducts();
        displayProducts();
        showAlert('Producto eliminado correctamente.', 'success');
    }
}

// Restablecer formulario
function resetForm() {
    document.getElementById('product-form').reset();
    document.getElementById('product-id').value = '';
    document.getElementById('image-preview').style.display = 'none';
    document.getElementById('form-title').textContent = 'Agregar Nuevo Producto';
    document.getElementById('submit-btn').textContent = 'Guardar Producto';
    document.getElementById('cancel-btn').style.display = 'none';
    editingProductId = null;
}

// Mostrar alerta
function showAlert(message, type) {
    const alert = document.getElementById('alert');
    alert.textContent = message;
    alert.className = `alert alert-${type}`;
    alert.style.display = 'block';
    
    setTimeout(() => {
        alert.style.display = 'none';
    }, 5000);
}

// Exportar productos a JSON
function exportProducts() {
    const dataStr = JSON.stringify(products, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'tejidos-delight-productos.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showAlert('Productos exportados correctamente.', 'success');
}

// Importar productos desde JSON
function importProducts() {
    const fileInput = document.getElementById('import-file');
    const file = fileInput.files[0];
    
    if (!file) {
        showAlert('Por favor selecciona un archivo JSON.', 'error');
        return;
    }
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const importedProducts = JSON.parse(e.target.result);
            
            if (Array.isArray(importedProducts)) {
                if (confirm('¿Estás seguro de que quieres importar estos productos? Se reemplazarán todos los productos actuales.')) {
                    products = importedProducts;
                    saveProducts();
                    displayProducts();
                    showAlert('Productos importados correctamente.', 'success');
                    fileInput.value = '';
                }
            } else {
                showAlert('El archivo no contiene una lista válida de productos.', 'error');
            }
        } catch (error) {
            showAlert('Error al leer el archivo. Asegúrate de que es un JSON válido.', 'error');
        }
    };
    
    reader.readAsText(file);
}

// Restablecer a valores predeterminados
function resetToDefault() {
    if (confirm('¿Estás seguro de que quieres restablecer todos los productos a los valores predeterminados? Se perderán todos los productos actuales.')) {
        loadDefaultProducts();
        showAlert('Productos restablecidos a valores predeterminados.', 'success');
    }
}