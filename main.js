document.addEventListener("DOMContentLoaded", () => {

// =========================
// ステージ選択（index.html）
// =========================
const stageCards = document.querySelectorAll(".stageCard");
const clearedStage = Number(localStorage.getItem("clearedStage") || 0);
const stageData = JSON.parse(localStorage.getItem("stageData") || "{}");

stageCards.forEach((card, index) => {
  const stageNumber = index + 1;
  const savedStars = stageData[String(stageNumber)];
  const starEl = card.querySelector(".stageStars");

  // 🔓 ロック解除処理
  if (stageNumber <= clearedStage + 1) {
    card.disabled = false;
    card.classList.remove("is-locked");
  } else {
    card.disabled = true;
    card.classList.add("is-locked");
  }

  if (starEl && savedStars !== undefined) {
    starEl.textContent =
      "★".repeat(savedStars) + "☆".repeat(3 - savedStars);
    starEl.classList.add("is-animated");
  }
  
  const newestStage = clearedStage + 1;

  if (stageNumber === newestStage && stageNumber !== 1) {
    const badge = document.createElement("span");
    badge.className = "newBadge";
    badge.textContent = "NEW";
    card.appendChild(badge);
  }
  

  card.addEventListener("click", () => {
    if (card.disabled) return;

    window.location.href = `play-stage.html?stage=${stageNumber}`;
  });
});



// =========================
// UI（戻るボタン）
// =========================
  const backBtn = document.querySelector(".backBtn");

  if (backBtn) {
    backBtn.addEventListener("click", () => {
      window.location.href = "index.html";
    });
  }


// =========================
// プレイ画面 判定
// =========================
const board = document.querySelector(".puzzleBoard");
if (!board) return;

  const params = new URLSearchParams(window.location.search);
  const stage = params.get("stage") || "1";

  const pieces = document.querySelectorAll(".pieceCard");
  const puzzleImage = document.getElementById("puzzleImage");
  const dropLayer = document.querySelector(".dropLayer");
  const tray = document.querySelector(".pieces");

  const progressText = document.querySelector(".progressText");
  const progressBar = document.querySelector(".progressBar span");

  const hintBtn = document.querySelector(".hintBtn");
  const hintCountText = document.querySelector(".hintCount");

  const resetBtn = document.querySelector(".resetBtn");
  const resetCountText = document.querySelector(".resetCount");

  const piecesTrack = document.querySelector(".pieces");
  const prevBtn = document.querySelector(".trayArrow--prev");
  const nextBtn = document.querySelector(".trayArrow--next");

  const previewBtn = document.querySelector(".previewBtn");
  const previewModal = document.querySelector(".previewModal");
  const previewClose = document.querySelector(".previewModal__close");
  // モーダル
  const retryBtn = document.querySelector(".retryBtn");
  const nextStageBtn = document.querySelector(".nextStageBtn");
  const resultCloseBtn = document.querySelector(".resultClose");
  const resultStars = document.querySelector(".resultStars");

  const timerText = document.querySelector(".glassPill");
  const playToggleBtn = document.querySelector(".playToggleBtn");
  const gridBtn = document.querySelector(".gridBtn");

  const helpBtn = document.querySelector(".helpBtn");
  const helpModal = document.querySelector(".helpModal");
  const helpCloseBtn = document.querySelector(".btnClose");
  const helpCheckbox = document.querySelector(".dontShow input");

  const grid = 3;
  const totalCount = 9;

  let correctCount = 0;
  let isFinished = false;
  let isPaused = false;
  let hintLeft = 3;
  let resetLeft = 5;
  let elapsedSeconds = 0;
  let timerId = null;


  // =========================
// ステージ画像データ
// =========================
  const stageImages = {
    "1": "moon.jpg",
    "2": "christmas.jpg",
    "3": "another-world.jpg",
    "4": "flower-gate.gif",
    "5": "sweets-town.jpg",
    "6": "creative-sweets.jpg",
  };

  // =========================
// パズル画像の反映
// =========================
  const imageSrc = stageImages[stage] || stageImages["1"];

  if (puzzleImage) {
    puzzleImage.src = imageSrc;
  }

  const previewImage = document.querySelector(".previewModal img");

if (previewImage) {
  previewImage.src = imageSrc;
}

  // =========================
// ピース生成・初期化
// =========================
  pieces.forEach((piece, index) => {
    const x = index % grid;
    const y = Math.floor(index / grid);

    piece.style.backgroundImage = `url(${imageSrc})`;
    piece.style.backgroundSize = `${grid * 100}% ${grid * 100}%`;
    piece.style.backgroundPosition = `${(x / (grid - 1)) * 100}% ${(y / (grid - 1)) * 100}%`;

    piece.dataset.id = index;
    piece.dataset.correct = "false";
  });

  // =========================
// 進捗表示
// =========================
  if (progressText) {
    progressText.textContent = `${correctCount} / ${totalCount}`;
  }

  function updateProgressBar() {
    if (!progressBar) return;
    progressBar.style.width = `${(correctCount / totalCount) * 100}%`;
  }

  updateProgressBar();

  // =========================
// タイマー
// =========================
  function startTimer() {
    if (timerId) return;

    timerId = setInterval(() => {
      elapsedSeconds++;

      const minutes = String(Math.floor(elapsedSeconds / 60)).padStart(2, "0");
      const seconds = String(elapsedSeconds % 60).padStart(2, "0");

      if (timerText) {
        timerText.textContent = `⏱ ${minutes}:${seconds}`;
      }
    }, 1000);
  }

  function stopTimer() {
    clearInterval(timerId);
    timerId = null;
  }

  startTimer();

  // =========================
// 一時停止・再開
// =========================
  function pauseGame() {
    if (isPaused) return;

    isPaused = true;
    stopTimer();

    if (playToggleBtn) {
      playToggleBtn.textContent = "▶";
      playToggleBtn.setAttribute("aria-label", "再生");
      playToggleBtn.classList.add("is-active");
    }
  }

  function resumeGame() {
    if (!isPaused) return;

    isPaused = false;
    startTimer();

    if (playToggleBtn) {
      playToggleBtn.textContent = "Ⅱ";
      playToggleBtn.setAttribute("aria-label", "一時停止");
      playToggleBtn.classList.remove("is-active");
    }
  }

  if (playToggleBtn) {
    playToggleBtn.addEventListener("click", () => {
      isPaused ? resumeGame() : pauseGame();
    });
  }


  // =========================
// ヘルプモーダル
// =========================
if (helpBtn && helpModal && helpCloseBtn) {
  helpBtn.addEventListener("click", () => {
    helpModal.hidden = false;
  });

  helpCloseBtn.addEventListener("click", () => {
    localStorage.setItem("seenHelp", "true");
    helpModal.hidden = true;
  });

  if (!localStorage.getItem("seenHelp")) {
    helpModal.hidden = false;
  }
}

  // =========================
// グリッド表示
// =========================
  if (gridBtn) {
    gridBtn.addEventListener("click", () => {
      board.classList.toggle("is-grid");
      gridBtn.classList.toggle("is-active");
    });
  }

  // =========================
// 正解位置の生成
// =========================
  function generateTargets() {
    const rect = board.getBoundingClientRect();
    const cellW = rect.width / grid;
    const cellH = rect.height / grid;
    const targets = {};

    pieces.forEach((piece) => {
      const id = Number(piece.dataset.id);
      const col = id % grid;
      const row = Math.floor(id / grid);

      targets[id] = {
        x: col * cellW,
        y: row * cellH,
      };
    });

    return targets;
  }

  let targets = generateTargets();

  window.addEventListener("resize", () => {
    targets = generateTargets();
  });

  // =========================
// 星評価ロジック
// =========================
  function calculateStars() {
    let stars = 3;

    if (elapsedSeconds > 60) stars = 2;
    if (elapsedSeconds > 120) stars = 1;

    const usedHints = 3 - hintLeft;
    stars -= usedHints;

    return Math.max(stars, 1);
  }

  function updateResultStars() {
    if (!resultStars) return;

    const starCount = calculateStars();
    resultStars.textContent = "★".repeat(starCount) + "☆".repeat(3 - starCount);
  }

// =========================
// ステージ進行・保存
// =========================
function saveStageClear(stage) {
  const cleared = Number(localStorage.getItem("clearedStage") || 0);

  if (Number(stage) > cleared) {
    localStorage.setItem("clearedStage", stage);
  }
}

function saveStageStars(stage, stars) {
  const stageData = JSON.parse(localStorage.getItem("stageData") || "{}");

  if (!stageData[stage] || stageData[stage] < stars) {
    stageData[stage] = stars;
  }

  localStorage.setItem("stageData", JSON.stringify(stageData));
}

function handleComplete() {
  if (isFinished) return;

  isFinished = true;
  stopTimer();

  const stars = calculateStars();

  updateResultStars();
  saveStageClear(stage);
  saveStageStars(stage, stars);

  finishPuzzle();
}


  // =========================
// ピース操作
// =========================
  function returnToTray(piece) {
    tray.appendChild(piece);

    piece.style.position = "";
    piece.style.left = "";
    piece.style.top = "";
    piece.style.zIndex = "";
    piece.style.width = "";
    piece.style.height = "";

    piece.classList.remove("is-dragging");
  }

  // =========================
// 初期化処理
// =========================
  function shufflePieces() {
    const piecesArray = Array.from(pieces);

    for (let i = piecesArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [piecesArray[i], piecesArray[j]] = [piecesArray[j], piecesArray[i]];
    }

    piecesArray.forEach((piece) => {
      tray.appendChild(piece);
    });
  }

  shufflePieces();

  if (piecesTrack && prevBtn && nextBtn) {
    const scrollAmount = 150;

    // =========================
// トレイUI制御
// =========================
    function updateTrayArrows() {
      const maxScroll = piecesTrack.scrollWidth - piecesTrack.clientWidth;
      const currentScroll = piecesTrack.scrollLeft;

      prevBtn.classList.toggle("is-disabled", currentScroll <= 0);
      nextBtn.classList.toggle("is-disabled", currentScroll >= maxScroll - 1);
    }

    updateTrayArrows();

    piecesTrack.addEventListener("scroll", updateTrayArrows);

    prevBtn.addEventListener("click", () => {
      piecesTrack.scrollBy({ left: -scrollAmount, behavior: "smooth" });
    });

    nextBtn.addEventListener("click", () => {
      piecesTrack.scrollBy({ left: scrollAmount, behavior: "smooth" });
    });
  }

  if (previewBtn && previewModal && previewClose) {
    previewBtn.addEventListener("click", () => {
      previewModal.classList.add("is-active");
      previewModal.setAttribute("aria-hidden", "false");
    });

    previewClose.addEventListener("click", () => {
      previewModal.classList.remove("is-active");
      previewModal.setAttribute("aria-hidden", "true");
    });

    previewModal.addEventListener("click", (e) => {
      if (e.target === previewModal) {
        previewModal.classList.remove("is-active");
        previewModal.setAttribute("aria-hidden", "true");
      }
    });
  }

// リトライ
if (retryBtn) {
  retryBtn.addEventListener("click", () => {
    location.reload();
  });
}

// 次のステージ
const TOTAL_STAGE = 5;

if (nextStageBtn) {
  if (Number(stage) >= TOTAL_STAGE) {
    nextStageBtn.textContent = "ステージ選択へ";

    nextStageBtn.addEventListener("click", () => {
      window.location.href = "index.html";
    });
  } else {
    nextStageBtn.textContent = "次のステージで遊ぶ";

    nextStageBtn.addEventListener("click", () => {
      const nextStage = Number(stage) + 1;
      window.location.href = `play-stage.html?stage=${nextStage}`;
    });
  }
}

  if (resultCloseBtn) {
    resultCloseBtn.addEventListener("click", () => {
      const modal = document.querySelector(".resultModal");
      if (modal) modal.classList.remove("is-active");
    });
  }

  function showHintGlow(x, y) {
    const glow = document.createElement("div");
    glow.classList.add("hintGlow");
    dropLayer.appendChild(glow);

    glow.style.left = `${x}px`;
    glow.style.top = `${y}px`;

    if (typeof gsap !== "undefined") {
      gsap.fromTo(
        glow,
        { opacity: 0, scale: 0.8 },
        { opacity: 1, scale: 1, duration: 0.25, ease: "power2.out" }
      );

      gsap.to(glow, {
        opacity: 0,
        scale: 1.25,
        duration: 0.5,
        delay: 0.9,
        ease: "power2.out",
        onComplete: () => glow.remove(),
      });
    } else {
      setTimeout(() => glow.remove(), 1200);
    }
  }

  if (hintBtn && hintCountText) {
    hintBtn.addEventListener("click", () => {
      if (hintLeft <= 0) return;

      const nextPiece = [...pieces].find((piece) => piece.dataset.correct !== "true");
      if (!nextPiece) return;

      const id = Number(nextPiece.dataset.id);
      const target = targets[id];

      if (!target) return;

      showHintGlow(target.x, target.y);

      hintLeft--;
      hintCountText.textContent = hintLeft;

      if (hintLeft === 0) {
        hintBtn.classList.add("is-disabled");
        hintBtn.disabled = true;
      }
    });
  }

  if (resetBtn && resetCountText) {
    resetBtn.addEventListener("click", () => {
      if (resetLeft <= 0) return;

      resetLeft--;
      resetCountText.textContent = resetLeft;

      pieces.forEach((piece) => {
        tray.appendChild(piece);

        piece.style.position = "";
        piece.style.left = "";
        piece.style.top = "";
        piece.style.zIndex = "";
        piece.style.width = "";
        piece.style.height = "";

        piece.classList.remove("is-snapped", "is-dragging");
        piece.dataset.correct = "false";
      });

      correctCount = 0;
      isFinished = false;

      if (progressText) {
        progressText.textContent = `${correctCount} / ${totalCount}`;
      }

      updateProgressBar();
      shufflePieces();

      if (resetLeft === 0) {
        resetBtn.classList.add("is-disabled");
        resetBtn.disabled = true;
      }
    });
  }

  pieces.forEach((piece) => {
    piece.addEventListener("pointerdown", (e) => {
      if (isPaused) return;
      if (piece.dataset.correct === "true") return;
      if (piece.classList.contains("is-dragging")) return;
    
      e.preventDefault();

      piece.setPointerCapture(e.pointerId);

      const rect = piece.getBoundingClientRect();
      const shiftX = e.clientX - rect.left;
      const shiftY = e.clientY - rect.top;

      document.body.appendChild(piece);

      piece.style.position = "fixed";
      piece.style.zIndex = "9999";
      piece.style.left = `${rect.left}px`;
      piece.style.top = `${rect.top}px`;
      piece.style.width = `${rect.width}px`;
      piece.style.height = `${rect.height}px`;
      piece.classList.add("is-dragging");

      const movePiece = (event) => {
        piece.style.left = `${event.clientX - shiftX}px`;
        piece.style.top = `${event.clientY - shiftY}px`;
      };

      const stopMove = (event) => {
        const boardRect = board.getBoundingClientRect();

        const isInside =
          event.clientX >= boardRect.left &&
          event.clientX <= boardRect.right &&
          event.clientY >= boardRect.top &&
          event.clientY <= boardRect.bottom;

        if (!isInside) {
          returnToTray(piece);
          cleanup();
          return;
        }

        let x = event.clientX - boardRect.left - shiftX;
        let y = event.clientY - boardRect.top - shiftY;

        const id = Number(piece.dataset.id);
        const target = targets[id];

        if (!target) {
          returnToTray(piece);
          cleanup();
          return;
        }

        const snapRange = board.classList.contains("is-grid") ? 100 : 80;
        const distance = Math.hypot(x - target.x, y - target.y);
        const isCorrect = distance < snapRange;

        if (isCorrect) {
          x = target.x;
          y = target.y;

          dropLayer.appendChild(piece);

          piece.style.position = "absolute";
          piece.style.left = `${x}px`;
          piece.style.top = `${y}px`;
          piece.style.zIndex = "20";
          piece.style.width = "";
          piece.style.height = "";

          piece.classList.add("is-snapped");
          piece.dataset.correct = "true";

          correctCount++;

          if (progressText) {
            progressText.textContent = `${correctCount} / ${totalCount}`;
          }

          updateProgressBar();
          playPlaceAnimation(piece, x, y, dropLayer);

          if (correctCount === totalCount) {
            handleComplete();
          }
        } else {
          returnToTray(piece);
        }

        cleanup();
      };


      function cleanup() {
        piece.classList.remove("is-dragging");
      
        try {
          piece.releasePointerCapture(e.pointerId);
        } catch (_) {}
      
        window.removeEventListener("pointermove", movePiece);
        window.removeEventListener("pointerup", stopMove);
      }
      
      window.addEventListener("pointermove", movePiece, { passive: false });
      window.addEventListener("pointerup", stopMove);
      
    });
  });
});

function playPlaceAnimation(piece, x, y, dropLayer) {
  if (typeof gsap === "undefined") return;

  gsap.fromTo(
    piece,
    { scale: 1.15 },
    { scale: 1, duration: 0.25, ease: "back.out(2)" }
  );

  const glow = document.createElement("div");
  glow.classList.add("placeGlow");
  dropLayer.appendChild(glow);

  glow.style.left = `${x + piece.offsetWidth / 2}px`;
  glow.style.top = `${y + piece.offsetHeight / 2}px`;

  gsap.fromTo(
    glow,
    { scale: 0.4, opacity: 1 },
    {
      scale: 1.8,
      opacity: 0,
      duration: 0.5,
      ease: "power2.out",
      onComplete: () => glow.remove(),
    }
  );
}

function finishPuzzle() {
  const board = document.querySelector(".puzzleBoard");
  const pieces = document.querySelectorAll(".pieceCard");
  const resultModal = document.querySelector(".resultModal");

  // GSAPがある時だけ演出
  if (typeof gsap !== "undefined") {
    gsap.to(".puzzleBoard img", {
      filter: "brightness(1) saturate(1)",
      duration: 0.6,
      ease: "power2.out",
    });

    gsap.fromTo(
      pieces,
      { scale: 1 },
      {
        scale: 1.08,
        duration: 0.3,
        yoyo: true,
        repeat: 1,
        stagger: 0.02,
        ease: "power2.out",
      }
    );

    if (board) {
      const glow = document.createElement("div");
      glow.classList.add("finishGlow");
      board.appendChild(glow);

      gsap.fromTo(
        glow,
        { scale: 0.3, opacity: 1 },
        {
          scale: 2.2,
          opacity: 0,
          duration: 0.8,
          ease: "power2.out",
          onComplete: () => glow.remove(),
        }
      );
    }
  }

  // GSAPがなくても必ずモーダルは出す
  if (resultModal) {
    setTimeout(() => {
      resultModal.classList.add("is-active");
      resultModal.setAttribute("aria-hidden", "false");
    }, 500);
  }
}
