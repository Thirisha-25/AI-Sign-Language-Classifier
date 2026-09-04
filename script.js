// ==========================================
// AI SIGN LANGUAGE CLASSIFIER
// Teachable Machine + TensorFlow.js
// Classes: A - Z
// ==========================================


// ==========================================
// 1. YOUR A-Z TEACHABLE MACHINE MODEL URL
// ==========================================

// IMPORTANT:
// Replace this with the URL of your UPDATED A-Z model.

const URL = "https://teachablemachine.withgoogle.com/models/HhgJnVhcQ/";


// ==========================================
// 2. GLOBAL VARIABLES
// ==========================================

let model;
let webcam;
let maxPredictions;

let cameraStarted = false;
let predicting = false;

let previousPrediction = "";


// ==========================================
// 3. START CAMERA
// ==========================================

async function startCamera() {

    try {

        // Check Teachable Machine library

        if (typeof tmImage === "undefined") {

            throw new Error(
                "Teachable Machine library did not load."
            );

        }


        console.log("Loading A-Z model...");


        // Model URLs

        const modelURL =
            URL + "model.json";

        const metadataURL =
            URL + "metadata.json";


        console.log(
            "Model URL:",
            modelURL
        );

        console.log(
            "Metadata URL:",
            metadataURL
        );


        // Load model

        model = await tmImage.load(
            modelURL,
            metadataURL
        );


        console.log(
            "Model loaded successfully."
        );


        // Get number of classes

        maxPredictions =
            model.getTotalClasses();


        console.log(
            "Number of classes:",
            maxPredictions
        );


        // ==================================
        // VERIFY MODEL
        // ==================================

        if (maxPredictions !== 26) {

            console.warn(
                "WARNING: This model has " +
                maxPredictions +
                " classes instead of 26."
            );

        }


        // ==================================
        // CREATE WEBCAM
        // ==================================

        webcam = new tmImage.Webcam(
            300,
            300,
            true
        );


        // Ask for camera permission

        await webcam.setup();


        console.log(
            "Camera setup completed."
        );


        // Start camera

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
        // UPDATE BUTTONS
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


        // ==================================
        // DISPLAY READY MESSAGE
        // ==================================

        document.getElementById(
            "prediction"
        ).innerHTML =

            `<p>
                Camera ready. Click Start Prediction.
            </p>`;


        // Start webcam loop

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
// 4. WEBCAM LOOP
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
// 5. START PREDICTION
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


    // Start prediction

    predict();
}


// ==========================================
// 6. PREDICT SIGN LANGUAGE
// ==========================================

async function predict() {

    if (!predicting) {

        return;

    }


    try {

        // Get ALL predictions

        const predictions =
            await model.predict(
                webcam.canvas
            );


        // ==================================
        // FIND HIGHEST PREDICTION
        // ==================================

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


        // ==================================
        // GET LETTER
        // ==================================

        const className =
            highestPrediction.className;


        // ==================================
        // GET CONFIDENCE
        // ==================================

        const confidence =
            highestPrediction.probability * 100;


        // ==================================
        // DISPLAY LETTER
        // ==================================

        document.getElementById(
            "prediction"
        ).innerHTML =

            `Sign: <strong>${className}</strong>`;


        // ==================================
        // DISPLAY CONFIDENCE
        // ==================================

        document.getElementById(
            "confidence-text"
        ).innerText =

            confidence.toFixed(1) + "%";


        // ==================================
        // CONFIDENCE BAR
        // ==================================

        document.getElementById(
            "confidence-bar"
        ).style.width =

            confidence + "%";


        // ==================================
        // ADD TO HISTORY
        // ==================================

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
// 7. PREDICTION HISTORY
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


    // Put newest prediction first

    history.insertBefore(
        item,
        history.firstChild
    );


    // Keep only last 10 predictions

    while (
        history.children.length > 10
    ) {

        history.removeChild(
            history.lastChild
        );

    }
}


// ==========================================
// 8. STOP CAMERA
// ==========================================

function stopCamera() {

    predicting = false;

    cameraStarted = false;

    previousPrediction = "";


    // Stop webcam

    if (webcam) {

        webcam.stop();

    }


    // Clear webcam

    document.getElementById(
        "webcam-container"
    ).innerHTML =

        `<p class="camera-message">
            Camera stopped.
        </p>`;


    // Reset prediction

    document.getElementById(
        "prediction"
    ).innerHTML =

        "<p>Camera stopped. Start again to continue.</p>";


    // Reset confidence

    document.getElementById(
        "confidence-text"
    ).innerText = "0%";


    document.getElementById(
        "confidence-bar"
    ).style.width = "0%";


    // Reset buttons

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