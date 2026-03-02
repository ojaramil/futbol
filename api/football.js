export default async function handler(req, res) {
    const comp = req.query.comp;
    const team = req.query.team;
    const limit = req.query.limit || '2';
    const status = req.query.status || 'FINISHED';

    let url = '';

    if (team) {
        // Equipos permitidos: 81 (Barcelona), 86 (Real Madrid), 186 (Boca Juniors), 190 (River Plate)
        const allowedTeams = ['81', '86', '186', '190'];
        const safeTeam = allowedTeams.includes(team) ? team : '86';
        url = `https://api.football-data.org/v4/teams/${safeTeam}/matches?status=${status}&limit=${limit}`;
    } else {
        // Competiciones: CL, CLI, PD, BL1 (Bundesliga), FL1 (Ligue 1), SA (Serie A)
        const allowedComps = ['CL', 'CLI', 'PD', 'BL1', 'FL1', 'SA'];
        const safeComp = allowedComps.includes(comp) ? comp : 'CL';
        url = `https://api.football-data.org/v4/competitions/${safeComp}/matches?status=${status}&limit=${limit}`;
    }

    try {
        const response = await fetch(url, {
            headers: {
                'X-Auth-Token': process.env.FOOTBALL_API_TOKEN
            }
        });

        if (!response.ok) {
            throw new Error(`API respondió con estatus: ${response.status}`);
        }

        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        console.error('Error obteniendo resultados:', error);
        res.status(500).json({ error: 'Error al obtener resultados de fútbol' });
    }
}
