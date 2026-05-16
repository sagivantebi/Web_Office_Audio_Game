let metadata = [];
let html5QrCode;
const audioPlayer = document.getElementById('main-audio');
const statusBadge = document.getElementById('status-badge');
const replayBtn = document.getElementById('replay-btn');
const nextBtn = document.getElementById('next-btn');
const scanSection = document.getElementById('scan-section');
const playSection = document.getElementById('play-section');

// Load metadata
fetch('metadata.json')
    .then(response => response.json())
    .then(data => {
        metadata = data;
        startScanner();
    })
    .catch(err => {
        statusBadge.innerText = 'Error Loading Data';
    });

function startScanner() {
    html5QrCode = new Html5Qrcode("reader");
    const config = { 
        fps: 20, 
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0 
    };

    html5QrCode.start({ facingMode: "environment" }, config, onScanSuccess)
        .catch(err => {
            statusBadge.innerText = 'Camera Error';
        });
}

function onScanSuccess(decodedText) {
    const match = metadata.find(item => decodedText.includes(item.qr_pattern));

    if (match) {
        // UI Switch Logic
        const switchToPlayback = () => {
            scanSection.style.display = 'none';
            playSection.style.display = 'block';
            
            // CRITICAL: Force clear the reader div to kill library text
            document.getElementById('reader').innerHTML = "";
            
            playAudio(match);
        };

        // Attempt to stop camera, but switch UI immediately regardless
        html5QrCode.stop().then(switchToPlayback).catch(err => {
            console.error(err);
            switchToPlayback();
        });
        
        // Safety timeout: if stop() hangs, switch anyway after 300ms
        setTimeout(switchToPlayback, 300);
    }
}

function playAudio(item) {
    statusBadge.innerText = 'Listen Closely...';
    statusBadge.className = 'status-badge status-success';
    audioPlayer.src = `audio/${item.filename}`;
    audioPlayer.play();
}

replayBtn.addEventListener('click', () => {
    audioPlayer.currentTime = 0;
    audioPlayer.play();
});

nextBtn.addEventListener('click', () => {
    audioPlayer.pause();
    
    // Switch UI back
    playSection.style.display = 'none';
    scanSection.style.display = 'block';

    statusBadge.innerText = 'Ready to Scan';
    statusBadge.className = 'status-badge status-ready';

    startScanner();
});
