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

    console.log('Hablando de Futbol - Official Colors Loaded');
});
