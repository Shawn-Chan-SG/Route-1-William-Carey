// SBG Route 1 — shared EN / 中文 (Simplified Chinese) toggle
//
// What this file does:
//  1. Remembers the visitor's chosen language in localStorage (shared across
//     every page of the site) and exposes window.SBG_I18N.get()/set()/toggle().
//  2. Injects a small floating "EN / 中文" pill button on every page.
//  3. On static pages (index.html, Team shells) swaps text for any element
//     carrying a data-zh="..." attribute — but ONLY when Chinese is active.
//     When the language is English, these elements are left completely
//     untouched, so the English site is guaranteed to look exactly as it
//     did before this file existed.
//  4. Fires a "sbg:langchange" event on document so engine.js can re-render
//     the dynamic checkpoint / passage screens in the new language.
//
// IMPORTANT — translation scope: the checkpoint "answer" (keyword) values in
// cp-data.js and the William Carey quest passage in passage-data.js are
// intentionally NOT translated anywhere in this file or elsewhere in the
// site. Those must always be found/read in English on the physical boards
// in the Gardens, so the game stays fair and unspoiled in both languages.
(function () {
  "use strict";

  var LANG_KEY = "sbg_route1_lang";

  function getLang() {
    try {
      var v = localStorage.getItem(LANG_KEY);
      return v === "zh" ? "zh" : "en";
    } catch (e) {
      return "en";
    }
  }

  function setLang(lang) {
    try { localStorage.setItem(LANG_KEY, lang === "zh" ? "zh" : "en"); } catch (e) { /* ignore */ }
  }

  window.SBG_I18N = {
    get: getLang,
    set: setLang,
    toggle: function () {
      var next = getLang() === "zh" ? "en" : "zh";
      setLang(next);
      return next;
    }
  };

  // ---------------------------------------------------------------------
  // UI_STRINGS — used by engine.js for every piece of app chrome (buttons,
  // labels, messages). Keys with {{placeholders}} are filled in by engine.js
  // after selecting the string. English is never read from here — engine.js
  // keeps the original English literals inline so the English experience is
  // unaffected by this file.
  // ---------------------------------------------------------------------
  window.UI_STRINGS = {
    zh: {
      locationMap: "位置地图",
      extraClue: "额外线索",
      boardMarker: "牌匾／标志",
      photo: "照片",
      task: "任务",
      continueBtn: "继续",
      completedContinueBtn: "我们已完成 ✔ 继续",
      solvedPrefix: "✅ 已解开！你的关键词：",
      directionsLabel: "方向指引",
      hiddenWordWhereLabel: "隐藏词的位置",
      answerPlaceholder: "在此输入关键词",
      submitAnswerBtn: "提交答案",
      skipBtn: "找不到？跳到下一站 ›",
      skippedNote: "你之前跳过了这一站——现在来解开它吧！",
      wrongMsg: "还不对——请再检查一次牌匾，然后再试一次。",
      correctMsg: "✅ 正确！做得好。",
      defaultMapCaption: "检查站位置以红色标记。",
      backBtn: "‹ 返回",
      myProgress: "我的进度",
      stationOf: "第 {{n}} / {{total}} 站",
      completedBadge: "✔ 已完成",
      skippedBadge: "⏭ 已跳过——请稍后回来完成",
      whatsappNoteKeyword: "📱 请将照片通过WhatsApp发送到 <strong>{{num}}</strong>，以获取本站的关键词。",
      whatsappNoteNoKeyword: "📱 请将照片通过WhatsApp发送到 <strong>{{num}}</strong>。",
      yourProgressTitle: "你的进度",
      teamLabel: "{{team}} 队",
      tagSolved: "已解开",
      tagDone: "已完成",
      tagSkipped: "已跳过",
      tagNotVisited: "尚未前往",
      tagLocked: "未解锁",
      allDoneMsg: "🎉 所有检查站已完成！你现在可以挑战最终关卡了。",
      goFinalBtn: "前往最终关卡 ›",
      progressSummary: "已解开 {{solved}} / {{total}} 个检查站。点击下方已跳过的站点回去完成——只有完成所有检查站，最终关卡才会解锁。",
      finalChallengeTitle: "最终关卡",
      fillPassageSub: "填写任务文段",
      useKeywordsInstruction: "使用你在各检查站收集到的关键词，完成以下文段。",
      checkAnswersBtn: "检查答案",
      wordBankLabel: "词库——每个词只使用一次",
      allCorrectMsg: "🎉 全部正确！正在跳转…",
      notQuiteMsg: "还有些词不太对——请检查标示出来的框和词库。",
      congratsTitle: "恭喜你，{{team}} 队！",
      congratsBody: "你已完成大使命探索之旅，解开了完整的威廉·克里文段。",
      congratsFooter: "请现在返回集合地点。做得好，团队！🙌",
      resetBtn: "↻ 重置并重新开始比赛",
      homeLink: "返回比赛首页",
      resetConfirm: "要为 {{team}} 队重新开始比赛吗？这将清除所有检查站与文段进度，以便下一组使用。"
    }
  };

  // ---------------------------------------------------------------------
  // Static page text swap — only touches elements with data-zh, and only
  // when Chinese is active. English DOM is never modified.
  // ---------------------------------------------------------------------
  function applyStatic() {
    var lang = getLang();
    if (lang === "zh") {
      document.documentElement.setAttribute("lang", "zh-Hans");
      var titleZh = document.documentElement.getAttribute("data-title-zh");
      if (titleZh) document.title = titleZh;
      Array.prototype.forEach.call(document.querySelectorAll("[data-zh]"), function (el) {
        var zhVal = el.getAttribute("data-zh");
        if (zhVal != null) el.innerHTML = zhVal;
      });
    } else {
      document.documentElement.setAttribute("lang", "en");
      var titleEn = document.documentElement.getAttribute("data-title-en");
      if (titleEn) document.title = titleEn;
      Array.prototype.forEach.call(document.querySelectorAll("[data-zh]"), function (el) {
        var enVal = el.getAttribute("data-en");
        if (enVal != null) el.innerHTML = enVal;
      });
    }
    var btn = document.getElementById("langToggleBtn");
    if (btn) btn.textContent = lang === "zh" ? "EN" : "中文";
  }

  function injectToggleButton() {
    if (document.getElementById("langToggleBtn")) return;
    var btn = document.createElement("button");
    btn.id = "langToggleBtn";
    btn.type = "button";
    btn.className = "lang-toggle";
    btn.setAttribute("aria-label", "Switch language / 切换语言");
    btn.onclick = function () {
      window.SBG_I18N.toggle();
      applyStatic();
      document.dispatchEvent(new CustomEvent("sbg:langchange", { detail: { lang: getLang() } }));
    };
    document.body.appendChild(btn);
  }

  document.addEventListener("DOMContentLoaded", function () {
    injectToggleButton();
    applyStatic();
  });
})();
