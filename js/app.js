let metadata = [];
let html5QrCode;
const audioPlayer = document.getElementById('main-audio');
const statusBadge = document.getElementById('status-badge');
const audioInfo = document.getElementById('audio-player');
const epTitle = document.getElementById('episode-title');
const seaInfo = document.getElementById('season-info');
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
    
    // The decodedText might be a full URL like:
    // http://192.168.1.5:8000/Season.1/chunks/Episode/chunk_00001.mp3
    
    // We try to find a match in our metadata.qr_pattern
    const match = metadata.find(item => decodedText.includes(item.qr_pattern));

    if (match) {
        // Pause scanner
        html5QrCode.pause();
        
        playAudio(match);
    }
}

function playAudio(item) {
    statusBadge.innerText = 'Playing Audio...';
    statusBadge.className = 'status-badge status-success';

    // Show info
    audioInfo.style.display = 'block';
    epTitle.innerText = item.episode.replace(/\./g, ' ');
    seaInfo.innerText = item.season.replace(/\./g, ' ');

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
    // Hide info and controls
    audioInfo.style.display = 'none';
    replayBtn.style.display = 'none';
    nextBtn.style.display = 'none';

    statusBadge.innerText = 'Ready to Scan';
    statusBadge.className = 'status-badge status-ready';

    // Resume scanner
    html5QrCode.resume();
});
