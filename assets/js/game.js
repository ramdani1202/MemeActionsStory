/* ============================================================
   GAME.JS
   Logic utama: state management, story flow, battle system,
   galeri unlock, dan penyimpanan progres (localStorage).
   Semua konten cerita/battle ada di data/story.js (window.GAME_DATA)
   ============================================================ */

(function () {
  "use strict";

  const { HERO, PHOTOS, ENEMIES, SKILLS, STORY } = window.GAME_DATA;
  const SAVE_KEY = "apes-chronicles-save-v1";

  // ------------------------------------------------------------
  // STATE
  // ------------------------------------------------------------
  let state = {
    chapterIndex: 0,
    dialogIndex: 0,
    unlockedPhotos: [],       // array of photo ids
    heroHp: HERO.maxHp,
    completed: false,
  };

  let battleState = null; // { enemy, enemyHp, enemyMaxHp, cooldowns, onWin, onLose }

  // ------------------------------------------------------------
  // SAVE / LOAD
  // ------------------------------------------------------------
  function saveGame() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn("Gagal menyimpan progres:", e);
    }
  }

  function loadGame() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        state = Object.assign(state, parsed);
      }
    } catch (e) {
      console.warn("Gagal memuat progres:", e);
    }
  }

  function resetGame() {
    state = {
      chapterIndex: 0,
      dialogIndex: 0,
      unlockedPhotos: [],
      heroHp: HERO.maxHp,
      completed: false,
    };
    saveGame();
  }

  // ------------------------------------------------------------
  // DOM HELPERS
  // ------------------------------------------------------------
  const $ = (id) => document.getElementById(id);

  function showScreen(id) {
    document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
    $(id).classList.add("active");
  }

  function spawnDamageNumber(targetEl, text, isHeal) {
    const rect = targetEl.getBoundingClientRect();
    const el = document.createElement("div");
    el.className = "dmg-float" + (isHeal ? " heal" : "");
    el.textContent = text;
    el.style.left = rect.left + rect.width / 2 - 15 + "px";
    el.style.top = rect.top + "px";
    el.style.position = "fixed";
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 800);
  }

  // ------------------------------------------------------------
  // STORY FLOW
  // ------------------------------------------------------------
  function getCurrentChapter() {
    return STORY[state.chapterIndex];
  }

  function renderStory() {
    const chapter = getCurrentChapter();
    if (!chapter) {
      showEnding();
      return;
    }
    showScreen("screen-story");
    $("hero-name-label").textContent = HERO.name;
    updateHeroMiniHp();

    $("chapter-label").textContent = chapter.title;
    const line = chapter.dialog[state.dialogIndex];
    $("dialog-box").textContent = line;

    const isLastLine = state.dialogIndex >= chapter.dialog.length - 1;
    const choicesWrap = $("choices-wrap");
    const nextBtn = $("btn-next-line");

    if (isLastLine && chapter.choices && chapter.choices.length) {
      nextBtn.hidden = true;
      choicesWrap.hidden = false;
      choicesWrap.innerHTML = "";
      chapter.choices.forEach((choice) => {
        const btn = document.createElement("button");
        btn.className = "choice-btn";
        btn.textContent = choice.text;
        btn.addEventListener("click", () => advanceAfterChoice(chapter));
        choicesWrap.appendChild(btn);
      });
    } else {
      nextBtn.hidden = false;
      choicesWrap.hidden = true;
    }
  }

  function advanceAfterChoice(chapter) {
    proceedFromChapterEnd(chapter);
  }

  function proceedFromChapterEnd(chapter) {
    if (chapter.battle) {
      startBattle(chapter.battle, () => onChapterWin(chapter), () => onChapterLose(chapter));
    } else {
      unlockPhoto(chapter.unlock);
      showResultScreen(chapter.unlock, () => goToNextChapter());
    }
  }

  function onChapterWin(chapter) {
    unlockPhoto(chapter.unlock);
    showResultScreen(chapter.unlock, () => goToNextChapter());
  }

  function onChapterLose(chapter) {
    // Hero kalah: pulihkan sedikit HP dan beri kesempatan lagi (tanpa penalti berat)
    state.heroHp = Math.ceil(HERO.maxHp * 0.5);
    saveGame();
    showScreen("screen-story");
    $("dialog-box").textContent = "Rangga kalah telak... tapi hidup harus terus berjalan. Coba lagi!";
    $("btn-next-line").hidden = false;
    $("choices-wrap").hidden = true;
    $("btn-next-line").onclick = () => {
      $("btn-next-line").onclick = () => handleNextLine();
      proceedFromChapterEnd(chapter);
    };
  }

  function goToNextChapter() {
    state.chapterIndex += 1;
    state.dialogIndex = 0;
    saveGame();
    if (state.chapterIndex >= STORY.length) {
      state.completed = true;
      saveGame();
      showEnding();
    } else {
      renderStory();
    }
  }

  function handleNextLine() {
    const chapter = getCurrentChapter();
    if (!chapter) return;
    if (state.dialogIndex < chapter.dialog.length - 1) {
      state.dialogIndex += 1;
      renderStory();
    } else if (!chapter.choices || !chapter.choices.length) {
      proceedFromChapterEnd(chapter);
    }
  }

  function updateHeroMiniHp() {
    const pct = Math.max(0, (state.heroHp / HERO.maxHp) * 100);
    $("hero-hp-mini").style.width = pct + "%";
  }

  // ------------------------------------------------------------
  // BATTLE SYSTEM
  // ------------------------------------------------------------
  function startBattle(enemyKey, onWin, onLose) {
    const enemyData = ENEMIES[enemyKey];
    battleState = {
      enemy: enemyData,
      enemyHp: enemyData.maxHp,
      enemyMaxHp: enemyData.maxHp,
      cooldowns: {},
      onWin,
      onLose,
    };
    if (state.heroHp <= 0) state.heroHp = HERO.maxHp;

    showScreen("screen-battle");
    $("enemy-name").textContent = enemyData.name;
    $("enemy-sprite").textContent = enemyData.sprite;
    $("hero-name-battle").textContent = HERO.name;
    logBattle(`Hadapi ${enemyData.name}!`);
    renderBattleUI();
    renderSkills();
  }

  function renderBattleUI() {
    const heroPct = Math.max(0, (state.heroHp / HERO.maxHp) * 100);
    const enemyPct = Math.max(0, (battleState.enemyHp / battleState.enemyMaxHp) * 100);
    $("hero-hp-fill").style.width = heroPct + "%";
    $("enemy-hp-fill").style.width = enemyPct + "%";
    $("hero-hp-text").textContent = `${Math.max(0, state.heroHp)} / ${HERO.maxHp} HP`;
    $("enemy-hp-text").textContent = `${Math.max(0, battleState.enemyHp)} / ${battleState.enemyMaxHp} HP`;
  }

  function renderSkills() {
    const wrap = $("skills-wrap");
    wrap.innerHTML = "";
    SKILLS.forEach((skill) => {
      const cd = battleState.cooldowns[skill.id] || 0;
      const btn = document.createElement("button");
      btn.className = "skill-card";
      btn.disabled = cd > 0;
      btn.innerHTML = `
        <span class="skill-name">${skill.name}</span>
        <span class="skill-desc">${skill.desc}</span>
        ${cd > 0 ? `<span class="skill-cd">Cooldown: ${cd}</span>` : ""}
      `;
      btn.addEventListener("click", () => useSkill(skill));
      wrap.appendChild(btn);
    });
  }

  function logBattle(text) {
    $("battle-log").textContent = text;
  }

  function tickCooldowns() {
    Object.keys(battleState.cooldowns).forEach((key) => {
      if (battleState.cooldowns[key] > 0) battleState.cooldowns[key] -= 1;
    });
  }

  function useSkill(skill) {
    if (!battleState) return;
    const heroSprite = document.querySelector(".hero-sprite");
    const enemySprite = document.querySelector(".enemy-sprite");

    if (skill.heal) {
      const healAmt = skill.heal;
      state.heroHp = Math.min(HERO.maxHp, state.heroHp + healAmt);
      spawnDamageNumber(heroSprite, `+${healAmt}`, true);
      logBattle(`${HERO.name} memakai ${skill.name} dan pulih ${healAmt} HP.`);
    } else {
      const missed = skill.missChance && Math.random() < skill.missChance;
      if (missed) {
        logBattle(`${HERO.name} memakai ${skill.name}... tapi meleset!`);
      } else {
        const dmg = Math.round(HERO.baseAttack * skill.damageMult * (0.85 + Math.random() * 0.3));
        battleState.enemyHp = Math.max(0, battleState.enemyHp - dmg);
        enemySprite.classList.add("hit");
        setTimeout(() => enemySprite.classList.remove("hit"), 350);
        spawnDamageNumber(enemySprite, `-${dmg}`, false);
        logBattle(`${HERO.name} memakai ${skill.name}! ${battleState.enemy.name} kena ${dmg} damage.`);
      }
    }

    if (skill.cooldown) battleState.cooldowns[skill.id] = skill.cooldown;
    tickCooldowns();
    renderBattleUI();
    renderSkills();
    saveGame();

    if (battleState.enemyHp <= 0) {
      setTimeout(() => endBattle(true), 500);
      return;
    }

    setTimeout(() => enemyTurn(), 700);
  }

  function enemyTurn() {
    if (!battleState) return;
    const heroSprite = document.querySelector(".hero-sprite");
    const dmg = Math.round(battleState.enemy.attack * (0.8 + Math.random() * 0.4));
    state.heroHp = Math.max(0, state.heroHp - dmg);
    heroSprite.classList.add("hit");
    setTimeout(() => heroSprite.classList.remove("hit"), 350);
    spawnDamageNumber(heroSprite, `-${dmg}`, false);
    logBattle(`${battleState.enemy.name} menyerang balik! ${HERO.name} kena ${dmg} damage.`);
    renderBattleUI();
    saveGame();

    if (state.heroHp <= 0) {
      setTimeout(() => endBattle(false), 500);
    }
  }

  function endBattle(won) {
    const { onWin, onLose } = battleState;
    battleState = null;
    if (won) {
      onWin();
    } else {
      onLose();
    }
  }

  // ------------------------------------------------------------
  // UNLOCK & RESULT SCREEN
  // ------------------------------------------------------------
  function unlockPhoto(photoId) {
    if (!photoId) return;
    if (!state.unlockedPhotos.includes(photoId)) {
      state.unlockedPhotos.push(photoId);
      saveGame();
    }
  }

  function showResultScreen(photoId, onContinue) {
    const photo = PHOTOS.find((p) => p.id === photoId);
    showScreen("screen-result");
    $("result-eyebrow").textContent = "KENANGAN TERBUKA";
    $("result-title").textContent = "Unlock Baru!";
    $("photo-caption").textContent = photo ? photo.caption : "";

    const reveal = $("photo-reveal");
    reveal.innerHTML = "";
    if (photo && photo.src) {
      const img = document.createElement("img");
      img.src = photo.src;
      img.alt = photo.caption;
      reveal.appendChild(img);
    } else {
      reveal.textContent = "#" + String(photoId).padStart(2, "0");
    }

    const flash = $("result-flash");
    flash.classList.remove("flash");
    void flash.offsetWidth; // restart animation
    flash.classList.add("flash");

    $("btn-continue").onclick = onContinue;
  }

  // ------------------------------------------------------------
  // GALLERY
  // ------------------------------------------------------------
  function renderGallery() {
    showScreen("screen-gallery");
    const grid = $("gallery-grid");
    grid.innerHTML = "";
    $("gallery-progress").textContent = `${state.unlockedPhotos.length} / ${PHOTOS.length} terbuka`;

    PHOTOS.forEach((photo) => {
      const unlocked = state.unlockedPhotos.includes(photo.id);
      const item = document.createElement("div");
      item.className = "gallery-item " + (unlocked ? "unlocked" : "locked");

      if (unlocked) {
        if (photo.src) {
          const img = document.createElement("img");
          img.src = photo.src;
          img.alt = photo.caption;
          item.appendChild(img);
        } else {
          item.textContent = "#" + String(photo.id).padStart(2, "0");
        }
        item.addEventListener("click", () => openLightbox(photo));
      } else {
        item.innerHTML = `<span class="lock-icon">🔒</span>`;
      }
      grid.appendChild(item);
    });
  }

  function openLightbox(photo) {
    $("lightbox").hidden = false;
    $("lightbox-caption").textContent = photo.caption;
    const container = $("lightbox-photo");
    container.innerHTML = "";
    if (photo.src) {
      const img = document.createElement("img");
      img.src = photo.src;
      img.alt = photo.caption;
      container.appendChild(img);
    } else {
      container.textContent = "#" + String(photo.id).padStart(2, "0");
    }
  }

  // ------------------------------------------------------------
  // ENDING
  // ------------------------------------------------------------
  function showEnding() {
    showScreen("screen-ending");
  }

  // ------------------------------------------------------------
  // EVENT BINDINGS
  // ------------------------------------------------------------
  function bindEvents() {
    $("btn-start").addEventListener("click", () => {
      if (state.completed) {
        // sudah tamat sebelumnya, tapi user pilih mulai lagi -> lanjutkan dari galeri
        renderStory();
      } else {
        renderStory();
      }
    });

    $("btn-gallery-title").addEventListener("click", renderGallery);
    $("btn-gallery-story").addEventListener("click", renderGallery);
    $("btn-close-gallery").addEventListener("click", () => {
      if (state.completed) showEnding();
      else renderStory();
    });
    $("btn-view-gallery-end").addEventListener("click", renderGallery);

    $("btn-next-line").addEventListener("click", handleNextLine);

    $("btn-restart").addEventListener("click", () => {
      resetGame();
      renderStory();
    });

    $("btn-close-lightbox").addEventListener("click", () => {
      $("lightbox").hidden = true;
    });
  }

  // ------------------------------------------------------------
  // INIT
  // ------------------------------------------------------------
  function init() {
    loadGame();
    bindEvents();
    showScreen("screen-title");
  }

  document.addEventListener("DOMContentLoaded", init);
})();
