// =====================
// DICCIONARIO DE TRADUCCIÓN
// =====================
/**
 * Traduce categorías y áreas de inglés a español
 */
const translations = {
    categories: {
        'Beef': 'Carne de Res',
        'Chicken': 'Pollo',
        'Dessert': 'Postre',
        'Lamb': 'Cordero',
        'Miscellaneous': 'Varios',
        'Pasta': 'Pasta',
        'Pork': 'Cerdo',
        'Seafood': 'Mariscos',
        'Side': 'Acompañamiento',
        'Starter': 'Entrada',
        'Vegan': 'Vegano',
        'Vegetarian': 'Vegetariano',
        'Breakfast': 'Desayuno',
        'Goat': 'Cabra'
    },
    areas: {
        'American': 'Americana',
        'British': 'Británica',
        'Canadian': 'Canadiense',
        'Chinese': 'China',
        'Croatian': 'Croata',
        'Dutch': 'Holandesa',
        'Egyptian': 'Egipcia',
        'French': 'Francesa',
        'Greek': 'Griega',
        'Indian': 'India',
        'Irish': 'Irlandesa',
        'Italian': 'Italiana',
        'Jamaican': 'Jamaiquina',
        'Japanese': 'Japonesa',
        'Kenyan': 'Keniata',
        'Malaysian': 'Malasia',
        'Mexican': 'Mexicana',
        'Mediterranean': 'Mediterránea',
        'Norwegian': 'Noruega',
        'Polish': 'Polaca',
        'Portuguese': 'Portuguesa',
        'Russian': 'Rusa',
        'Spanish': 'Española',
        'Thai': 'Tailandesa',
        'Tunisian': 'Tunecina',
        'Turkish': 'Turca',
        'Ukrainian': 'Ucraniana',
        'Uruguayan': 'Uruguaya',
        'Vietnamese': 'Vietnamita',
        'Saudi Arabian': 'Saudí',
        'Moroccan': 'Marroquí',
        'Korean': 'Coreana',
        'Pakistan': 'Paquistaní',
        'Philippines': 'Filipinas',
        'Singapore': 'Singapur',
        'South American': 'Sudamericana',
        'Unknown': 'Desconocida',
        'Austria': 'Austriaca',
        'Brazil': 'Brasileña',
        'Bulgaria': 'Búlgara',
        'Latvia': 'Letona',
        'Lithuania': 'Lituana',
        'Malta': 'Maltesa',
        'Romania': 'Rumana',
        'Russia': 'Rusa',
        'Serbia': 'Serbia',
        'Slovakia': 'Eslovaquia',
        'Slovenia': 'Eslovenia',
        'Sweden': 'Suecia',
        'Switzerland': 'Suiza',
        'Taiwan': 'Taiwán',
        'Tunisia': 'Tunisia',
        'Turkey': 'Turquía',
        'United States': 'Estados Unidos',
        'France': 'Francia',
        'Australia': 'Australia',
        'Germany': 'Alemania',
        'Argentina': 'Argentina',
        'Hungary': 'Hungría',
        'Finland': 'Finlandia',
        'Czech Republic': 'República Checa',
        'Denmark': 'Dinamarca',
        'Iceland': 'Islandia',
        'Israel': 'Israel',
        'Lebanon': 'Líbano',
        'Palestine': 'Palestina',
        'Peru': 'Perú',
        'Puerto Rico': 'Puerto Rico',
        'Chile': 'Chile',
        'Colombia': 'Colombia',
        'Venezuela': 'Venezuela',
        'Jamaica': 'Jamaica',
        'Haiti': 'Haití',
        'Trinidad and Tobago': 'Trinidad y Tobago'
    }
};

/**
 * Traduce texto de inglés a español usando una API robusta
 * Intenta múltiples servicios para máxima confiabilidad
 * @async
 */
const LIBRE_TRANSLATE_ENDPOINTS = [
    'https://translate.fedilab.app/translate',
    'https://translate.cutie.dating/translate'
];

function decodeHtmlEntities(text) {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value;
}

function splitTextIntoChunks(text, maxLength = 450) {
    const chunks = [];
    const paragraphs = text.split(/\n+/);

    paragraphs.forEach(paragraph => {
        const sentences = paragraph.match(/[^.!?]+[.!?]+|\S.+$/g) || [paragraph];
        let currentChunk = '';

        sentences.forEach(sentence => {
            const nextChunk = `${currentChunk} ${sentence}`.trim();

            if (nextChunk.length <= maxLength) {
                currentChunk = nextChunk;
                return;
            }

            if (currentChunk) {
                chunks.push(currentChunk);
            }

            if (sentence.length <= maxLength) {
                currentChunk = sentence.trim();
                return;
            }

            for (let i = 0; i < sentence.length; i += maxLength) {
                chunks.push(sentence.slice(i, i + maxLength));
            }

            currentChunk = '';
        });

        if (currentChunk) {
            chunks.push(currentChunk);
        }
    });

    return chunks;
}

async function translateWithLibreTranslate(text) {
    for (const endpoint of LIBRE_TRANSLATE_ENDPOINTS) {
        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    q: text,
                    source: 'en',
                    target: 'es',
                    format: 'text'
                })
            });

            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }

            const data = await response.json();

            if (data && data.translatedText) {
                return data.translatedText;
            }
        } catch (error) {
            console.warn(`LibreTranslate no respondio en ${endpoint}:`, error);
        }
    }

    throw new Error('No hay mirrors de LibreTranslate disponibles');
}

async function translateWithMyMemoryChunks(text) {
    const chunks = splitTextIntoChunks(text);
    const translatedChunks = [];

    for (const chunk of chunks) {
        const response = await fetch('https://api.mymemory.translated.net/get?q=' +
            encodeURIComponent(chunk) + '&langpair=en|es');

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();

        if (!data || !data.responseData || !data.responseData.translatedText) {
            throw new Error('MyMemory no devolvio traduccion');
        }

        translatedChunks.push(decodeHtmlEntities(data.responseData.translatedText));
    }

    return translatedChunks.join(' ');
}

async function translateToSpanish(text) {
    if (!text || text.length === 0) return text;

    try {
        return await translateWithLibreTranslate(text);
    } catch (libreError) {
        console.warn('LibreTranslate fallo, usando MyMemory por fragmentos:', libreError);
    }

    try {
        return await translateWithMyMemoryChunks(text);
    } catch (error) {
        console.error('Error traduciendo:', error);
        return text;
    }
        
        // Primera opción: usar Google Translate via script de traducción
        // Esta es la forma más confiable de traducir en el navegador
}

/**
 * Traduce categoría de inglés a español
 */
function translateCategory(category) {
    return translations.categories[category] || category;
}

/**
 * Traduce área de inglés a español
 */
function translateArea(area) {
    return translations.areas[area] || area;
}

// =====================
// CLASE RECIPE (POO)
// =====================
/**
 * Clase que representa una receta con métodos para manejo
 * Ejemplo de POO aplicada donde tiene sentido, no forzada
 */
class Recipe {
    constructor(data) {
        this.id = data.idMeal;
        this.name = data.strMeal;
        this.image = data.strMealThumb;
        this.category = data.strCategory;
        this.area = data.strArea;
        this.instructions = data.strInstructions;
        this.youtube = data.strYoutube;
        this.tags = data.strTags ? data.strTags.split(',') : [];

        for (let i = 1; i <= 20; i++) {
            this[`strIngredient${i}`] = data[`strIngredient${i}`];
            this[`strMeasure${i}`] = data[`strMeasure${i}`];
        }
    }

    /**
     * Extrae ingredientes y medidas de forma limpia
     * Usa destructuring y array methods
     */
    getIngredients() {
        // Solo incluye ingredientes que no están vacíos
        const ingredients = [];
        for (let i = 1; i <= 20; i++) {
            const ingredient = this[`strIngredient${i}`];
            const measure = this[`strMeasure${i}`];
            
            if (ingredient && ingredient.trim()) {
                ingredients.push({
                    name: ingredient.trim(),
                    measure: measure ? measure.trim() : 'al gusto'
                });
            }
        }
        return ingredients;
    }

    /**
     * Retorna si la receta tiene video disponible
     */
    hasVideo() {
        return !!this.youtube && this.youtube.length > 0;
    }
}

// =====================
// CLASE FAVORITES (POO)
// =====================
/**
 * Maneja la persistencia de recetas favoritas en localStorage
 */
class Favorites {
    constructor() {
        this.storageKey = 'recipeRoulette_favorites';
        this.favorites = this.loadFromStorage();
    }

    /**
     * Carga favoritas del localStorage
     */
    loadFromStorage() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error cargando favoritas:', error);
            return [];
        }
    }

    /**
     * Guarda en localStorage
     */
    saveToStorage() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.favorites));
        } catch (error) {
            console.error('Error guardando favoritas:', error);
        }
    }

    /**
     * Agrega una receta a favoritas
     */
    add(recipe) {
        if (!this.isFavorited(recipe.id)) {
            this.favorites.push({
                id: recipe.id,
                name: recipe.name,
                image: recipe.image,
                category: recipe.category,
                area: recipe.area,
                savedAt: new Date().toISOString()
            });
            this.saveToStorage();
            return true;
        }
        return false;
    }

    /**
     * Elimina una receta de favoritas
     */
    remove(recipeId) {
        this.favorites = this.favorites.filter(fav => fav.id !== recipeId);
        this.saveToStorage();
    }

    /**
     * Verifica si una receta está en favoritas
     */
    isFavorited(recipeId) {
        return this.favorites.some(fav => fav.id === recipeId);
    }

    /**
     * Obtiene todas las favoritas
     */
    getAll() {
        return [...this.favorites];
    }

    /**
     * Limpia todas las favoritas
     */
    clear() {
        this.favorites = [];
        this.saveToStorage();
    }
}

// =====================
// CLASE SEARCH HISTORY (POO)
// =====================
/**
 * Maneja el historial de búsquedas del usuario
 */
class SearchHistory {
    constructor(maxItems = 5) {
        this.storageKey = 'recipeRoulette_history';
        this.maxItems = maxItems;
        this.history = this.loadFromStorage();
    }

    loadFromStorage() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error cargando historial:', error);
            return [];
        }
    }

    saveToStorage() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.history));
        } catch (error) {
            console.error('Error guardando historial:', error);
        }
    }

    /**
     * Agrega búsqueda al historial (sin duplicados, máximo maxItems)
     */
    add(query) {
        const trimmedQuery = query.trim();
        if (trimmedQuery.length === 0) return;

        // Elimina si ya existe
        this.history = this.history.filter(item => item !== trimmedQuery);
        
        // Agrega al inicio
        this.history.unshift(trimmedQuery);
        
        // Mantiene solo los últimos N items
        this.history = this.history.slice(0, this.maxItems);
        
        this.saveToStorage();
    }

    getAll() {
        return [...this.history];
    }

    clear() {
        this.history = [];
        this.saveToStorage();
    }
}

// =====================
// CONFIGURACIÓN DE API
// =====================
const API_BASE_URL = 'https://www.themealdb.com/api/json/v1/1';

// =====================
// ESTADO GLOBAL
// =====================
const state = {
    recipes: [],
    filteredRecipes: [],
    currentRecipe: null,
    loading: false,
    error: null,
    currentTab: 'recipes'
};

const favorites = new Favorites();
const searchHistory = new SearchHistory();

// =====================
// ELEMENTOS DEL DOM
// =====================
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const randomBtn = document.getElementById('randomBtn');
const categoryFilter = document.getElementById('categoryFilter');
const areaFilter = document.getElementById('areaFilter');
const recipesGrid = document.getElementById('recipesGrid');
const favoritesGrid = document.getElementById('favoritesGrid');
const loadingEl = document.getElementById('loading');
const errorEl = document.getElementById('error');
const errorMessage = document.getElementById('errorMessage');
const retryBtn = document.getElementById('retryBtn');
const recipeModal = document.getElementById('recipeModal');
const closeModal = document.getElementById('closeModal');
const modalBody = document.getElementById('modalBody');
const emptyState = document.getElementById('emptyState');
const emptyFavorites = document.getElementById('emptyFavorites');
const themeToggle = document.getElementById('themeToggle');
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const searchHistoryEl = document.getElementById('searchHistory');

// =====================
// FUNCIONES DE API
// =====================

/**
 * Busca recetas por nombre
 * @async
 * @param {string} query - Nombre de la receta a buscar
 * @throws {Error} Si la búsqueda falla
 */
async function searchRecipesByName(query) {
    if (!query.trim()) {
        showError('Por favor ingresa un nombre de receta');
        return;
    }

    setLoading(true);
    clearError();

    try {
        // Llamada async/await a la API
        const response = await fetch(`${API_BASE_URL}/search.php?s=${encodeURIComponent(query)}`);
        
        // Verifica response.ok como pide el proyecto
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();

        // Maneja el caso donde no hay resultados
        if (!data.meals) {
            state.recipes = [];
            showError(`No encontramos recetas con "${query}". Intenta con otro nombre.`);
            return;
        }

        // Mapea los resultados a objetos Recipe usando arrow function
        state.recipes = data.meals.map(meal => ({
            ...meal,
            strCategory: meal.strCategory,
            strArea: meal.strArea
        }));

        // Agrega al historial
        searchHistory.add(query);
        renderSearchHistory();

        // Aplica filtros después de buscar
        filterRecipes();
        renderRecipes();
    } catch (error) {
        console.error('Error en búsqueda:', error);
        showError(`Error al buscar recetas: ${error.message}`);
    } finally {
        setLoading(false);
    }
}

/**
 * Obtiene una receta aleatoria
 * @async
 */

async function getRandomRecipe() {
    // 1. Mostrar estado de carga y ocultar errores
    setLoading(true);
    clearError();
    
    try {
        const response = await fetch(`${API_BASE_URL}/random.php`);
        if (!response.ok) throw new Error('Error al obtener receta aleatoria');
        
        const data = await response.json();
        const meal = data.meals[0];
        
        // 2. Limpiar el grid para mostrar solo la sorpresa
        state.recipes = [meal];
        categoryFilter.value = '';
        areaFilter.value = '';
        filterRecipes();
        switchTab('recipes');
        renderRecipes();
        const recipe = meal;
        
        // 3. Reutiliza tu clase Recipe para renderizar
        renderRecipe(recipe); // O la función que uses para pintar una sola carta
        
    } catch (error) {
        showError('No pudimos traer una sorpresa. Intenta de nuevo.');
        console.error(error);
    } finally {
        setLoading(false);
    }
}

/**
 * Obtiene detalles completos de una receta por ID
 * @async
 * @param {string} mealId - ID de la receta
 */
async function getRecipeDetails(mealId) {
    try {
        const response = await fetch(`${API_BASE_URL}/lookup.php?i=${mealId}`);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();

        if (!data.meals || data.meals.length === 0) {
            throw new Error('Receta no encontrada');
        }

        return new Recipe(data.meals[0]);
    } catch (error) {
        console.error('Error obteniendo detalles:', error);
        showError(`Error: ${error.message}`);
        return null;
    }
}

/**
 * Carga todas las categorías disponibles
 * @async
 */
async function loadCategories() {
    try {
        const response = await fetch(`${API_BASE_URL}/categories.php`);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();

        // Usa array method map para extraer nombres
        const categories = data.categories.map(cat => cat.strCategory);
        
        // Popula el select con las categorías
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = translateCategory(category);
            categoryFilter.appendChild(option);
        });
    } catch (error) {
        console.error('Error cargando categorías:', error);
    }
}

/**
 * Carga todas las áreas/cocinas disponibles
 * @async
 */
async function loadAreas() {
    try {
        const response = await fetch(`${API_BASE_URL}/list.php?a=list`);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();

        // Usa map para extraer nombres
        const areas = data.meals.map(meal => meal.strArea);
        
        areas.forEach(area => {
            const option = document.createElement('option');
            option.value = area;
            option.textContent = translateArea(area);
            areaFilter.appendChild(option);
        });
    } catch (error) {
        console.error('Error cargando áreas:', error);
    }
}

// =====================
// FUNCIONES DE FILTRADO
// =====================

/**
 * Filtra recetas por categoría y área
 * Usa array methods: filter
 */
function filterRecipes() {
    const categoryValue = categoryFilter.value;
    const areaValue = areaFilter.value;

    // Aplica filtros usando filter (array method)
    state.filteredRecipes = state.recipes.filter(recipe => {
        const matchCategory = !categoryValue || recipe.strCategory === categoryValue;
        const matchArea = !areaValue || recipe.strArea === areaValue;
        return matchCategory && matchArea;
    });

    // Ordena alfabéticamente usando sort (array method)
    state.filteredRecipes.sort((a, b) => a.strMeal.localeCompare(b.strMeal));
}

// =====================
// FUNCIONES DE RENDER
// =====================

function renderRecipe(recipe) {
    state.recipes = [recipe];
    filterRecipes();
    switchTab('recipes');
    renderRecipes();
}

/**
 * Renderiza las recetas en la grilla
 * Usa template literals y destructuring
 */
function renderRecipes() {
    const { filteredRecipes } = state;

    emptyState.classList.toggle('hidden', filteredRecipes.length > 0);
    recipesGrid.innerHTML = '';

    // Usa map para crear las tarjetas (array method)
    const recipesHTML = filteredRecipes
        .map(({ idMeal, strMeal, strMealThumb, strCategory, strArea }) => {
            const isFav = favorites.isFavorited(idMeal);
            const categoryEsp = translateCategory(strCategory);
            const areaEsp = translateArea(strArea);
            return `
                <div class="recipe-card">
                    <img src="${strMealThumb}" alt="${strMeal}" class="recipe-image">
                    <div class="recipe-info">
                        <h3 class="recipe-name">${strMeal}</h3>
                        <div class="recipe-meta">
                            <span><i class="fa-solid fa-tag"></i> ${categoryEsp}</span>
                            <span><i class="fa-solid fa-earth-americas"></i> ${areaEsp}</span>
                        </div>
                        <div class="recipe-actions">
                            <button class="btn-small btn-view" onclick="openRecipeModal('${idMeal}')">
                                <i class="fa-solid fa-eye"></i> Ver
                            </button>
                            <button class="btn-small btn-favorite ${isFav ? 'favorited' : ''}" 
                                    onclick="toggleFavorite('${idMeal}', '${strMeal}', '${strMealThumb}', '${strCategory}', '${strArea}')">
                                ${isFav ? '<i class="fa-solid fa-heart"></i> Guardada' : '<i class="fa-regular fa-heart"></i> Guardar'}
                            </button>
                        </div>
                    </div>
                </div>
            `;
        })
        .join('');

    recipesGrid.innerHTML = recipesHTML;
}

/**
 * Renderiza las recetas favoritas
 */
function renderFavorites() {
    const favoritesList = favorites.getAll();
    emptyFavorites.classList.toggle('hidden', favoritesList.length > 0);
    favoritesGrid.innerHTML = '';

    if (favoritesList.length === 0) {
        return;
    }

    // Usa map para crear tarjetas de favoritas
    const favoritesHTML = favoritesList
        .map(({ id, name, image, category, area }) => {
            const categoryEsp = translateCategory(category);
            const areaEsp = translateArea(area);
            return `
            <div class="recipe-card">
                <img src="${image}" alt="${name}" class="recipe-image">
                <div class="recipe-info">
                    <h3 class="recipe-name">${name}</h3>
                    <div class="recipe-meta">
                        <span><i class="fa-solid fa-tag"></i> ${categoryEsp}</span>
                        <span><i class="fa-solid fa-earth-americas"></i> ${areaEsp}</span>
                    </div>
                    <div class="recipe-actions">
                        <button class="btn-small btn-view" onclick="openRecipeModal('${id}')">
                            <i class="fa-solid fa-eye"></i> Ver
                        </button>
                        <button class="btn-small btn-favorite favorited" 
                                onclick="toggleFavorite('${id}', '${name}', '${image}', '${category}', '${area}')">
                            <i class="fa-solid fa-heart"></i> Guardada
                        </button>
                    </div>
                </div>
            </div>
        `
        })
        .join('');

    favoritesGrid.innerHTML = favoritesHTML;
}

/**
 * Renderiza el historial de búsquedas
 */
function renderSearchHistory() {
    const history = searchHistory.getAll();
    searchHistoryEl.innerHTML = '';

    if (history.length === 0) {
        return;
    }

    const historyHTML = `
        <strong>Búsquedas recientes:</strong>
        ${history.map(query => `
            <span class="history-badge" onclick="searchRecipesByName('${query}')">
                ${query} ✕
            </span>
        `).join('')}
    `;

    searchHistoryEl.innerHTML = historyHTML;
}

/**
 * Abre el modal con detalles de la receta
 * @async
 */
async function openRecipeModal(mealId) {
    const recipe = await getRecipeDetails(mealId);
    
    if (!recipe) return;

    state.currentRecipe = recipe;
    const isFav = favorites.isFavorited(mealId);

    // Template literal con destructuring
    const ingredients = recipe.getIngredients && recipe.getIngredients() ? 
        recipe.getIngredients() : 
        (() => {
            const ing = [];
            for (let i = 1; i <= 20; i++) {
                if (recipe[`strIngredient${i}`]) {
                    ing.push({
                        name: recipe[`strIngredient${i}`],
                        measure: recipe[`strMeasure${i}`] || 'al gusto'
                    });
                }
            }
            return ing;
        })();

    const ingredientsHTML = ingredients
        .map(({ name, measure }) => `<li>${measure} ${name}</li>`)
        .join('');

    const videoLink = recipe.youtube ? `
        <a href="${recipe.youtube}" target="_blank">
            <i class="fa-brands fa-youtube"></i> Ver video en YouTube
        </a>
    ` : '';

    const categoryEsp = translateCategory(recipe.category);
    const areaEsp = translateArea(recipe.area);

    modalBody.innerHTML = `
        <h2 class="modal-title">${recipe.name}</h2>
        <img src="${recipe.image}" alt="${recipe.name}" class="modal-image">
        
        <div class="modal-section">
            <h3>Información</h3>
            <p><strong>Categoría:</strong> ${categoryEsp}</p>
            <p><strong>Cocina:</strong> ${areaEsp}</p>
            ${videoLink}
        </div>

        <div class="modal-section">
            <h3>Ingredientes (${ingredients.length})</h3>
            <ul>${ingredientsHTML}</ul>
        </div>

        <div class="modal-section">
            <h3>Instrucciones</h3>
            <div class="modal-instructions" id="modalInstructions">${recipe.instructions}</div>
            <button class="btn-small" id="translateBtn">
                <i class="fa-solid fa-language"></i> Traducir al español
            </button>
        </div>

        <div class="modal-footer">
            <button class="btn-large btn-add-favorite ${isFav ? 'added' : ''}" 
                    onclick="toggleFavoriteFromModal('${mealId}', '${recipe.name}', '${recipe.image}', '${recipe.category}', '${recipe.area}')">
                ${isFav ? '<i class="fa-solid fa-heart"></i> Ya está guardada' : '<i class="fa-regular fa-heart"></i> Agregar a favoritas'}
            </button>
        </div>
    `;

    // Agrega funcionalidad al botón de traducir
    const translateBtn = document.getElementById('translateBtn');
    if (translateBtn) {
        translateBtn.addEventListener('click', async () => {
            const instructionsEl = document.getElementById('modalInstructions');
            const originalText = recipe.instructions;
            
            if (translateBtn.textContent.includes('Traducir')) {
                translateBtn.disabled = true;
                translateBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Traduciendo...';
                
                try {
                    const translatedText = await translateToSpanish(originalText);
                    instructionsEl.textContent = translatedText;
                    translateBtn.innerHTML = '<i class="fa-solid fa-language"></i> Mostrar original';
                } catch (error) {
                    console.error('Error en traducción:', error);
                    instructionsEl.textContent = 'Error al traducir. Intenta de nuevo.';
                    translateBtn.innerHTML = '<i class="fa-solid fa-language"></i> Traducir al español';
                } finally {
                    translateBtn.disabled = false;
                }
            } else {
                instructionsEl.textContent = originalText;
                translateBtn.innerHTML = '<i class="fa-solid fa-language"></i> Traducir al español';
            }
        });
    }

    recipeModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

/**
 * Cierra el modal de detalles
 */
function closeRecipeModal() {
    recipeModal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

/**
 * Alterna el estado de favorita desde la tarjeta
 */
function toggleFavorite(id, name, image, category, area) {
    if (favorites.isFavorited(id)) {
        favorites.remove(id);
    } else {
        favorites.add({ id, name, image, category, area });
    }

    renderRecipes();
    renderFavorites();

    // Actualiza el modal si está abierto
    if (state.currentRecipe && state.currentRecipe.id === id) {
        openRecipeModal(id);
    }
}

/**
 * Alterna favorita desde el modal
 */
function toggleFavoriteFromModal(id, name, image, category, area) {
    if (favorites.isFavorited(id)) {
        favorites.remove(id);
    } else {
        favorites.add({ id, name, image, category, area });
    }

    renderFavorites();
    openRecipeModal(id);
}

/**
 * Cambia entre pestañas
 */
function switchTab(tabName) {
    state.currentTab = tabName;

    // Actualiza botones de pestaña
    tabBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabName);
    });

    // Actualiza contenido de pestañas
    tabContents.forEach(content => {
        content.classList.toggle('active', content.id === `${tabName}-tab`);
    });

    // Renderiza favoritas si es necesario
    if (tabName === 'favorites') {
        renderFavorites();
    }
}

// =====================
// FUNCIONES DE ESTADO
// =====================

/**
 * Muestra el estado de cargando
 */
function setLoading(isLoading) {
    state.loading = isLoading;
    loadingEl.classList.toggle('active', isLoading);
}

/**
 * Muestra un mensaje de error
 */
function showError(message) {
    state.error = message;
    errorEl.classList.add('active');
    errorMessage.textContent = message;
}

/**
 * Limpia el error
 */
function clearError() {
    state.error = null;
    errorEl.classList.remove('active');
}

// =====================
// TEMA OSCURO
// =====================

/**
 * Inicializa el tema oscuro/claro desde localStorage
 */
function initializeTheme() {
    const isDarkMode = localStorage.getItem('recipeRoulette_darkMode') === 'true';
    
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
    } else {
        themeToggle.innerHTML = '<i class="fa-solid fa-moon"></i>';
    }
}

/**
 * Alterna el tema oscuro
 */
function toggleTheme() {
    const isDarkMode = document.body.classList.toggle('dark-mode');
    localStorage.setItem('recipeRoulette_darkMode', isDarkMode);
    themeToggle.innerHTML = isDarkMode ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
}

// =====================
// EVENT LISTENERS
// =====================

// Búsqueda
searchBtn.addEventListener('click', () => {
    searchRecipesByName(searchInput.value);
});

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchRecipesByName(searchInput.value);
    }
});

// Receta aleatoria
randomBtn.addEventListener('click', getRandomRecipe);

// Filtros
categoryFilter.addEventListener('change', () => {
    filterRecipes();
    renderRecipes();
});

areaFilter.addEventListener('change', () => {
    filterRecipes();
    renderRecipes();
});

// Modal
closeModal.addEventListener('click', closeRecipeModal);
recipeModal.addEventListener('click', (e) => {
    if (e.target === recipeModal) {
        closeRecipeModal();
    }
});

// Pestañas
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        switchTab(btn.dataset.tab);
    });
});

// Tema
themeToggle.addEventListener('click', toggleTheme);

// Reintentar después de error
retryBtn.addEventListener('click', () => {
    clearError();
    searchRecipesByName(searchInput.value || 'Pasta');
});

// =====================
// INICIALIZACIÓN
// =====================

async function init() {
    // Inicializa tema
    initializeTheme();

    // Carga categorías y áreas para los filtros
    await loadCategories();
    await loadAreas();

    // Renderiza historial
    renderSearchHistory();

    // Realiza búsqueda inicial de ejemplo
    searchRecipesByName('Pasta');
}

// Inicia la app cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', init);

