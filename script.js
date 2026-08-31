// ==========================================
// AI SIGN LANGUAGE CLASSIFIER
// Teachable Machine + TensorFlow.js
// Classes: A - J
// ==========================================


// Your Teachable Machine model URL
const URL = "https://teachablemachine.withgoogle.com/models/HhgJnVhcQ/";


// Global variables
let model;
let webcam;
let maxPredictions;

let cameraStarted = false;
let predicting = false;

let previousPrediction = "";


// ==========================================
// START CAMERA
// ==========================================

async function startCamera() {

    try {

        // Check whether Teachable Machine library loaded
        if (typeof tmImage === "undefined") {

            throw new Error(
                "Teachable Machine library did not load."
            );

        }

        console.log("Loading model...");


        // Model files
        const modelURL = URL + "model.json";
        const metadataURL = URL + "metadata.json";


        // Load model
        model = await tmImage.load(
            modelURL,
            metadataURL
        );


        console.log("Model loaded successfully.");


        maxPredictions =
            model.getTotalClasses();


        console.log(
            "Classes:",
            maxPredictions
        );


        // ==================================
        // CREATE WEBCAM
        // ==================================

        webcam = new tmImage.Webcam(
            400,
            400,
            true
        );


        // Setup camera
        await webcam.setup();


        console.log("Camera setup completed.");


        // ==================================
        // START CAMERA
        // ==================================

        await webcam.play();


        cameraStarted = true;


        // ==================================
        // DISPLAY WEBCAM
        // ==================================

        const webcamContainer =
            document.getElementById(
                "webcam-container"
            );


        webcamContainer.innerHTML = "";


        webcamContainer.appendChild(
            webcam.canvas
        );


        // ==================================
        // BUTTONS
        // ==================================

        document.getElementById(
            "startCameraBtn"
        ).disabled = true;


        document.getElementById(
            "startPredictionBtn"
        ).disabled = false;


        document.getElementById(
            "stopCameraBtn"
        ).disabled = false;


        document.getElementById(
            "prediction"
        ).innerHTML =
            "<p>Camera ready. Click Start Prediction.</p>";


        // Start webcam update
        webcamLoop();


    }

    catch (error) {

        console.error(
            "Camera error:",
            error
        );


        alert(
            "ERROR: " +
            error.message
        );

    }
}


// ==========================================
// WEBCAM LOOP
// ==========================================

function webcamLoop() {

    if (!cameraStarted) {
        return;
    }


    webcam.update();


    window.requestAnimationFrame(
        webcamLoop
    );
}


// ==========================================
// START PREDICTION
// ==========================================

function startPrediction() {

    if (!cameraStarted) {

        alert(
            "Please start the camera first."
        );

        return;
    }


    if (!model) {

        alert(
            "AI model is not loaded."
        );

        return;
    }


    predicting = true;


    document.getElementById(
        "startPredictionBtn"
    ).disabled = true;


    document.getElementById(
        "prediction"
    ).innerHTML =
        "<p>Predicting...</p>";


    predict();
}


// ==========================================
// PREDICTION
// ==========================================

async function predict() {

    if (!predicting) {
        return;
    }


    try {

        const predictions =
            await model.predict(
                webcam.canvas
            );


        // Find highest prediction
        let highestPrediction =
            predictions[0];


        for (
            let i = 1;
            i < predictions.length;
            i++
        ) {

            if (
                predictions[i].probability >
                highestPrediction.probability
            ) {

                highestPrediction =
                    predictions[i];
            }

        }


        // Class name
        const className =
            highestPrediction.className;


        // Confidence
        const confidence =
            highestPrediction.probability * 100;


        // Display prediction
        document.getElementById(
            "prediction"
        ).innerHTML =

            `Sign: <strong>${className}</strong>`;


        // Display percentage
        document.getElementById(
            "confidence-text"
        ).innerText =

            confidence.toFixed(1) + "%";


        // Progress bar
        document.getElementById(
            "confidence-bar"
        ).style.width =

            confidence + "%";


        // Add only changed predictions
        if (
            className !== previousPrediction
        ) {

            addToHistory(
                className,
                confidence
            );


            previousPrediction =
                className;

        }


        // Continue prediction
        setTimeout(
            predict,
            300
        );

    }

    catch (error) {

        console.error(
            "Prediction error:",
            error
        );

    }
}


// ==========================================
// PREDICTION HISTORY
// ==========================================

function addToHistory(
    className,
    confidence
) {

    const history =
        document.getElementById(
            "history"
        );


    // Remove default message
    if (
        history.children.length === 1 &&
        history.children[0].innerText ===
        "No predictions yet."
    ) {

        history.innerHTML = "";

    }


    // Create history item
    const item =
        document.createElement("li");


    item.innerHTML =

        `<strong>${className}</strong>
         - ${confidence.toFixed(1)}% confidence`;


    // Add to beginning
    history.insertBefore(
        item,
        history.firstChild
    );


    // Keep only 10
    while (
        history.children.length > 10
    ) {

        history.removeChild(
            history.lastChild
        );

    }
}


// ==========================================
// STOP CAMERA
// ==========================================

function stopCamera() {

    predicting = false;

    cameraStarted = false;

    previousPrediction = "";


    if (webcam) {

        webcam.stop();

    }


    document.getElementById(
        "webcam-container"
    ).innerHTML =

        `<p class="camera-message">
            Camera stopped.
        </p>`;


    document.getElementById(
        "prediction"
    ).innerHTML =

        "<p>Camera stopped. Start again to continue.</p>";


    document.getElementById(
        "confidence-text"
    ).innerText = "0%";


    document.getElementById(
        "confidence-bar"
    ).style.width = "0%";


    document.getElementById(
        "startCameraBtn"
    ).disabled = false;


    document.getElementById(
        "startPredictionBtn"
    ).disabled = true;


    document.getElementById(
        "stopCameraBtn"
    ).disabled = true;
}