const DEEPGRAM_API_KEY = "939a1b5d5f6248ccb32a12eb94f0cc77eeb3ea08";

async function sendToDeepgram(audioBlob) {
  const response = await fetch("https://api.deepgram.com/v1/listen", {
    method: "POST",
    headers: {
      "Authorization": `Token ${DEEPGRAM_API_KEY}`,
      "Content-Type": "audio/webm"
    },
    body: audioBlob
  });

  const data = await response.json();

  return (
    data?.results?.channels?.[0]?.alternatives?.[0]?.transcript ||
    ""
  );
}


let mediaRecorder;
let audioChunks = [];

const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const output = document.getElementById("output");

startBtn.onclick = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    mediaRecorder = new MediaRecorder(stream);
    audioChunks = [];

    mediaRecorder.ondataavailable = (e) => audioChunks.push(e.data);

    mediaRecorder.start();
    startBtn.disabled = true;
    stopBtn.disabled = false;

    output.innerText = "Recording...";
  } catch (err) {
    output.innerText = "Microphone access denied.";
  }
};

stopBtn.onclick = () => {
  mediaRecorder.stop();
  startBtn.disabled = false;
  stopBtn.disabled = true;

  mediaRecorder.onstop = async () => {
    const audioBlob = new Blob(audioChunks, { type: "audio/webm" });

    output.innerText = "Transcribing...";

    try {
      const transcript = await sendToDeepgram(audioBlob);

      output.innerText =
        transcript || "No speech detected. Please try again.";
    } catch (error) {
      output.innerText = "Error during transcription.";
    }
  }
};

