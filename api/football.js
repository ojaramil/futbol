export default async function handler(req, res) {
    const status = req.query.status || 'FINISHED';

    // Calcular fechas permitidas (máximo 10 días de rango en plan gratuito)
    const today = new Date();
    const fromDate = new Date();
    const toDate = new Date();

    if (status === 'FINISHED') {
        fromDate.setDate(today.getDate() - 10);
        toDate.setDate(today.getDate());
    } else {
        fromDate.setDate(today.getDate());
        toDate.setDate(today.getDate() + 10);
    }

    const fromStr = fromDate.toISOString().split('T')[0];
    const toStr = toDate.toISOString().split('T')[0];

    // Llamamos a un único endpoint global que trae todo lo que sucedió en esos 10 días
    const url = `https://api.football-data.org/v4/matches?dateFrom=${fromStr}&dateTo=${toStr}&status=${status}`;

    try {
        const response = await fetch(url, {
            headers: {
                'X-Auth-Token': process.env.FOOTBALL_API_TOKEN
            }
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        const matches = data.matches || [];

        // Agrupamos en las 10 categorías requeridas
        const queries = [
            { type: 'comp', id: 'PD', name: '🇪🇸 La Liga Española' },
            { type: 'comp', id: 'CL', name: '🏆 Champions League' },
            { type: 'comp', id: 'CLI', name: '🌎 Copa Libertadores' },
            { type: 'comp', id: 'BL1', name: '🇩🇪 Bundesliga' },
            { type: 'comp', id: 'FL1', name: '🇫🇷 Ligue 1' },
            { type: 'comp', id: 'SA', name: '🇮🇹 Serie A' },
            { type: 'team', id: 81, name: '🔵🔴 FC Barcelona' },
            { type: 'team', id: 86, name: '⚪ Real Madrid' },
            { type: 'team', id: 186, name: '🟡🔵 Boca Juniors' },
            { type: 'team', id: 190, name: '⚪🔴 River Plate' }
        ];

        const results = [];

        queries.forEach(q => {
            let filtered = [];
            if (q.type === 'comp') {
                filtered = matches.filter(m => m.competition && m.competition.code === q.id);
            } else if (q.type === 'team') {
                filtered = matches.filter(m =>
                    (m.homeTeam && m.homeTeam.id === q.id) ||
                    (m.awayTeam && m.awayTeam.id === q.id)
                );
            }

            // Ordenar por fecha para asegurar que traemos los 2 más recientes / próximos
            if (status === 'FINISHED') {
                filtered.sort((a, b) => new Date(b.utcDate) - new Date(a.utcDate));
            } else {
                filtered.sort((a, b) => new Date(a.utcDate) - new Date(b.utcDate));
            }

            // Tomar máximo 2
            filtered = filtered.slice(0, 2);

            results.push({
                name: q.name,
                matches: filtered
            });
        });

        // Cache mágico de Vercel (Guarda el resultado 1 hora en CDN para no gastar peticiones si entran muchos usuarios)
        res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
        res.status(200).json(results);

    } catch (error) {
        console.error('Error obteniendo resultados:', error);
        res.status(500).json({ error: 'Error al obtener resultados' });
    }
}
