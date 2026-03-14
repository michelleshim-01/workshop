(function () {
  let editMode = false;
  const storageKey = 'workshop-edit:' + window.location.pathname;

  // 편집 가능한 요소 (페이지 네비·버튼 제외)
  const SELECTOR = [
    '.main-content h1', '.main-content h2', '.main-content h3',
    '.main-content p', '.main-content li',
    '.main-content td', '.main-content th',
    '.main-content pre',
    '.page-hero h1', '.page-hero p'
  ].join(', ');

  /* ── 헤더에 버튼 삽입 ── */
  function injectButtons() {
    const nav = document.querySelector('.nav-inner');
    if (!nav) return;

    const editBtn = Object.assign(document.createElement('button'), {
      id: 'edit-btn',
      textContent: '✏️ 편집'
    });
    styleBtn(editBtn, false);
    editBtn.onclick = toggleEdit;

    const resetBtn = Object.assign(document.createElement('button'), {
      id: 'reset-btn',
      textContent: '↺ 초기화'
    });
    Object.assign(resetBtn.style, {
      padding: '5px 10px', background: 'transparent',
      color: '#DC2626', border: '1px solid #FECACA',
      borderRadius: '6px', fontSize: '12px', fontWeight: '600',
      cursor: 'pointer', marginLeft: '4px', display: 'none'
    });
    resetBtn.onclick = resetContent;

    nav.appendChild(editBtn);
    nav.appendChild(resetBtn);
  }

  function styleBtn(btn, active) {
    Object.assign(btn.style, {
      padding: '5px 12px',
      background: active ? 'var(--accent)' : 'transparent',
      color: active ? 'white' : 'var(--text-2)',
      border: active ? 'none' : '1px solid var(--border)',
      borderRadius: '6px', fontSize: '12px', fontWeight: '600',
      cursor: 'pointer', marginLeft: '8px'
    });
  }

  /* ── 편집 모드 토글 ── */
  function toggleEdit() {
    editMode = !editMode;
    const editBtn = document.getElementById('edit-btn');
    const resetBtn = document.getElementById('reset-btn');

    if (editMode) {
      editBtn.textContent = '✓ 완료';
      styleBtn(editBtn, true);
      resetBtn.style.display = 'inline-block';
      enableEditing();
    } else {
      editBtn.textContent = '✏️ 편집';
      styleBtn(editBtn, false);
      disableEditing();
      saveContent();
    }
  }

  function enableEditing() {
    document.querySelectorAll(SELECTOR).forEach(el => {
      // .page-nav 안의 요소는 건너뜀
      if (el.closest('.page-nav')) return;
      el.contentEditable = 'true';
      el.dataset.editActive = '1';
      el.style.outline = '1.5px dashed #FCA98E';
      el.style.borderRadius = '3px';
    });
  }

  function disableEditing() {
    document.querySelectorAll('[data-edit-active]').forEach(el => {
      el.contentEditable = 'false';
      delete el.dataset.editActive;
      el.style.outline = '';
      el.style.borderRadius = '';
    });
  }

  /* ── 저장 / 불러오기 / 초기화 ── */
  let saveTimer;
  function scheduleSave() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(saveContent, 800);
  }

  function saveContent() {
    const main = document.querySelector('.main-content');
    if (main) {
      localStorage.setItem(storageKey, main.innerHTML);
      toast('저장됨 ✓');
    }
  }

  function loadContent() {
    const saved = localStorage.getItem(storageKey);
    if (!saved) return;
    const main = document.querySelector('.main-content');
    if (main) main.innerHTML = saved;
  }

  function resetContent() {
    if (confirm('이 페이지의 모든 변경사항을 초기화할까요?')) {
      localStorage.removeItem(storageKey);
      location.reload();
    }
  }

  /* ── 입력 시 자동 저장 ── */
  document.addEventListener('input', e => {
    if (e.target.contentEditable === 'true') scheduleSave();
  });

  /* ── 토스트 알림 ── */
  function toast(msg) {
    const el = Object.assign(document.createElement('div'), { textContent: msg });
    Object.assign(el.style, {
      position: 'fixed', bottom: '24px', right: '24px',
      background: '#1C1917', color: 'white',
      padding: '9px 16px', borderRadius: '8px',
      fontSize: '13px', zIndex: '9999',
      opacity: '1', transition: 'opacity 0.3s'
    });
    document.body.appendChild(el);
    setTimeout(() => {
      el.style.opacity = '0';
      setTimeout(() => el.remove(), 300);
    }, 1800);
  }

  /* ── 초기화 ── */
  document.addEventListener('DOMContentLoaded', () => {
    loadContent();
    injectButtons();
  });
})();
