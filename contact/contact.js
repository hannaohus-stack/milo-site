// MILO 문의폼 — 조건부 항목 · 검증 · 제출
// DB 연결: form[data-endpoint]에 저장 API 주소를 넣으면 JSON(POST)으로 전송합니다. 비어 있으면 전송 없이 완료 화면만 보여줍니다.
(() => {
  const form = document.getElementById('contact-form');
  const done = document.getElementById('contact-done');
  const errorBox = form.querySelector('.c-error');
  const f = form.elements;
  const header = document.querySelector('.h-header');

  const onScroll = () => header.classList.toggle('is-stuck', window.scrollY > 8);
  onScroll(); window.addEventListener('scroll', onScroll, { passive: true });
  document.querySelectorAll('a[aria-disabled="true"]').forEach((a) => a.addEventListener('click', (e) => e.preventDefault()));

  // URL로 문의 유형 미리 선택: contact/index.html?type=service
  const preset = new URLSearchParams(location.search).get('type');
  if (preset) { const r = form.querySelector(`input[name="type"][value="${preset}"]`); if (r) r.checked = true; }

  const val = (name) => (form.querySelector(`[name="${name}"]:checked`) || {}).value || '';

  // 문의 유형·답장 방법에 따라 항목 보이기
  const sync = () => {
    const type = val('type'); const reply = val('reply_via');
    form.querySelectorAll('[data-show-for]').forEach((el) => { el.hidden = !el.dataset.showFor.split(' ').includes(type); });
    form.querySelectorAll('[data-show-for-reply]').forEach((el) => { el.hidden = el.dataset.showForReply !== reply; });
    f.email.required = reply === 'email';
    f.phone.required = reply === 'phone';
  };
  form.addEventListener('change', sync); sync();

  // 글자 수
  const count = form.querySelector('.c-count b');
  f.message.addEventListener('input', () => { count.textContent = f.message.value.length; });

  // 휴대폰 자동 하이픈
  f.phone.addEventListener('input', () => {
    const d = f.phone.value.replace(/\D/g, '').slice(0, 11);
    f.phone.value = d.length < 4 ? d : d.length < 8 ? `${d.slice(0, 3)}-${d.slice(3)}` : `${d.slice(0, 3)}-${d.slice(3, d.length - 4)}-${d.slice(-4)}`;
  });

  const check = () => {
    form.querySelectorAll('.is-invalid').forEach((el) => el.classList.remove('is-invalid'));
    const errs = [];
    const mark = (el, msg) => { el.classList.add('is-invalid'); errs.push({ el, msg }); };

    if (!val('type')) mark(form.querySelector('.c-chips'), '문의 유형을 골라주세요.');
    if (!f.name.value.trim()) mark(f.name, '이름을 적어주세요.');
    if (!f.industry.value) mark(f.industry, '업종을 골라주세요.');
    if (f.message.value.trim().length < 5) mark(f.message, '문의 내용을 조금만 더 적어주세요.');
    const reply = val('reply_via');
    if (reply === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.value.trim())) mark(f.email, '답장받을 이메일을 확인해 주세요.');
    if (reply === 'phone' && !/^01\d-?\d{3,4}-?\d{4}$/.test(f.phone.value.trim())) mark(f.phone, '휴대폰 번호를 확인해 주세요.');
    if (reply === 'dm' && !f.insta.value.trim()) mark(f.insta, 'DM으로 답장받으려면 인스타그램 계정을 적어주세요.');
    if (!f.agree_privacy.checked) mark(f.agree_privacy, '개인정보 수집·이용에 동의해 주세요.');
    return errs;
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (f.website.value) return; // 스팸 방지 (사람은 못 보는 칸)
    const errs = check();
    if (errs.length) {
      errorBox.textContent = errs[0].msg; errorBox.hidden = false;
      (errs[0].el.focus ? errs[0].el : errs[0].el.querySelector('input')).focus();
      return;
    }
    errorBox.hidden = true;

    const data = Object.fromEntries(new FormData(form));
    data.products = new FormData(form).getAll('products');
    data.agree_privacy = f.agree_privacy.checked;
    data.agree_marketing = f.agree_marketing.checked;
    data.submitted_at = new Date().toISOString();
    data.page = location.pathname;
    delete data.website;

    const btn = form.querySelector('.c-submit'); btn.disabled = true;
    try {
      const endpoint = form.dataset.endpoint;
      if (endpoint) {
        const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
        if (!res.ok) throw new Error(res.status);
      } else {
        console.info('[MILO contact] DB 미연결 — 전송하지 않은 데이터:', data);
      }
      form.hidden = true; done.hidden = false; done.focus();
      window.scrollTo({ top: done.getBoundingClientRect().top + window.scrollY - 110, behavior: 'smooth' });
    } catch (err) {
      errorBox.textContent = '보내지 못했어요. 잠시 후 다시 시도하거나 인스타그램 DM으로 문의해 주세요.'; errorBox.hidden = false;
    } finally { btn.disabled = false; }
  });
})();
