document.addEventListener('DOMContentLoaded', () => {
    // Mobile Menu Toggle
    const mobileToggle = document.querySelector('.mobile-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (mobileToggle) {
        mobileToggle.addEventListener('click', () => {
            navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
            if (navLinks.style.display === 'flex') {
                navLinks.style.flexDirection = 'column';
                navLinks.style.position = 'absolute';
                navLinks.style.top = '100%';
                navLinks.style.left = '0';
                navLinks.style.width = '100%';
                navLinks.style.background = 'var(--navy-dark)';
                navLinks.style.padding = '20px';
                navLinks.style.zIndex = '999';
            } else {
                navLinks.removeAttribute('style');
            }
        });
    }

    // Smooth Scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });

                // Close mobile menu
                if (window.innerWidth <= 768) {
                    navLinks.style.display = 'none';
                    navLinks.removeAttribute('style');
                }
            }
        });
    });

    // --- Radio Player Logic ---
    const playerContainer = document.getElementById('fixed-player');
    const playBtn = document.getElementById('main-play-btn');
    const audio = document.getElementById('radio-stream');
    const heroListenBtn = document.getElementById('hero-listen-btn');
    const volumeSlider = document.getElementById('volume-slider');

    // Safety check if elements exist
    if (playerContainer && playBtn && audio) {
        const playIcon = playBtn.querySelector('i');
        let isPlaying = false;

        // Setup Media Session immediately if available
        if ('mediaSession' in navigator) {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: 'Signal Radio',
                artist: 'Primera emisora neuro-amigable y neuro-inclusiva de origen hispano y alcance global',
                album: 'Hablando de Fútbol',
                artwork: [
                    { src: 'https://futbol.signalradio.club/logo2.jpg', sizes: '512x512', type: 'image/jpeg' },
                    { src: 'https://futbol.signalradio.club/logo2.jpg', sizes: '96x96', type: 'image/jpeg' }
                ]
            });

            navigator.mediaSession.setActionHandler('play', function () { togglePlay(); });
            navigator.mediaSession.setActionHandler('pause', function () { togglePlay(); });
            navigator.mediaSession.setActionHandler('stop', function () { togglePlay(); });
        }

        function togglePlay() {
            if (isPlaying) {
                audio.pause();
                playIcon.classList.remove('fa-pause');
                playIcon.classList.add('fa-play');
                // Optional: pulsating effect removal
                playBtn.style.animation = 'none';
                isPlaying = false;

                // Update playback state
                if ('mediaSession' in navigator) {
                    navigator.mediaSession.playbackState = "paused";
                }
            } else {
                audio.play().then(() => {
                    playIcon.classList.remove('fa-play');
                    playIcon.classList.add('fa-pause');
                    playBtn.style.animation = 'pulse 2s infinite';
                    isPlaying = true;
                    playerContainer.classList.add('active');

                    // Update playback state
                    if ('mediaSession' in navigator) {
                        navigator.mediaSession.playbackState = "playing";
                    }
                }).catch(err => {
                    console.error('Playback error:', err);
                    alert('No se pudo iniciar la reproducción. Revisa tu conexión.');
                });
            }
        }

        // Hero Button Trigger
        if (heroListenBtn) {
            heroListenBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (!isPlaying) togglePlay();
                playerContainer.classList.add('active');
            });
        }

        // Main Play Button
        playBtn.addEventListener('click', togglePlay);

        // Volume Control
        if (volumeSlider) {
            volumeSlider.addEventListener('input', (e) => {
                audio.volume = e.target.value;
            });
        }

        // Auto-show player after delay
        setTimeout(() => {
            playerContainer.classList.add('active');
        }, 1500);
    }

    // --- UX Updates: Tabs & Video Facades ---

    // 1. Mobile Match Tabs Logic
    const tabBtns = document.querySelectorAll('.tab-btn');
    const matchCols = document.querySelectorAll('.match-col');

    if (tabBtns.length > 0) {
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove active class from all buttons and cols
                tabBtns.forEach(b => b.classList.remove('active'));
                matchCols.forEach(c => c.classList.remove('active'));

                // Add active to clicked button
                btn.classList.add('active');

                // Show corresponding content
                const tabId = btn.getAttribute('data-tab');
                const targetCol = document.getElementById(tabId);
                if (targetCol) {
                    targetCol.classList.add('active');
                }
            });
        });
    }

    // 2. Lite YouTube Facade Logic
    const videoFacades = document.querySelectorAll('.video-facade');

    videoFacades.forEach(facade => {
        facade.addEventListener('click', function () {
            if (this.querySelector('iframe')) return; // Already loaded

            const videoId = this.getAttribute('data-id');
            const iframe = document.createElement('iframe');

            iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
            iframe.title = 'YouTube video player';
            iframe.frameBorder = '0';
            iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
            iframe.allowFullscreen = true;

            // Style iframe to fill container
            iframe.style.position = 'absolute';
            iframe.style.top = '0';
            iframe.style.left = '0';
            iframe.style.width = '100%';
            iframe.style.height = '100%';

            this.appendChild(iframe);
            const playOverlay = this.querySelector('.play-overlay');
            if (playOverlay) playOverlay.style.display = 'none';
        });
    });

    // 3. Obtener resultados de fútbol (Vía Vercel Serverless Function)
    const loadFootballResults = async () => {
        const resultsContainer = document.getElementById('results-container');
        if (!resultsContainer) return;

        resultsContainer.innerHTML = '<div class="score-card"><span class="match-teams">Cargando ligas...</span></div>';

        const competitions = [
            { id: 'CL', name: '🏆 Champions League' },
            { id: 'CLI', name: '🌎 Copa Libertadores' },
            { id: 'PD', name: '🇪🇸 La Liga Española' }
        ];

        try {
            resultsContainer.innerHTML = '';

            for (const comp of competitions) {
                // Título de la competición
                resultsContainer.innerHTML += `<h4 style="margin: 20px 0 10px; color: var(--navy-dark); font-family: var(--font-display); font-size: 1.1rem; border-bottom: 2px solid var(--sky-blue); padding-bottom: 5px;">${comp.name}</h4>`;

                // Pedimos 3 resultados por cada torneo
                const response = await fetch(`/api/football?comp=${comp.id}&limit=3`);

                if (!response.ok) {
                    continue;
                }

                const data = await response.json();

                if (data && data.matches && data.matches.length > 0) {
                    data.matches.forEach(match => {
                        const homePens = match.score.penalties?.home;
                        const awayPens = match.score.penalties?.away;

                        const scoreText = (homePens !== undefined && awayPens !== undefined)
                            ? `${match.score.regularTime?.home ?? 0}(${homePens}) - ${match.score.regularTime?.away ?? 0}(${awayPens})`
                            : `${match.score.fullTime?.home ?? '-'} - ${match.score.fullTime?.away ?? '-'}`;

                        // Evitar que nombres sean muy largos
                        const homeName = match.homeTeam.shortName || match.homeTeam.name;
                        const awayName = match.awayTeam.shortName || match.awayTeam.name;

                        const matchHtml = `
                            <div class="score-card">
                                <span class="match-teams">${homeName} vs ${awayName}</span>
                                <span class="match-score">${scoreText}</span>
                            </div>
                        `;
                        resultsContainer.innerHTML += matchHtml;
                    });
                } else {
                    resultsContainer.innerHTML += '<div class="score-card"><span class="match-teams" style="color: #666; font-size: 0.9em;">Sin resultados recientes disponibles</span></div>';
                }
            }

        } catch (error) {
            console.error('Error cargando resultados de futbol:', error);
            resultsContainer.innerHTML = `
                <div class="score-card">
                    <span class="match-teams">Error cargando marcadores temporales</span>
                    <span class="match-score">-</span>
                </div>
            `;
        }
    };

    // Llamamos la función al final
    loadFootballResults();

    // 4. Obtener la agenda de los próximos partidos
    const loadFootballSchedule = async () => {
        const scheduleContainer = document.getElementById('schedule-container');
        if (!scheduleContainer) return;

        scheduleContainer.innerHTML = '<div class="schedule-item"><div class="schedule-match">Cargando agenda...</div></div>';

        const competitions = [
            { id: 'CL', name: '🏆 Champions League' },
            { id: 'CLI', name: '🌎 Copa Libertadores' },
            { id: 'PD', name: '🇪🇸 La Liga Española' }
        ];

        try {
            scheduleContainer.innerHTML = '';

            for (const comp of competitions) {
                // Pedimos 3 resultados por cada torneo, ahora usamos status=SCHEDULED
                const response = await fetch(`/api/football?comp=${comp.id}&status=SCHEDULED&limit=3`);

                if (!response.ok) {
                    continue;
                }

                const data = await response.json();

                if (data && data.matches && data.matches.length > 0) {
                    scheduleContainer.innerHTML += `<h4 style="margin: 20px 0 10px; color: var(--navy-dark); font-family: var(--font-display); font-size: 1.1rem; border-bottom: 2px solid var(--sky-blue); padding-bottom: 5px;">${comp.name}</h4>`;

                    data.matches.forEach(match => {
                        const dateObj = new Date(match.utcDate);

                        // Obtenemos la fecha y hora en la zona horaria del usuario (navegador)
                        const options = { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
                        const localDate = dateObj.toLocaleDateString('es-ES', options).toUpperCase();

                        const homeName = match.homeTeam.shortName || match.homeTeam.name;
                        const awayName = match.awayTeam.shortName || match.awayTeam.name;

                        scheduleContainer.innerHTML += `
                            <div class="schedule-item" style="padding: 10px 15px; margin-bottom: 10px; border-bottom: 1px solid #efefef; background: white; border-radius: 4px;">
                                <div class="schedule-match" style="font-family: var(--font-display); font-size: 1.1rem; color: var(--navy-dark);">${homeName} vs ${awayName}</div>
                                <div class="schedule-time-group" style="margin-top: 5px;">
                                    <span class="date-badge" style="background: var(--navy-dark); color: white; padding: 4px 8px; border-radius: 4px; font-size: 0.8rem; font-weight: bold; border-left: 3px solid var(--sky-blue);">${localDate} (Local)</span>
                                </div>
                            </div>
                        `;
                    });
                } else {
                    scheduleContainer.innerHTML += `<h4 style="margin: 20px 0 10px; color: var(--navy-dark); font-family: var(--font-display); font-size: 1.1rem; border-bottom: 2px solid var(--sky-blue); padding-bottom: 5px;">${comp.name}</h4>`;
                    scheduleContainer.innerHTML += '<div class="schedule-item"><div class="schedule-match" style="color: #666; font-size: 0.9em;">Sin partidos programados pronto</div></div>';
                }
            }

        } catch (error) {
            console.error('Error cargando la agenda:', error);
            scheduleContainer.innerHTML = '<div class="schedule-item"><div class="schedule-match" style="color: red;">Error al cargar la agenda</div></div>';
        }
    };

    loadFootballSchedule();

    console.log('Hablando de Futbol - Official Colors Loaded');
});
