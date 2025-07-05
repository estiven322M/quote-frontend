// --- CONSTANTES ---
//const BACKEND_URL = 'http://127.0.0.1:5000';
const BACKEND_URL = 'https://citas-app-backend.onrender.com';

// --- SELECCIÓN DE ELEMENTOS DEL DOM ---
// Se guardan referencias a los elementos HTML para no tener que buscarlos cada vez
const quoteTextElement = document.querySelector('#quote-text span');
const quoteAuthorElement = document.getElementById('quote-author');
const newQuoteBtn = document.getElementById('new-quote-btn');
const twitterBtn = document.getElementById('twitter-btn');
const facebookBtn = document.getElementById('facebook-btn');
const downloadBtn = document.getElementById('download-btn');

// --- VARIABLES DE ESTADO DE LA APLICACIÓN ---
// Guardan la cita y autor actuales para ser usados por otras funciones
let currentQuote = "";
let currentAuthor = "";

// --- FUNCIONES ---

/**
 * Obtiene una nueva cita del backend y actualiza la interfaz
 * Es una función 'async' porque usa 'await' para esperar la respuesta de la red
 */
async function getNewQuote() {
    quoteTextElement.textContent = "Generando nueva cita...";
    quoteAuthorElement.textContent = "";

    try {
        // Llama al endpoint '/api/get-quote' del backend
        const response = await fetch(`${BACKEND_URL}/api/get-quote`);
        // Convierte la respuesta de texto a un objeto JSON
        const data = await response.json();

        // Actualiza las variables de estado globales
        currentQuote = data.quote;
        currentAuthor = data.author;

        // Actualiza el contenido en la página
        quoteTextElement.textContent = currentQuote;
        quoteAuthorElement.innerHTML = `— <em>${currentAuthor}</em>`;
    } catch (error) {
        // Manejo de errores en caso de que falle la conexión o la respuesta
        console.error("Error al obtener la cita:", error);
        quoteTextElement.textContent = "No se pudo cargar una cita. Intente de nuevo.";
    }
}

/**
 * Abre una nueva ventana para compartir la cita actual en X.
 */
function shareOnTwitter() {
    const tweet = `"${currentQuote}" — ${currentAuthor}`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweet)}`;
    window.open(twitterUrl, '_blank'); // '_blank' abre en una nueva pestaña
}

/**
 * Abre una nueva ventana para compartir la página actual en Facebook
 */
function shareOnFacebook() {
    const pageUrl = window.location.href;
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`;
    window.open(facebookUrl, '_blank');
}

/**
 * Pide al backend que genere una imagen de la cita y la descarga
 */
async function downloadQuoteImage() {
    if (!currentQuote) {
        alert("Primero, genera una cita.");
        return;
    }

    try {
        // Llama al endpoint '/api/create-image' con el método POST
        const response = await fetch(`${BACKEND_URL}/api/create-image`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            // Envía la cita y autor actuales en el cuerpo de la petición.
            body: JSON.stringify({ quote: currentQuote, author: currentAuthor })
        });
        
        if (!response.ok) throw new Error('La respuesta del servidor no fue OK');
        // La respuesta del backend es un archivo binario (blob)
        const imageBlob = await response.blob();
        // Crea una URL temporal en el navegador para ese archivo
        const imageUrl = URL.createObjectURL(imageBlob);

        // Crea un enlace <a> invisible para iniciar la descarga
        const downloadLink = document.createElement('a');
        downloadLink.href = imageUrl;
        downloadLink.download = 'cita_generada.png'; // Nombre del archivo
        downloadLink.click();
        
    } catch (error) {
        console.error("Error al generar la imagen:", error);
        alert("No se pudo generar la imagen.");
    }
}

// --- EVENT LISTENERS (Conexión de botones con funciones) ---
newQuoteBtn.addEventListener('click', getNewQuote);
twitterBtn.addEventListener('click', shareOnTwitter);
facebookBtn.addEventListener('click', shareOnFacebook);
downloadBtn.addEventListener('click', downloadQuoteImage);

// --- INICIALIZACIÓN ---
// Carga la primera cita cuando la página está lista.
getNewQuote();