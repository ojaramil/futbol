export default async function handler(req, res) {
    // Obtenemos la competición y el límite de los query params, o usamos valores por defecto
    const comp = req.query.comp || 'CL';
    const limit = req.query.limit || '4';
    const status = req.query.status || 'FINISHED';

    // Lista de competiciones permitidas para evitar abusos (Free tier soporta estas)
    // CL: Champions, CLI: Libertadores, PD: Primera División (España)
    const allowedComps = ['CL', 'CLI', 'PD'];
    const safeComp = allowedComps.includes(comp) ? comp : 'CL';

    const url = `https://api.football-data.org/v4/competitions/${safeComp}/matches?status=${status}&limit=${limit}`;

    try {
        // Hacemos la petición a la API oficial desde el servidor de Vercel
        // Usamos process.env.FOOTBALL_API_TOKEN que estará en Vercel, no en el código fuente
        const response = await fetch(url, {
            headers: {
                'X-Auth-Token': process.env.FOOTBALL_API_TOKEN
            }
        });

        if (!response.ok) {
            throw new Error(`API respondió con estatus: ${response.status}`);
        }

        const data = await response.json();

        // Devolvemos la data al cliente (tu página web)
        res.status(200).json(data);
    } catch (error) {
        console.error('Error obteniendo resultados:', error);
        res.status(500).json({ error: 'Error al obtener resultados de fútbol' });
    }
}
