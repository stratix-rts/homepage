const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');

let particles = [];
let animationId;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class Particle {
    constructor() {
        this.reset();
    }
    
    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
        this.opacity = Math.random() * 0.5 + 0.2;
        this.hue = Math.random() > 0.5 ? 190 : 270;
    }
    
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        
        if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
            this.reset();
        }
    }
    
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${this.hue}, 100%, 60%, ${this.opacity})`;
        ctx.fill();
    }
}

function initParticles() {
    particles = [];
    const particleCount = Math.min(100, Math.floor((canvas.width * canvas.height) / 15000));
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
}

function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 120) {
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.strokeStyle = `rgba(0, 217, 255, ${0.1 * (1 - distance / 120)})`;
                ctx.lineWidth = 0.5;
                ctx.stroke();
            }
        }
    }
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawConnections();
    
    particles.forEach(particle => {
        particle.update();
        particle.draw();
    });
    
    animationId = requestAnimationFrame(animateParticles);
}

initParticles();
animateParticles();

const cursorGlow = document.querySelector('.cursor-glow');

document.addEventListener('mousemove', (e) => {
    cursorGlow.style.left = e.clientX + 'px';
    cursorGlow.style.top = e.clientY + 'px';
});

const statValues = document.querySelectorAll('.stat-value[data-target]');

function animateValue(element, target, duration = 2000) {
    if (target === '∞') {
        element.textContent = '∞';
        return;
    }
    
    const targetNum = parseInt(target);
    const startTime = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const current = Math.floor(easeOutQuart * targetNum);
        
        element.textContent = current;
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    requestAnimationFrame(update);
}

const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const target = entry.target.getAttribute('data-target');
            animateValue(entry.target, target);
            statsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

statValues.forEach(stat => statsObserver.observe(stat));

const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const tabId = btn.getAttribute('data-tab');
        
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        tabContents.forEach(content => {
            content.classList.remove('active');
            if (content.getAttribute('data-content') === tabId) {
                content.classList.add('active');
            }
        });
    });
});

const featureCards = document.querySelectorAll('.feature-card');

const featureObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = `fadeInUp 0.6s ease-out forwards`;
            featureObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.1 });

featureCards.forEach(card => {
    card.style.opacity = '0';
    featureObserver.observe(card);
});

const navbar = document.querySelector('.navbar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        navbar.style.background = 'rgba(10, 10, 15, 0.95)';
    } else {
        navbar.style.background = 'rgba(10, 10, 15, 0.8)';
    }
    
    lastScroll = currentScroll;
});

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

const agents = document.querySelectorAll('.agent');

agents.forEach(agent => {
    agent.addEventListener('mouseenter', () => {
        const name = agent.getAttribute('data-agent');
        agent.querySelector('.agent-name').textContent = name;
    });
    
    agent.addEventListener('mouseleave', () => {
        const originalName = agent.querySelector('.agent-avatar').textContent;
        const names = {
            '⚡': 'DEV-Alpha',
            '✦': 'COPY-Beta',
            '◈': 'DATA-Gamma'
        };
        agent.querySelector('.agent-name').textContent = names[originalName] || 'Agent';
    });
});

const buttons = document.querySelectorAll('.btn-primary, .btn-secondary');

buttons.forEach(btn => {
    btn.addEventListener('mouseenter', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        btn.style.setProperty('--x', x + 'px');
        btn.style.setProperty('--y', y + 'px');
    });
});

const archLayers = document.querySelectorAll('.arch-layer');

const archObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            setTimeout(() => {
                entry.target.style.animation = 'fadeInUp 0.6s ease-out forwards';
            }, index * 200);
            archObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.2 });

archLayers.forEach(layer => {
    layer.style.opacity = '0';
    archObserver.observe(layer);
});

console.log('%c⬡ STRATIX 星策', 'font-size: 24px; font-weight: bold; color: #00d9ff;');
console.log('%c一人成军，万智听命', 'font-size: 14px; color: #94a3b8;');
console.log('%chttps://github.com/stratix', 'font-size: 12px; color: #64748b;');
