export const environment = {
  production: true,
  // ✅ Esta es la línea clave.
  // Le decimos a Angular que busque una variable de entorno llamada API_URL.
  // Si no la encuentra, usará una URL por defecto (que no debería pasar en Amplify).
  apiUrl: process.env['API_URL'] || 'http://default-api-url.com'
};
