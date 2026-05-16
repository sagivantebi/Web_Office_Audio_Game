let metadata = [];
let html5QrCode;
const audioPlayer = document.getElementById('main-audio');
const statusBadge = document.getElementById('status-badge');
const audioInfo = document.getElementById('audio-player');
const replayBtn = document.getElementById('replay-btn');
const nextBtn = document.getElementById('next-btn');

// Load metadata
fetch('metadata.json')
    .then(response => response.json())
    .then(data => {
        metadata = data;
        console.log('Metadata loaded:', metadata.length, 'items');
        startScanner();
    })
    .catch(err => {
        console.error('Error loading metadata:', err);
        statusBadge.innerText = 'Error Loading Game Data';
    });

function startScanner() {
    html5QrCode = new Html5Qrcode("reader");
    const config = { fps: 10, qrbox: { width: 250, height: 250 } };

    html5QrCode.start(
        { facingMode: "environment" }, 
        config, 
        onScanSuccess
    ).catch(err => {
        console.error('Scanner start error:', err);
        statusBadge.innerText = 'Camera Access Required';
    });
}

function onScanSuccess(decodedText) {
    console.log(`Scan result: ${decodedText}`);
    
    const match = metadata.find(item => decodedText.includes(item.qr_pattern));

    if (match) {
        // Pause and HIDE scanner
        html5QrCode.pause();
        document.getElementById('scanner-container').style.display = 'none';
        
        playAudio(match);
    }
}

function playAudio(item) {
    statusBadge.innerText = 'Listen Closely...';
    statusBadge.className = 'status-badge status-success';

    // Set audio source
    audioPlayer.src = `audio/${item.filename}`;
    audioPlayer.play();

    // Show controls
    replayBtn.style.display = 'block';
    nextBtn.style.display = 'block';
}

replayBtn.addEventListener('click', () => {
    audioPlayer.currentTime = 0;
    audioPlayer.play();
});

nextBtn.addEventListener('click', () => {
    // Stop audio
    audioPlayer.pause();
    
    // Hide controls
    replayBtn.style.display = 'none';
    nextBtn.style.display = 'none';

    statusBadge.innerText = 'Ready to Scan';
    statusBadge.className = 'status-badge status-ready';

    // Show and Resume scanner
    document.getElementById('scanner-container').style.display = 'block';
    html5QrCode.resume();
});
