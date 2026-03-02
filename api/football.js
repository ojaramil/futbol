export default async function handler(req, res) {
    // Escogemos la competición que quieras. PD = Primera División (La Liga), CL = Champions League
    const url = 'https://api.football-data.org/v4/competitions/PD/matches?status=FINISHED&limit=8';

    try {
        // Hacemos la petición a la API oficial desde el servidor de Vercel
        // Usamos process.env.FOOTBALL_API_TOKEN que estará en Vercel, no en el código origin
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
