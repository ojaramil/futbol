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

        function togglePlay() {
            if (isPlaying) {
                audio.pause();
                playIcon.classList.remove('fa-pause');
                playIcon.classList.add('fa-play');
                // Optional: pulsating effect removal
                playBtn.style.animation = 'none';
                isPlaying = false;
            } else {
                audio.play().then(() => {
                    playIcon.classList.remove('fa-play');
                    playIcon.classList.add('fa-pause');
                    playBtn.style.animation = 'pulse 2s infinite';
                    isPlaying = true;
                    playerContainer.classList.add('active');

                    // Media Session Metadata (Lock Screen)
                    if ('mediaSession' in navigator) {
                        navigator.mediaSession.metadata = new MediaMetadata({
                            title: 'Signal Radio',
                            artist: 'Primera emisora neuro-amigable y neuro-inclusiva de origen hispano y alcance global',
                            album: 'Hablando de Fútbol',
                            artwork: [
                                { src: 'logo2.jpg', sizes: '512x512', type: 'image/jpeg' }
                            ]
                        });

                        navigator.mediaSession.setActionHandler('play', function () { togglePlay(); });
                        navigator.mediaSession.setActionHandler('pause', function () { togglePlay(); });
                        navigator.mediaSession.setActionHandler('stop', function () { togglePlay(); });
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

    console.log('Hablando de Futbol - Official Colors Loaded');
});
