export default async function handler(req, res) {
    // Fuente confiable de noticias de Fútbol (Diario MARCA como ejemplo)
    const rssUrl = 'https://e00-marca.uecdn.es/rss/futbol.xml';

    try {
        const response = await fetch(rssUrl);
        if (!response.ok) {
            throw new Error(`Error en la fuente de noticias: ${response.status}`);
        }

        const xmlText = await response.text();

        // Extraer rápidamente usando regex básico (porque Vercel no siempre tiene xml2js instalado por defecto)
        const items = xmlText.split('<item>');
        items.shift(); // Quitamos la cabecera (antes del primer <item>)

        const newsList = [];

        for (let i = 0; i < Math.min(items.length, 6); i++) {
            const item = items[i];

            // Buscar el título, el formato RSS normal suele usar CDATA
            const titleMatchContent = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)
                || item.match(/<title>(.*?)<\/title>/);

            if (titleMatchContent && titleMatchContent[1]) {
                const title = titleMatchContent[1]
                    .replace(/&quot;/g, '"')
                    .replace(/&apos;/g, "'")
                    .replace(/&amp;/g, "&");

                // Filtramos "Exclusiva MARCA" u otros ruidos
                if (title.length > 5) {
                    newsList.push(title);
                }
            }
        }

        if (newsList.length === 0) {
            newsList.push('⚽ Signal Radio | Tu conexión directa con las grandes ligas');
            newsList.push('Consulta los marcadores y próxima jornada en nuestra zona inferior.');
            newsList.push('Sigue todos los resúmenes y emisiones de la semana aquí.');
        }

        // Cache 1 hora
        res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
        res.status(200).json({ headlines: newsList });

    } catch (error) {
        console.error('Error buscando RSS:', error);
        res.status(500).json({
            headlines: [
                '⚽ Signal Radio | Tu conexión directa con las grandes ligas',
                'Consulta los marcadores y próxima jornada en nuestra zona inferior.',
                'Sigue todos los resúmenes y emisiones de la semana aquí.'
            ]
        });
    }
}
