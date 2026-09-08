document.addEventListener('DOMContentLoaded', () => {
    class GlitchCharReveal {
        constructor(element) {
            this.element = element;
            this.originalText = element.innerText;
            this.chars = this.originalText.split('');
            this.GLITCH_CHARS_UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            this.GLITCH_CHARS_LOWER = "abcdefghijklmnopqrstuvwxyz";
            this.WAVE_CURSOR_CHARS = "░▒▓█";

            this.charElements = [];
            this.isAnimating = false;

            this.init();
        }

        init() {
            this.element.innerHTML = '';
            this.element.style.display = 'inline-block';

            this.chars.forEach((char) => {
                const span = document.createElement('span');
                span.style.display = 'inline-block';
                span.style.whiteSpace = 'pre';
                span.style.minWidth = char === ' ' ? '0.25em' : 'auto';
                span.innerText = char;
                this.charElements.push({
                    el: span,
                    char: char,
                    isSpace: char === ' '
                });
                this.element.appendChild(span);
            });

            const observer = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting) {
                    this.playEnterAnimation();
                    observer.disconnect();
                }
            });
            observer.observe(this.element);

            this.element.addEventListener('mouseenter', () => {
                if (!this.isAnimating) {
                    this.playWaveAnimation();
                }
            });
        }

        getRandomChar(originalChar) {
            if (Math.random() < 0.2) {
                return this.WAVE_CURSOR_CHARS[Math.floor(Math.random() * this.WAVE_CURSOR_CHARS.length)];
            }
            const isLower = originalChar === originalChar.toLowerCase() && originalChar !== originalChar.toUpperCase();
            const pool = isLower ? this.GLITCH_CHARS_LOWER : this.GLITCH_CHARS_UPPER;
            return pool[Math.floor(Math.random() * pool.length)];
        }

        async playEnterAnimation() {
            this.isAnimating = true;
            const duration = 3000;
            const delayPerChar = duration / this.chars.length;

            const promises = this.charElements.map((item, index) => {
                return new Promise(resolve => {
                    if (item.isSpace) {
                        setTimeout(resolve, index * delayPerChar);
                        return;
                    }

                    setTimeout(async () => {
                        const glitchFrames = 8 + Math.floor(Math.random() * 8);
                        for (let i = 0; i < glitchFrames; i++) {
                            item.el.innerText = this.getRandomChar(item.char);
                            await this.sleep(60);
                        }
                        item.el.innerText = item.char;
                        resolve();
                    }, index * delayPerChar * 0.5);
                });
            });

            await Promise.all(promises);
            this.isAnimating = false;
        }

        async playWaveAnimation() {
            this.isAnimating = true;
            const waveSpeed = 80;

            const promises = this.charElements.map((item, index) => {
                return new Promise(resolve => {
                    if (item.isSpace) {
                        setTimeout(resolve, index * waveSpeed);
                        return;
                    }

                    setTimeout(async () => {
                        const glitchFrames = 5 + Math.floor(Math.random() * 5);
                        for (let i = 0; i < glitchFrames; i++) {
                            item.el.innerText = this.getRandomChar(item.char);
                            await this.sleep(60);
                        }
                        item.el.innerText = item.char;
                        resolve();
                    }, index * waveSpeed);
                });
            });

            await Promise.all(promises);
            this.isAnimating = false;
        }

        sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }
    }

    const titleEl = document.getElementById('glitch-title');
    if (titleEl) {
        new GlitchCharReveal(titleEl);
    }

    class Typewriter {
        constructor(element, text) {
            this.element = element;
            this.text = text;
            this.typeDelayMs = 70;
            this.cursorChar = "_";
            
            this.displayText = "";
            this.currentIndex = 0;
            
            this.init();
        }

        init() {
            this.element.innerHTML = '';
            
            this.textSpan = document.createElement('span');
            this.element.appendChild(this.textSpan);

            this.cursorSpan = document.createElement('span');
            this.cursorSpan.innerText = this.cursorChar;
            this.cursorSpan.style.marginLeft = "0.25rem";
            this.cursorSpan.style.animation = "typewriter-blink 0.8s step-end infinite";
            
            if (!document.getElementById('typewriter-style')) {
                const style = document.createElement('style');
                style.id = 'typewriter-style';
                style.innerHTML = `@keyframes typewriter-blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }`;
                document.head.appendChild(style);
            }

            this.element.appendChild(this.cursorSpan);

            const observer = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting) {
                    this.displayText = "";
                    this.currentIndex = 0;
                    this.startTyping();
                }
            });
            observer.observe(this.element);
        }

        startTyping() {
            if (this.currentIndex < this.text.length) {
                this.displayText += this.text[this.currentIndex];
                this.textSpan.innerText = this.displayText;
                this.currentIndex++;
                setTimeout(() => this.startTyping(), this.typeDelayMs);
            }
        }
    }

    const typeWriterEl = document.getElementById('typewriter-title');
    if (typeWriterEl) {
        new Typewriter(typeWriterEl, "Tạo tài khoản mới");
    }

    initCaptchaSlider();
    initLoginParticles();
});

// --- CAPTCHA SLIDER INITIALIZATION ---
function initCaptchaSlider() {
  const wrapper = document.getElementById('captcha-image-wrapper');
  const piece = document.getElementById('captcha-piece');
  const hole = document.getElementById('captcha-hole');
  const btn = document.getElementById('slider-btn');
  const track = document.getElementById('slider-track');
  const text = document.getElementById('slider-text');
  const input = document.getElementById('captcha-verified');
  if (!wrapper || !piece || !hole || !btn || !track || !text || !input) return;

  const pieceWidth = 48;
  let wrapperWidth = wrapper.clientWidth || 380;
  let maxSlide = wrapperWidth - pieceWidth - 4;

  function initCaptcha() {
    wrapperWidth = wrapper.clientWidth || 380;
    let wrapperHeight = wrapper.clientHeight || 128;
    maxSlide = wrapperWidth - pieceWidth - 4;

    const holeX = Math.floor(Math.random() * (wrapperWidth - pieceWidth - 80)) + 80;
    const holeY = Math.floor(Math.random() * (wrapperHeight - pieceWidth - 10)) + 5;

    hole.style.left = holeX + 'px';
    hole.style.top = holeY + 'px';
    piece.style.top = holeY + 'px';
    piece.style.left = '10px';

    piece.style.backgroundSize = `${wrapperWidth}px ${wrapperHeight}px`;
    piece.style.backgroundPosition = `-${holeX}px -${holeY}px`;
    piece.setAttribute('data-target-x', holeX);
  }

  initCaptcha();

  let isDragging = false;
  let startX = 0;

  function onPointerDown(e) {
    isDragging = true;
    startX = e.clientX || (e.touches && e.touches[0].clientX);
    btn.style.transition = 'none';
    piece.style.transition = 'none';
  }

  function onPointerMove(e) {
    if (!isDragging) return;
    const currentX = e.clientX || (e.touches && e.touches[0].clientX);
    let deltaX = currentX - startX;
    if (deltaX < 0) deltaX = 0;
    if (deltaX > maxSlide) deltaX = maxSlide;

    btn.style.left = deltaX + 'px';
    piece.style.left = (deltaX + 10) + 'px';
  }

  function onPointerUp() {
    if (!isDragging) return;
    isDragging = false;

    const currentPieceX = parseInt(piece.style.left) || 10;
    const targetX = parseInt(piece.getAttribute('data-target-x')) || 0;

    if (Math.abs(currentPieceX - targetX) <= 6) {
      input.value = "true";
      text.innerText = "✓ Xác thực thành công!";
      text.className = "absolute inset-0 w-full h-full flex items-center justify-center text-sm font-bold text-emerald-600 pointer-events-none select-none z-0";
      btn.classList.add("bg-emerald-500", "text-white");
    } else {
      input.value = "false";
      btn.style.transition = 'left 0.3s ease';
      piece.style.transition = 'left 0.3s ease';
      btn.style.left = '0px';
      piece.style.left = '10px';
    }
  }

  btn.addEventListener('mousedown', onPointerDown);
  window.addEventListener('mousemove', onPointerMove);
  window.addEventListener('mouseup', onPointerUp);

  btn.addEventListener('touchstart', onPointerDown);
  window.addEventListener('touchmove', onPointerMove);
  window.addEventListener('touchend', onPointerUp);
}

// --- TSPARTICLES BACKGROUND ---
function initLoginParticles() {
  if (window.tsParticles) {
    tsParticles.load("vanta-bg", {
      background: { color: "#ffffff" },
      particles: {
        color: { value: "#29348f" },
        links: { enable: true, color: "#29348f", distance: 150, opacity: 0.4, width: 1 },
        move: { enable: true, speed: 2, direction: "none", random: false, straight: false, outModes: "out" },
        number: { density: { enable: true, area: 800 }, value: 80 },
        opacity: { value: 0.5 },
        shape: { type: "circle" },
        size: { value: { min: 1, max: 3 } }
      },
      interactivity: {
        events: { onHover: { enable: true, mode: "grab" }, onClick: { enable: true, mode: "push" } },
        modes: { grab: { distance: 140, links: { opacity: 1 } }, push: { quantity: 4 } }
      }
    });
  }
}

// --- LOGIN SUBMIT HANDLER ---
async function handleLogin(event, form) {
  event.preventDefault();
  const cfToken = form.querySelector('[name=cf-turnstile-response]');
  if (!cfToken || !cfToken.value) {
    alert('Vui lòng hoàn thành xác thực Cloudflare!');
    return false;
  }

  const btn = form.querySelector('button[type=submit]');
  const originalText = btn.innerHTML;
  btn.innerHTML = 'Đang xử lý...';
  btn.disabled = true;

  try {
    const response = await fetch(form.action, {
      method: form.method,
      body: new URLSearchParams(new FormData(form)),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    if (response.redirected && response.url.includes('/board')) {
      const container = document.getElementById('auth-container');
      container.classList.remove('overflow-hidden');
      container.classList.add('pointer-events-none');

      const logo = document.querySelector('img[alt="EVNGENCO2 Logo"]');
      logo.style.transition = 'transform 1.5s cubic-bezier(0.4, 0, 0.2, 1)';
      logo.style.transform = 'scale(2.5) translateY(20px)';
      logo.style.position = 'relative';
      logo.style.zIndex = '9999';

      const loginViewElements = document.querySelectorAll('#login-view > *:not(a:first-child), #login-view > a > *:not(img)');
      loginViewElements.forEach(el => {
        el.style.transition = 'opacity 0.8s ease';
        el.style.opacity = '0';
      });

      container.style.transition = 'background 1s ease, box-shadow 1s ease';
      container.style.backgroundColor = 'transparent';
      container.style.boxShadow = 'none';
      container.style.zIndex = '9999';

      const overlay = document.createElement('div');
      overlay.style.position = 'fixed';
      overlay.style.inset = '0';
      overlay.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
      overlay.style.backdropFilter = 'blur(10px)';
      overlay.style.opacity = '0';
      overlay.style.transition = 'opacity 1.5s ease';
      overlay.style.zIndex = '9998';
      document.body.appendChild(overlay);

      void overlay.offsetWidth;
      overlay.style.opacity = '1';

      setTimeout(() => {
        window.location.href = response.url;
      }, 1500);
    } else {
      const html = await response.text();
      document.open();
      document.write(html);
      document.close();
    }
  } catch (err) {
    alert('Có lỗi xảy ra: ' + err.message);
    btn.innerHTML = originalText;
    btn.disabled = false;
  }
  return false;
}
