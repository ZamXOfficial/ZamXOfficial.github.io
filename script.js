const output = document.getElementById("scriptOutput");
const revealBtn = document.getElementById("revealBtn");
const copyBtn = document.getElementById("copyBtn");
const status = document.getElementById("status");
let publishedText = "";

// Показ и копирование публичного текста из script.txt.
revealBtn.addEventListener("click", async () => {
  revealBtn.disabled = true;
  revealBtn.textContent = "ЗАГРУЗКА...";
  status.textContent = "Загружаем публичную версию...";
  try {
    const response = await fetch("script.txt", { cache: "no-store" });
    if (!response.ok) throw new Error("Файл script.txt не найден.");
    publishedText = await response.text();
    if (!publishedText.trim() || publishedText.includes("PLACEHOLDER")) {
      throw new Error("Пока нет опубликованного текста. Загляни сюда позже.");
    }
    output.textContent = publishedText;
    copyBtn.disabled = false;
    status.textContent = "Публичная версия загружена. Её можно скопировать.";
    revealBtn.innerHTML = 'ОБНОВИТЬ ТЕКСТ <span>↻</span>';
  } catch (error) {
    output.textContent = error.message;
    status.textContent = "Не удалось загрузить публикацию. Попробуй обновить страницу.";
    copyBtn.disabled = true;
  } finally {
    revealBtn.disabled = false;
  }
});

copyBtn.addEventListener("click", async () => {
  if (!publishedText) return;
  try {
    await navigator.clipboard.writeText(publishedText);
    status.textContent = "Скопировано в буфер обмена.";
  } catch {
    status.textContent = "Автокопирование недоступно. Выдели текст и скопируй вручную.";
  }
});

// Анимированный фон: лёгкие частицы и линии между близкими точками.
(() => {
  const canvas = document.getElementById("backgroundCanvas");
  if (!canvas) return;
  const context = canvas.getContext("2d");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let width = 0;
  let height = 0;
  let particles = [];
  let frame = 0;

  function resize() {
    const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    const count = Math.min(76, Math.max(26, Math.round(width / 19)));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.22,
      vy: (Math.random() - 0.5) * 0.22,
      radius: Math.random() * 1.35 + 0.35
    }));
    if (reducedMotion) draw();
  }

  function draw() {
    context.clearRect(0, 0, width, height);
    for (let i = 0; i < particles.length; i++) {
      const particle = particles[i];
      if (!reducedMotion) {
        particle.x += particle.vx;
        particle.y += particle.vy;
        if (particle.x < -8) particle.x = width + 8;
        if (particle.x > width + 8) particle.x = -8;
        if (particle.y < -8) particle.y = height + 8;
        if (particle.y > height + 8) particle.y = -8;
      }
      context.beginPath();
      context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      context.fillStyle = "rgba(164,255,146,0.52)";
      context.fill();

      for (let j = i + 1; j < particles.length; j++) {
        const other = particles[j];
        const dx = particle.x - other.x;
        const dy = particle.y - other.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 118) {
          context.beginPath();
          context.moveTo(particle.x, particle.y);
          context.lineTo(other.x, other.y);
          context.strokeStyle = "rgba(94,229,139," + (0.12 * (1 - distance / 118)) + ")";
          context.lineWidth = 0.7;
          context.stroke();
        }
      }
    }
    if (!reducedMotion) frame = window.requestAnimationFrame(draw);
  }

  window.addEventListener("resize", resize, { passive: true });
  resize();
  if (!reducedMotion) frame = window.requestAnimationFrame(draw);
  window.addEventListener("pagehide", () => window.cancelAnimationFrame(frame), { once: true });
})();