// 1. Model
var canvas, context, W, H, video;
var volumePercentage = 0; // Volum initial

// 2. Desenare
function desenare() {
  context.drawImage(video, 0, 0, W, H - 30);
  // Aplicare efecte, desenare controale, ...
  var fontSize = 20;
  context.font = fontSize + "px Arial";
  context.shadowOffsetX = 2;
  context.shadowOffsetY = 2;
  context.shadowBlur = 4;
  context.shadowColor = "rgba(0, 0, 0, 0.5)";

  // Desenare buton anterior
  context.fillStyle = "rgba(255, 255, 255, 0.2)";
  context.fillRect(0, H - 30, W * 0.08, 30);
  context.fillStyle = "black";
  context.fillText("<<", W * 0.02, H - 10);

  // Desenare buton play/pause
  context.fillStyle = "rgba(255, 255, 255, 0.3)";
  context.fillRect(W * 0.08, H - 30, W * 0.08, 30);
  context.fillStyle = "black";
  context.fillText("▶️", W * 0.1, H - 10);

  // Desenare buton urmator
  context.fillStyle = "rgba(255, 255, 255, 0.2)";
  context.fillRect(W * 0.16, H - 30, W * 0.08, 30);
  context.fillStyle = "black";
  context.fillText(">>", W * 0.18, H - 10);

  // Desenare sectiune control volum
  context.fillStyle = "rgba(255, 255, 255, 0.3)";
  context.fillRect(W * 0.84, H - 30, W * 0.16, 30);

  // Desenare indicator nivel volum
  context.fillStyle = "rgba(255, 100, 5, 0.4)";
  context.fillRect(W * 0.89, H - 30, video.volume * (W * 0.11), 30);

  // Desenare icon volum
  var volumeIcon = document.getElementById("volumeIcon");
  context.drawImage(volumeIcon, W * 0.85, H - 25, 24, 24);

  // Desenare sectiune bara de progres
  context.fillStyle = "rgba(255, 255, 255, 0.1)";
  context.fillRect(W * 0.24, H - 30, W * 0.84, 30);

  context.fillStyle = "hsla(240, 100%, 50%, 30%)";
  if (video.currentTime && video.duration) {
    context.fillRect(
      W * 0.24,
      H - 30,
      W * 0.6 * (video.currentTime / video.duration),
      30
    );

    // Resetare proprietati umbra
    context.shadowOffsetX = 0;
    context.shadowOffsetY = 0;
    context.shadowBlur = 0;
    context.shadowColor = "transparent";
  }
  requestAnimationFrame(desenare);
}

function handleCanvasClick(event) {
  // Calcul coordonatele relative x si y in cadrul canvasului
  var clickX = event.clientX - canvas.offsetLeft;
  var clickY = event.clientY - canvas.offsetTop;

  // Verifica daca click-ul este in interiorul sectiunii de control al volumului
  if (clickX >= W * 0.89 && clickX <= W && clickY >= H - 30 && clickY <= H) {
    // Calculeaza procentajul pozitiei la care s-a facut click
    var volumePercentage = (clickX - W * 0.89) / (W * 0.11);
    // Seteaza volumul video in functie de procentajul calculat
    video.volume = volumePercentage;
    localStorage.setItem("volume", video.volume);
  }

  // Sectiune bara de progres
  if (
    clickX >= W * 0.24 &&
    clickX <= W * 0.84 &&
    clickY >= H - 30 &&
    clickY <= H
  ) {
    video.currentTime = video.duration * ((clickX - W * 0.24) / (W * 0.6));
  }

  // Sectiune Previous
  if (clickX >= 0 && clickX < W * 0.08 && clickY >= H - 30 && clickY <= H) {
    index = index - 1;
    if (index < 0) {
      index = videoSources.length - 1;
    }
    localStorage.setItem("index", index);
    video.src = videoSources[index];
    video.load();
    video.play();
  }
  // Sectiune Next
  if (
    clickX >= W * 0.16 &&
    clickX < W * 0.24 &&
    clickY >= H - 30 &&
    clickY <= H
  ) {
    index = index + 1;
    if (index >= videoSources.length) {
      index = 0;
    }
    localStorage.setItem("index", index);
    video.src = videoSources[index];
    video.load();
    video.play();
  }

  // Sectiune PLAY/PAUSE
  if (
    (clickX >= W * 0.08 &&
      clickX <= W * 0.16 &&
      clickY >= H - 30 &&
      clickY <= H) ||
    (clickY >= 0 && clickY <= H - 30 && clickX >= 0 && clickX <= W)
  ) {
    // Pauza sau redare video
    video.paused ? video.play() : video.pause();
  }
}

// Declarare pentru a face VIDEOSOURCES accesibil in intregul script
let storedVideos = ["dog.mp4", "rio.mp4", "green_samo.mp4"];
var videoSources = storedVideos.map((video) => "media/" + video);
var index = 0;

function aplicatie() {
  canvas = document.querySelector("canvas");
  context = canvas.getContext("2d");
  (W = canvas.width), (H = canvas.height);

  video = document.querySelector("video");
  canvas.addEventListener("click", handleCanvasClick);
  index = localStorage.getItem("index");
  video.src = videoSources[index];
  video.volume = localStorage.getItem("volume");
  desenare();

  //  PLAYLIST
  let lista = document.querySelector("ul");

  for (let currentVideo of storedVideos) {
    let element = document.createElement("li");
    // Creare link cu numele video-ului
    let link = document.createElement("a");
    link.innerText = currentVideo;
    link.href = "media/" + currentVideo;
    // Setare eveniment onclick pentru schimbarea sursei video
    link.onclick = function () {
      index = videoSources.indexOf("media/" + currentVideo);
      localStorage.setItem("index", index);
      video.src = "media/" + currentVideo;
      video.load();
      video.play();
      return false; // Previne comportamentul implicit al hyperlink-ului
    };
    // Atasare link la elementul listei
    element.appendChild(link);

    lista.append(element);
  }

  //  LOOP INFINIT PLAYLIST
  video.addEventListener("ended", function () {
    index = index + 1;
    if (index >= videoSources.length) {
      index = 0;
    }
    localStorage.setItem("index", index);

    video.src = videoSources[index];
    video.load();
    video.play();
  });

  //  DRAG AND DROP
  document.addEventListener("dragover", (e) => e.preventDefault());
  document.addEventListener("drop", (e) => {
    e.preventDefault();

    for (let fisier of e.dataTransfer.files) {
      let element = document.createElement("li");
      // Creare link cu numele fisierului video
      let link = document.createElement("a");
      link.innerText = fisier.name;

      // Creare URL blob pentru fisier
      let blobUrl = URL.createObjectURL(fisier);
      link.href = blobUrl;

      // Setare eveniment onclick pentru schimbarea sursei video
      link.onclick = function () {
        // Gasirea indexului sursei video la care s-a facut click in array
        index = videoSources.indexOf(blobUrl);
        localStorage.setItem("index", index);

        video.src = blobUrl;
        video.load();
        video.play();
        return false; // Previne comportamentul implicit al hyperlink-ului
      };

      // Atasare link la elementul listei
      element.appendChild(link);
      lista.append(element);

      // Actualizare array videoSources cu noua sursa video
      videoSources.push(blobUrl);
    }
  });
}

document.addEventListener("DOMContentLoaded", aplicatie);
