document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('noise-canvas');
    const ctx = canvas.getContext('2d');
    const video = document.getElementById('camera-feed');
    const colorBars = document.getElementById('color-bars');
    const btnSwitch = document.getElementById('btn-switch');
    const channelDisplay = document.getElementById('channel-display');

    let animationId;
    let currentChannel = 1; // 1: Noise, 2: Color Bars, 3: Camera

    // Resize canvas to match display size
    const resizeCanvas = () => {
        // Only resize if visible and has dimensions
        if (canvas.clientWidth > 0 && canvas.clientHeight > 0) {
            canvas.width = canvas.clientWidth;
            canvas.height = canvas.clientHeight;
        }
    };

    window.addEventListener('resize', resizeCanvas);

    // Noise generation loop
    const drawNoise = () => {
        if (canvas.classList.contains('hidden')) return;

        const w = canvas.width;
        const h = canvas.height;

        // Safety check
        if (w === 0 || h === 0) {
            animationId = requestAnimationFrame(drawNoise);
            return;
        }

        const idata = ctx.createImageData(w, h);
        const buffer32 = new Uint32Array(idata.data.buffer);
        const len = buffer32.length;

        for (let i = 0; i < len; i++) {
            // 50% chance of black or white
            if (Math.random() < 0.5) {
                buffer32[i] = 0xff000000; // Black opaque
            } else {
                buffer32[i] = 0xffffffff; // White opaque
            }
        }

        ctx.putImageData(idata, 0, 0);
        animationId = requestAnimationFrame(drawNoise);
    };

    const startNoise = () => {
        if (!animationId) {
            resizeCanvas();
            drawNoise();
        }
    };

    const stopNoise = () => {
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
    };

    // Camera handling
    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 640 },
                    height: { ideal: 480 }
                },
                audio: false
            });
            video.srcObject = stream;
        } catch (err) {
            console.error("Error accessing webcam:", err);
            // Try to inform the user
            alert("Unable to access camera. Please ensure you have granted permission and are using HTTPS or localhost.");
            // Fallback to channel 1
            switchChannel(1);
        }
    };

    const stopCamera = () => {
        const stream = video.srcObject;
        if (stream) {
            const tracks = stream.getTracks();
            tracks.forEach(track => track.stop());
            video.srcObject = null;
        }
    };

    const updateDisplay = () => {
        // Stop previous activities
        stopNoise();
        if (currentChannel !== 3) stopCamera();

        // Hide all channels first
        canvas.classList.add('hidden');
        colorBars.classList.add('hidden');
        video.classList.add('hidden');

        // Update Channel Display
        channelDisplay.textContent = currentChannel;

        // Activate current channel
        switch (currentChannel) {
            case 1: // Noise
                canvas.classList.remove('hidden');
                // Allow a brief moment for layout to update (hidden removal) before sizing
                requestAnimationFrame(() => startNoise());
                break;
            case 2: // Color Bars
                colorBars.classList.remove('hidden');
                break;
            case 3: // Camera
                video.classList.remove('hidden');
                startCamera();
                break;
        }
    };

    const switchChannel = (forceChannel) => {
        if (forceChannel) {
            currentChannel = forceChannel;
        } else {
            currentChannel++;
            if (currentChannel > 3) currentChannel = 1;
        }
        updateDisplay();
    };

    btnSwitch.addEventListener('click', () => switchChannel());

    // Initialize
    updateDisplay();
});
