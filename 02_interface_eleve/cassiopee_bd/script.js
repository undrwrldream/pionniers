(function () {
  "use strict";

  var stage = document.getElementById("stage");
  var curNumEl = document.getElementById("curNum");
  var totNumEl = document.getElementById("totNum");
  var fillEl = document.getElementById("progressFill");
  var btnPrev = document.getElementById("btnPrev");
  var btnNext = document.getElementById("btnNext");
  var tapPrev = document.getElementById("tapPrev");
  var tapNext = document.getElementById("tapNext");
  var hublot = document.getElementById("hublot");
  var hint = document.getElementById("hint");
  var captionOverlay = document.getElementById("captionOverlay");
  var captionText = document.getElementById("captionText");

  var total = SCENES.length;
  var index = 0;
  var slideEls = new Array(total);
  var autoplayTimer = null;

  totNumEl.textContent = total;

  SCENES.forEach(function (scene, i) {
    var el = document.createElement("div");
    el.className = "scene-slide" + (scene.silent ? " is-silent" : "");
    el.setAttribute("aria-hidden", "true");

    var img = document.createElement("img");
    img.alt = scene.text ? scene.text.slice(0, 90) : "Cassiopée";
    img.loading = i === 0 ? "eager" : "lazy";
    img.decoding = "async";
    img.dataset.src = scene.src;
    if (scene.pos) img.style.objectPosition = scene.pos;
    el.appendChild(img);

    stage.appendChild(el);
    slideEls[i] = el;
  });

  function loadImage(i) {
    if (i < 0 || i >= total) return;
    var img = slideEls[i].querySelector("img[data-src]");
    if (img) {
      img.src = img.dataset.src;
      img.removeAttribute("data-src");
    }
  }

  function clearAutoplay() {
    if (autoplayTimer) {
      clearTimeout(autoplayTimer);
      autoplayTimer = null;
    }
  }

  function fitCaption() {
    if (!captionText || captionOverlay.classList.contains("is-empty")) return;

    var boxH = captionOverlay.clientHeight;
    var maxPx = boxH * 0.30;
    var minPx = boxH * 0.075;

    var size = maxPx;
    captionText.style.fontSize = size + "px";

    var guard = 0;
    while (captionText.scrollHeight > boxH && size > minPx && guard < 300) {
      size -= 0.75;
      captionText.style.fontSize = size + "px";
      guard++;
    }
  }

  function show(i) {
    clearAutoplay();
    index = Math.max(0, Math.min(total - 1, i));

    slideEls.forEach(function (el, j) {
      el.classList.toggle("is-active", j === index);
      el.setAttribute("aria-hidden", j === index ? "false" : "true");
    });

    loadImage(index);
    loadImage(index + 1);
    loadImage(index - 1);

    curNumEl.textContent = index + 1;
    fillEl.style.width = ((index + 1) / total) * 100 + "%";

    var scene = SCENES[index];
    hublot.setAttribute("aria-label", scene.text || "Cassiopée");

    if (scene.text) {
      captionText.textContent = scene.text;
      captionOverlay.classList.remove("is-empty");
      requestAnimationFrame(fitCaption);
    } else {
      captionText.textContent = "";
      captionOverlay.classList.add("is-empty");
    }

    btnPrev.disabled = index === 0;
    btnNext.disabled = index === total - 1;

    if (hint) {
      hint.textContent = "Cassiopée — Volume 1 · Marc-André Deschênes";
    }

    if (scene.silent && index < total - 1) {
      autoplayTimer = setTimeout(function () { go(1); }, 2200);
    }
  }

  function go(delta) {
    var next = index + delta;
    if (next < 0 || next >= total) return;
    show(next);
  }

  btnPrev.addEventListener("click", function () { go(-1); });
  btnNext.addEventListener("click", function () { go(1); });
  tapPrev.addEventListener("click", function () { go(-1); });
  tapNext.addEventListener("click", function () { go(1); });

  document.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight" || e.key === "PageDown") { go(1); e.preventDefault(); }
    else if (e.key === "ArrowLeft" || e.key === "PageUp") { go(-1); e.preventDefault(); }
    else if (e.key === "Home") { show(0); e.preventDefault(); }
    else if (e.key === "End") { show(total - 1); e.preventDefault(); }
  });

  var touchStartX = null;
  var touchStartY = null;
  hublot.addEventListener("touchstart", function (e) {
    var t = e.changedTouches[0];
    touchStartX = t.clientX;
    touchStartY = t.clientY;
  }, { passive: true });

  hublot.addEventListener("touchend", function (e) {
    if (touchStartX === null) return;
    var t = e.changedTouches[0];
    var dx = t.clientX - touchStartX;
    var dy = t.clientY - touchStartY;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.3) {
      go(dx < 0 ? 1 : -1);
    }
    touchStartX = null;
    touchStartY = null;
  }, { passive: true });

  var wheelLock = false;
  hublot.addEventListener("wheel", function (e) {
    if (wheelLock) return;
    var delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (Math.abs(delta) < 12) return;
    wheelLock = true;
    go(delta > 0 ? 1 : -1);
    setTimeout(function () { wheelLock = false; }, 420);
    e.preventDefault();
  }, { passive: false });

  window.addEventListener("resize", function () {
    var scene = SCENES[index];
    if (scene && scene.text) fitCaption();
  });

  show(0);
})();
