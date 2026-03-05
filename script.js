const Sistema = {
    senhaAdmin: "Black2026",
    dbKey: "blackfilms_pro_db",

    init: function() {
        this.cacheDom();
        this.bindEvents();
        this.mascaraTelefone();
        this.initSwiper(); 
        this.initNavbarEffect();
        this.initScrollAnimations(); // INICIA AS NOVAS ANIMAÇÕES DE SCROLL
    },

    cacheDom: function() {
        this.dom = {
            navbar: document.getElementById('mainNav'),
            modalLogin: document.getElementById('login-modal'),
            painelAdmin: document.getElementById('admin-view'),
            form: document.getElementById('agendamento-form'),
            passInput: document.getElementById('admin-pass'),
            errorMsg: document.getElementById('login-error'),
            toast: document.getElementById('toast'),
            tbody: document.getElementById('lista-tbody'),
            phoneInput: document.getElementById('telefone'),
            // Seleciona todos os elementos que devem animar ao rolar
            scrollTriggers: document.querySelectorAll('.scroll-trigger')
        };
    },

    bindEvents: function() {
        if(this.dom.form) this.dom.form.addEventListener('submit', (e) => this.salvar(e));
        window.onclick = (e) => { if(e.target == this.dom.modalLogin) this.fecharModais(); };
    },

    // --- NOVO: Observador de Interseção para Animações de Scroll ---
    initScrollAnimations: function() {
        // Configurações do observador (dispara quando 20% do elemento está visível)
        const options = {
            threshold: 0.2
        };

        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                // Se o elemento entrou na tela
                if (entry.isIntersecting) {
                    // Adiciona a classe que dispara a animação CSS
                    entry.target.classList.add('is-visible');
                    // Para de observar este elemento (anima só uma vez)
                    observer.unobserve(entry.target);
                }
            });
        }, options);

        // Começa a observar cada elemento com a classe .scroll-trigger
        this.dom.scrollTriggers.forEach(trigger => {
            observer.observe(trigger);
        });
    },

    initNavbarEffect: function() {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                this.dom.navbar.classList.add('scrolled');
            } else {
                this.dom.navbar.classList.remove('scrolled');
            }
        });
    },

    initSwiper: function() {
        new Swiper(".mySwiper", {
            effect: "coverflow",
            grabCursor: true,
            centeredSlides: true,
            slidesPerView: "auto",
            speed: 800, // Transição do slider mais suave
            coverflowEffect: {
                rotate: 0,
                stretch: 0,
                depth: 120,
                modifier: 1.2,
                slideShadows: false,
            },
            loop: true,
            autoplay: {
                delay: 3500,
                disableOnInteraction: false,
            },
            pagination: { el: ".swiper-pagination", clickable: true },
        });
    },

    mascaraTelefone: function() {
        if(!this.dom.phoneInput) return;
        this.dom.phoneInput.addEventListener('input', function (e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 11) value = value.slice(0, 11);
            if (value.length > 2) value = `(${value.substring(0,2)}) ${value.substring(2)}`;
            if (value.length > 9) value = `${value.substring(0,9)}-${value.substring(9)}`;
            e.target.value = value;
        });
    },

    abrirTab: function(evt, tabId) {
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.getElementById(tabId).classList.add('active');
        evt.currentTarget.classList.add('active');
    },

    salvar: function(e) {
        e.preventDefault();
        const dados = {
            id: Date.now(),
            nome: document.getElementById('nome').value,
            telefone: document.getElementById('telefone').value,
            carro: document.getElementById('carro').value,
            servico: document.getElementById('servico').value,
            data: document.getElementById('data').value
        };
        const db = JSON.parse(localStorage.getItem(this.dbKey)) || [];
        db.push(dados);
        localStorage.setItem(this.dbKey, JSON.stringify(db));
        this.mostrarToast();
        this.dom.form.reset();
    },

    mostrarToast: function() {
        this.dom.toast.classList.remove('hidden');
        // Animação de entrada do toast
        this.dom.toast.style.animation = 'fadeInUpSmooth 0.5s forwards';
        setTimeout(() => {
             // Animação de saída
            this.dom.toast.style.animation = 'fadeInUpSmooth 0.5s reverse forwards';
            setTimeout(() => this.dom.toast.classList.add('hidden'), 500);
        }, 3500);
    },

    abrirModalLogin: function() { this.dom.modalLogin.classList.remove('hidden'); this.dom.passInput.value = ''; this.dom.passInput.focus(); this.dom.errorMsg.classList.add('hidden'); },
    fecharModais: function() { this.dom.modalLogin.classList.add('hidden'); },
    
    validarLogin: function() {
        if(this.dom.passInput.value === this.senhaAdmin) {
            this.fecharModais();
            this.carregarAdmin();
        } else {
            this.dom.errorMsg.classList.remove('hidden');
            this.dom.passInput.style.borderColor = "red";
        }
    },

    carregarAdmin: function() {
        this.dom.painelAdmin.classList.remove('hidden');
        const db = JSON.parse(localStorage.getItem(this.dbKey)) || [];
        const tbody = this.dom.tbody;
        tbody.innerHTML = '';
        if(db.length === 0) {
            document.getElementById('empty-state').classList.remove('hidden');
        } else {
            document.getElementById('empty-state').classList.add('hidden');
            db.sort((a, b) => new Date(a.data) - new Date(b.data));
            db.forEach(item => {
                const tr = document.createElement('tr');
                tr.innerHTML = `<td><strong style="color:#fff">${item.nome}</strong></td><td>${item.telefone}</td><td>${item.carro}</td><td><span style="background:#222; padding:5px 12px; border-radius:20px; font-size:0.85rem">${item.servico}</span></td><td>${new Date(item.data).toLocaleDateString('pt-BR')}</td><td><button onclick="Sistema.deletar(${item.id})" style="color:#ff5555; background:none; border:none; cursor:pointer; font-size:1.2rem; transition:0.3s; hover:scale(1.2)"><i class="fa-solid fa-trash"></i></button></td>`;
                tbody.appendChild(tr);
            });
        }
    },

    deletar: function(id) {
        if(confirm("Tem certeza que deseja excluir este agendamento?")) {
            let db = JSON.parse(localStorage.getItem(this.dbKey)) || [];
            db = db.filter(i => i.id !== id);
            localStorage.setItem(this.dbKey, JSON.stringify(db));
            this.carregarAdmin();
        }
    },

    logout: function() { this.dom.painelAdmin.classList.add('hidden'); }
};

document.addEventListener('DOMContentLoaded', () => Sistema.init());