export default async function handler(req, res) {
    // Fuente confiable de noticias de Fútbol (Diario MARCA como ejemplo)
    const rssUrl = 'https://e00-marca.uecdn.es/rss/futbol.xml';

    try {
        const response = await fetch(rssUrl);
        if (!response.ok) {
            throw new Error(`Error en la fuente de noticias: ${response.status}`);
        }

        const xmlText = await response.text();

        // Extraer usando regex básico (porque Vercel no siempre tiene xml2js)
        const items = xmlText.split('<item>');
        items.shift(); // Quitamos la cabecera (antes del primer <item>)

        const newsList = [];

        for (let i = 0; i < Math.min(items.length, 6); i++) {
            const item = items[i];

            // TITULO
            const titleMatch = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/) || item.match(/<title>(.*?)<\/title>/);
            // ENLACE
            const linkMatch = item.match(/<link>(.*?)<\/link>/);
            // DESCRIPCION
            const descMatch = item.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/) || item.match(/<description>(.*?)<\/description>/);

            if (titleMatch && titleMatch[1]) {
                const title = titleMatch[1].replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, "&");
                const link = linkMatch && linkMatch[1] ? linkMatch[1] : '#';

                // Limpiar descripción básica
                let desc = descMatch && descMatch[1] ? descMatch[1] : 'Sigue la última hora del deporte rey.';
                desc = desc.replace(/<[^>]+>/g, '').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, "&");
                if (desc.length > 90) desc = desc.substring(0, 87) + '...';

                // Filtramos "Exclusiva MARCA" u otros ruidos
                if (title.length > 5) {
                    newsList.push({
                        title: title,
                        link: link,
                        desc: desc
                    });
                }
            }
        }

        if (newsList.length === 0) {
            newsList.push({
                title: '⚽ Signal Radio | Tu conexión directa con las grandes ligas',
                link: '#',
                desc: 'Consulta los marcadores y próxima jornada en nuestra zona inferior.'
            });
        }

        // Cache 1 hora
        res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
        res.status(200).json({ articles: newsList });

    } catch (error) {
        console.error('Error buscando RSS:', error);
        res.status(500).json({
            articles: [{
                title: '⚽ Signal Radio | Tu conexión directa con las grandes ligas',
                link: '#',
                desc: 'Consulta los marcadores y próxima jornada en nuestra zona inferior.'
            }]
        });
    }
}
