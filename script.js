const output = document.getElementById("scriptOutput");
const revealBtn = document.getElementById("revealBtn");
const copyBtn = document.getElementById("copyBtn");
const status = document.getElementById("status");
let publishedText = "";

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

// Анимированный слой с заметными частицами и соединяющими их линиями.
(() => {
  const canvas = document.getElementById("backgroundCanvas");
  if (!canvas) return;
  const context = canvas.getContext("2d");
  if (!context) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let width = 0;
  let height = 0;
  let particles = [];
  let frameId = 0;
  let lastFrame = 0;

  function resize() {
    const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    context.setTransform(ratio, 0, 0, ratio, 0, 0);

    const count = Math.min(145, Math.max(65, Math.round(width * height / 10500)));
    particles = Array.from({ length: count }, (_, index) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.34,
      vy: (Math.random() - 0.5) * 0.34,
      radius: 0.8 + Math.random() * 1.5,
      phase: Math.random() * Math.PI * 2,
      phaseSpeed: 0.004 + Math.random() * 0.008,
      index
    }));
    draw(0);
  }

  function draw(time) {
    context.clearRect(0, 0, width, height);

    // Мягкие световые облака добавляют глубину фону.
    const halo = context.createRadialGradient(width * 0.76, height * 0.34, 0, width * 0.76, height * 0.34, Math.max(width, height) * 0.48);
    halo.addColorStop(0, "rgba(25,110,56,0.095)");
    halo.addColorStop(1, "rgba(25,110,56,0)");
    context.fillStyle = halo;
    context.fillRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i++) {
      const particle = particles[i];
      if (!reducedMotion) {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.phase += particle.phaseSpeed;
        if (particle.x < -12) particle.x = width + 12;
        if (particle.x > width + 12) particle.x = -12;
        if (particle.y < -12) particle.y = height + 12;
        if (particle.y > height + 12) particle.y = -12;
      }

      const pulse = 0.65 + (Math.sin(particle.phase) + 1) * 0.22;
      context.beginPath();
      context.arc(particle.x, particle.y, particle.radius * pulse, 0, Math.PI * 2);
      context.fillStyle = "rgba(155,255,171,0.92)";
      context.shadowBlur = 9;
      context.shadowColor = "rgba(94,229,139,0.8)";
      context.fill();
      context.shadowBlur = 0;

      for (let j = i + 1; j < particles.length; j++) {
        const other = particles[j];
        const dx = particle.x - other.x;
        const dy = particle.y - other.y;
        const distanceSquared = dx * dx + dy * dy;
        const maxDistance = 155;
        if (distanceSquared < maxDistance * maxDistance) {
          const distance = Math.sqrt(distanceSquared);
          const alpha = 0.24 * (1 - distance / maxDistance);
          context.beginPath();
          context.moveTo(particle.x, particle.y);
          context.lineTo(other.x, other.y);
          context.strokeStyle = "rgba(94,229,139," + alpha.toFixed(3) + ")";
          context.lineWidth = 0.85;
          context.stroke();
        }
      }
    }

    if (!reducedMotion) frameId = window.requestAnimationFrame(draw);
  }

  window.addEventListener("resize", resize, { passive: true });
  resize();
  if (!reducedMotion) frameId = window.requestAnimationFrame(draw);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) window.cancelAnimationFrame(frameId);
    else if (!reducedMotion) frameId = window.requestAnimationFrame(draw);
  });
  window.addEventListener("pagehide", () => window.cancelAnimationFrame(frameId), { once: true });
})();
