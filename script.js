const game = {
    health: 100,
    selectedAction: null,
    isGameOver: false,
    volume: 0.5,
    muted: false,
    isCrying: false // Ağlama durumu
};

// DOM elementleri
const el = {
    character: document.getElementById('character'),
    characterCry: document.getElementById('character-cry'), // YENİ
    health: document.getElementById('health'),
    hearts: document.querySelector('.hearts'),
    damagePopup: document.getElementById('damage-popup'),
    gameOver: document.getElementById('game-over'),
    muteBtn: document.getElementById('mute-btn'),
    volume: document.getElementById('volume'),
    sendBtn: document.getElementById('send-message'),
    playAgainBtn: document.getElementById('play-again'),
    messageInput: document.querySelector('textarea'),
    finalMessage: document.getElementById('final-message')
};

// Sesler
const sounds = {
    punch: new Audio('punch.mp3'),
    slap: new Audio('slap.mp3'),
    bag: new Audio('bag.mp3'),
    kiss: new Audio('kiss.mp3')
};

// Başlatma
function init() {
    createHearts();
    setupEventListeners();
    setupAudio();
}

// Kalpleri oluştur
function createHearts() {
    el.hearts.innerHTML = '';
    const heartCount = 5;
    
    for (let i = 0; i < heartCount; i++) {
        const heart = document.createElement('img');
        heart.src = 'heart.png';
        heart.className = 'heart';
        heart.alt = '❤️';
        el.hearts.appendChild(heart);
    }
    
    updateHearts();
}

// Event listener'ları kur
function setupEventListeners() {
    // Action butonları
    document.querySelectorAll('.action-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            // Önceki seçimi temizle
            document.querySelectorAll('.action-btn').forEach(b => b.classList.remove('active'));
            
            // Yeni butonu seç
            game.selectedAction = btn.dataset.action;
            btn.classList.add('active');
        });
    });
    
    // Karaktere tıklama
    el.character.addEventListener('click', handleCharacterClick);
    
    // Ses kontrolleri
    el.muteBtn.addEventListener('click', toggleMute);
    el.volume.addEventListener('input', changeVolume);
    
    // Oyun bitti butonları
    el.sendBtn.addEventListener('click', showMessage);
    el.playAgainBtn.addEventListener('click', restartGame);
}

// Ses ayarları
function setupAudio() {
    Object.values(sounds).forEach(sound => {
        sound.volume = game.volume;
    });
}

// Karaktere tıklama
function handleCharacterClick(e) {
    if (game.isGameOver || !game.selectedAction) return;
    
    const btn = document.querySelector('.action-btn.active');
    if (!btn) return;
    
    const damage = parseInt(btn.dataset.damage);
    applyDamage(damage);
    
    // Animasyon
    el.character.classList.add('shake');
    setTimeout(() => el.character.classList.remove('shake'), 500);
}

// Hasar uygula
function applyDamage(damage) {
    // Hasar popup'ını göster
    showDamagePopup(damage);

    // Canı güncelle
    if (damage > 0) {
        game.health -= damage;
        playSound(game.selectedAction);
        
        // AĞLAMA EFEKTİNİ GÖSTER - YENİ
        if (!game.isCrying) {
            showCryEffect();
        }
        
    } else {
        game.health = Math.min(game.health - damage, 100); // damage negatif
        playSound('kiss');
        
        // ÖPÜCÜKTE AĞLAMA DURSUN - YENİ
        if (game.isCrying) {
            hideCryEffect();
        }
    }
    
    // UI'ı güncelle
    el.health.textContent = game.health;
    updateHearts();
    
    // Oyun bitti mi kontrol et
    if (game.health <= 0) {
        game.health = 0;
        
        // OYUN BİTTİĞİNDE KALICI AĞLAMA - YENİ
        if (game.isCrying) {
            showCryEffect(true); // Kalıcı ağlama
        }
        
        setTimeout(() => gameOver(), 500);
    }
}

// Hasar popup'ını göster - Daha iyi pozisyon
function showDamagePopup(damage) {
    const isHeal = damage < 0;
    const symbol = isHeal ? '+' : '-';
    const value = Math.abs(damage);
    const color = isHeal ? '#00ff00' : '#ff0000';
    
    el.damagePopup.textContent = `${symbol}${value}`;
    el.damagePopup.style.color = color;
    el.damagePopup.style.left = '50%';
    el.damagePopup.style.top = '40%';
    el.damagePopup.style.transform = 'translate(-50%, -50%) scale(1)';
    el.damagePopup.style.opacity = '1';
    el.damagePopup.style.fontSize = '50px';
    el.damagePopup.style.zIndex = '1000';
    
    // Popup'ı otomatik kaldır - DÜZELTME
    setTimeout(() => {
        el.damagePopup.style.opacity = '0';
        el.damagePopup.style.transform = 'translate(-50%, -100%) scale(0.5)';
    }, 800);
}

// YENİ: Ağlama efektini göster
function showCryEffect(permanent = false) {
    if (!el.characterCry) return; // Eğer cry.png yoksa çalışmasın
    
    game.isCrying = true;
    
    // Normal karakteri gizle
    el.character.style.opacity = '0';
    
    // Ağlama karakterini göster
    el.characterCry.style.opacity = '1';
    el.characterCry.style.pointerEvents = 'auto'; // Tıklanabilir yap
    
    // Kalıcı değilse 2 saniye sonra normale dön
    if (!permanent) {
        setTimeout(() => {
            hideCryEffect();
        }, 500);
    }
}

// YENİ: Ağlama efektini gizle
function hideCryEffect() {
    if (!el.characterCry) return;
    
    game.isCrying = false;
    
    // Normal karakteri göster
    el.character.style.opacity = '1';
    
    // Ağlama karakterini gizle
    el.characterCry.style.opacity = '0';
    el.characterCry.style.pointerEvents = 'none';
}

// Ses çal
function playSound(soundName) {
    if (game.muted || !sounds[soundName]) return;
    
    const sound = sounds[soundName];
    sound.currentTime = 0;
    sound.play().catch(e => console.log('Ses çalınamadı'));
}

// Kalpleri güncelle
function updateHearts() {
    const hearts = document.querySelectorAll('.heart');
    const heartCount = hearts.length;
    const heartsToShow = Math.ceil((game.health / 100) * heartCount);
    
    hearts.forEach((heart, index) => {
        if (index < heartsToShow) {
            heart.style.opacity = '1';
            heart.style.filter = 'drop-shadow(0 0 5px red)';
        } else {
            heart.style.opacity = '0.3';
            heart.style.filter = 'none';
        }
    });
}

// Oyun bitti
function gameOver() {
    game.isGameOver = true;
    el.gameOver.style.display = 'block';
}

// Mesajı göster
function showMessage() {
    const message = el.messageInput.value.trim();
    
    if (message) {
        el.finalMessage.textContent = message;
        el.finalMessage.style.display = 'block';
        el.sendBtn.textContent = 'Kopyala';
        
        // Kopyala
        navigator.clipboard.writeText(message).then(() => {
            alert('Mesaj kopyalandı! 📋');
        });
    } else {
        alert('Lütfen bir mesaj yazın!');
    }
}

// Oyunu yeniden başlat
function restartGame() {
    game.health = 100;
    game.isGameOver = false;
    game.selectedAction = null;
    game.isCrying = false;
    
    // Modal'ı kapat
    el.gameOver.style.display = 'none';
    el.finalMessage.style.display = 'none';
    el.messageInput.value = '';
    el.sendBtn.textContent = 'Mesajı Gönder';
    
    // Butonları resetle
    document.querySelectorAll('.action-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Ağlama efektini kaldır - YENİ
    hideCryEffect();
    
    // Normal karakteri göster - YENİ
    el.character.style.opacity = '1';
    
    // UI'ı güncelle
    el.health.textContent = game.health;
    updateHearts();
}

// Ses kontrolleri
function toggleMute() {
    game.muted = !game.muted;
    el.muteBtn.textContent = game.muted ? '🔇' : '🔊';
    
    Object.values(sounds).forEach(sound => {
        sound.volume = game.muted ? 0 : game.volume;
    });
}

function changeVolume() {
    game.volume = el.volume.value / 100;
    
    if (!game.muted) {
        Object.values(sounds).forEach(sound => {
            sound.volume = game.volume;
        });
    }
}

// Oyunu başlat
window.addEventListener('DOMContentLoaded', init);