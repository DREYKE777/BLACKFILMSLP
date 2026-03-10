import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCiJzwnUD7mRUaSnRlMZOOnmWQX1_E4IZ4",
    authDomain: "blackfilms-8ad3d.firebaseapp.com",
    projectId: "blackfilms-8ad3d",
    storageBucket: "blackfilms-8ad3d.firebasestorage.app",
    messagingSenderId: "681522651273",
    appId: "1:681522651273:web:e4118a0dceaf401710e658",
    measurementId: "G-FH60HZ19NG"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = 'blackfilms-8ad3d';

const Sistema = {
    deferredPrompt: null,
    menuOpen: false,
    filmeCenas: [
        { tag: "Inovação", titulo: "A Arte da Precisão", texto: "Redefinindo o brilho através da alta engenharia estética." },
        { tag: "Tecnologia", titulo: "Nano Proteção 9H", texto: "Uma barreira molecular impenetrável contra a ação do tempo." },
        { tag: "Excellence", titulo: "O Ápice do Cuidado", texto: "Seu veículo tratado com o rigor de uma obra de arte." }
    ],
    cenaAtual: 0, 
    filmeAtivo: false,

    init: async function() {
        try { await signInAnonymously(auth); } catch(e) {}
        this.cacheDom(); 
        this.bindEvents(); 
        this.initSwiper(); 
        this.initNavbarEffect(); 
        this.initScrollAnimations();
        this.initPWA();
        
        // Trailer inicia automaticamente
        setTimeout(() => this.abrirTrailer(), 1500);
    },

    cacheDom: function() {
        this.dom = {
            navbar: document.getElementById('mainNav'),
            form: document.getElementById('agendamento-form'),
            toast: document.getElementById('toast'),
            phoneInput: document.getElementById('telefone'),
            scrollTriggers: document.querySelectorAll('.scroll-trigger'),
            trailerModal: document.getElementById('trailerModal')
        };
    },

    bindEvents: function() {
        if(this.dom.form) this.dom.form.addEventListener('submit', (e) => this.salvarFirebase(e));
        
        if(this.dom.phoneInput) {
            this.dom.phoneInput.addEventListener('input', (e) => {
                let v = e.target.value.replace(/\D/g, '');
                if (v.length > 11) v = v.slice(0, 11);
                if (v.length > 2) v = `(${v.substring(0,2)}) ${v.substring(2)}`;
                if (v.length > 9) v = `${v.substring(0,9)}-${v.substring(9)}`;
                e.target.value = v;
            });
        }
    },

    toggleMenu: function(forceClose = false) {
        const navLinks = document.getElementById('navLinks');
        if (forceClose || this.menuOpen) {
            navLinks.classList.remove('active');
            this.menuOpen = false;
        } else {
            navLinks.classList.add('active');
            this.menuOpen = true;
        }
    },

    // --- LÓGICA DO TRAILER CINEMÁTICO ---
    abrirTrailer: function() {
        if(!this.dom.trailerModal) return;
        this.dom.trailerModal.classList.add('active');
        this.filmeAtivo = true;
        this.renderizarCena();
    },

    fecharTrailer: function() {
        if(!this.dom.trailerModal) return;
        this.dom.trailerModal.classList.remove('active');
        this.filmeAtivo = false;
    },

    renderizarCena: function() {
        if(!this.filmeAtivo) return;
        const cena = this.filmeCenas[this.cenaAtual];
        const container = document.getElementById('sceneContainer');
        const flash = document.getElementById('flashOverlay');
        const pBar = document.getElementById('pBar');

        pBar.innerHTML = '';
        this.filmeCenas.forEach((_, i) => {
            const dot = document.createElement('div');
            dot.className = `p-dot ${i <= this.cenaAtual ? 'active' : ''}`;
            pBar.appendChild(dot);
        });

        flash.classList.remove('flashing');
        void flash.offsetWidth; 
        flash.classList.add('flashing');

        setTimeout(() => {
            container.innerHTML = `
                <span class="tagline" style="color:var(--gold); display:block; margin-bottom:20px; letter-spacing:5px;">${cena.tag}</span>
                <h2 style="color:#fff; text-transform:uppercase;">${cena.titulo}</h2>
                <p style="color:#777; font-weight:300; margin-top:30px; font-size:1.3rem;">${cena.texto}</p>
            `;
        }, 700);

        setTimeout(() => {
            if(this.cenaAtual < this.filmeCenas.length - 1) {
                this.cenaAtual++;
                this.renderizarCena();
            } else {
                setTimeout(() => this.fecharTrailer(), 3500);
            }
        }, 5000);
    },

    // --- EFEITOS DE LAYOUT ---
    initNavbarEffect: function() {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 80) this.dom.navbar.classList.add('scrolled');
            else this.dom.navbar.classList.remove('scrolled');
        });
    },

    initScrollAnimations: function() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) entry.target.classList.add('is-visible');
            });
        }, { threshold: 0.1 });
        this.dom.scrollTriggers.forEach(t => observer.observe(t));
    },

    initSwiper: function() {
        new Swiper(".mySwiper", {
            effect: "coverflow",
            grabCursor: true,
            centeredSlides: true,
            slidesPerView: "auto",
            coverflowEffect: { rotate: 0, stretch: 0, depth: 150, modifier: 1, slideShadows: false },
            loop: true,
            autoplay: { delay: 4000 },
            pagination: { el: ".swiper-pagination", clickable: true }
        });
    },

    // --- FIREBASE ---
    salvarFirebase: async function(e) {
        e.preventDefault();
        const btn = document.getElementById('btn-submit');
        const originalText = btn.innerHTML;
        btn.innerHTML = 'Processando...';
        btn.disabled = true;

        try {
            const dados = {
                nome: document.getElementById('nome').value,
                telefone: document.getElementById('telefone').value,
                carro: document.getElementById('carro').value,
                servico: document.getElementById('servico').value,
                data: document.getElementById('data').value,
                timestamp: Date.now()
            };

            const col = collection(db, 'artifacts', appId, 'public', 'data', 'solicitacoes');
            await addDoc(col, dados);
            
            this.dom.toast.classList.add('show');
            setTimeout(() => this.dom.toast.classList.remove('show'), 3500);
            this.dom.form.reset();
        } catch (err) {
            alert("Erro na conexão. Verifique seu sinal.");
        } finally {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    },

    // --- PWA INSTALAÇÃO REAL ---
    initPWA: function() {
        // 1. Criar o Manifest dinamicamente
        const manifest = {
            name: "BlackFilms Auto Spa",
            short_name: "BlackFilms",
            description: "Estética Automotiva Premium e Blindagem Química",
            start_url: "/",
            display: "standalone",
            background_color: "#050505",
            theme_color: "#d4af37",
            icons: [
                { src: "BlackFilms.jpg", sizes: "192x192", type: "image/jpeg" },
                { src: "BlackFilms.jpg", sizes: "512x512", type: "image/jpeg" }
            ]
        };
        const stringManifest = JSON.stringify(manifest);
        const blob = new Blob([stringManifest], {type: 'application/json'});
        const manifestURL = URL.createObjectURL(blob);
        const link = document.createElement('link');
        link.rel = 'manifest';
        link.href = manifestURL;
        document.head.appendChild(link);

        // 2. Registrar Service Worker (Vazio, mas necessário para install prompt)
        if ('serviceWorker' in navigator) {
            const swCode = `self.addEventListener('fetch', (event) => { /* Cache logic can go here */ });`;
            const swBlob = new Blob([swCode], {type: 'application/javascript'});
            const swURL = URL.createObjectURL(swBlob);
            navigator.serviceWorker.register(swURL);
        }

        // 3. Capturar o gatilho de instalação
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            // O botão de instalação no HTML já está visível
        });
    },

    instalarApp: async function() {
        if (this.deferredPrompt) {
            this.deferredPrompt.prompt();
            const { outcome } = await this.deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                console.log('User installed the app');
            }
            this.deferredPrompt = null;
        } else {
            // Caso o navegador não suporte o prompt automático (ex: iOS)
            alert("Para instalar:\n\nNo iPhone: Toque no ícone de compartilhar e selecione 'Adicionar à Tela de Início'.\n\nNo PC/Android: Verifique o ícone de instalação na barra de endereços.");
        }
    }
};

window.Sistema = Sistema;
document.addEventListener('DOMContentLoaded', () => Sistema.init());