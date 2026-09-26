/* MILO 정책 팝업 — [data-policy="terms|privacy|refund"] 링크를 누르면 작은 팝업으로 엽니다. */
(function () {
  var EFFECTIVE = '시행일 2026년 9월 25일';
  var BIZ = '주식회사 채움코리아 (대표 오한나 · 사업자등록번호 574-88-03146 · 통신판매업 신고 제2025-서울성동-0260호 · 서울시 성동구 서울숲4길 9 103호)';
  var MAIL = '<a href="mailto:marketing@chaeum.cloud">marketing@chaeum.cloud</a>';

  var DOCS = {
    terms: {
      title: '이용약관',
      body:
        '<h3>제1조 목적</h3><p>이 약관은 ' + BIZ + '(이하 “회사”)가 MILO 브랜드로 제공하는 디지털 키트와 서비스의 이용 조건을 정합니다.</p>' +
        '<h3>제2조 제공 상품</h3><ul><li>디지털 키트: AI TEAM KIT, AI BRANDING KIT, AI VISUAL KIT 등 파일 형태의 상품</li><li>서비스: 월간 AI 마케팅 운영 등 별도 계약으로 진행하는 서비스</li></ul>' +
        '<h3>제3조 구매와 결제</h3><p>디지털 키트는 외부 결제 플랫폼(Gumroad)을 통해 판매하며, 결제와 파일 전달은 해당 플랫폼의 절차를 따릅니다.</p>' +
        '<h3>제4조 이용 범위</h3><p>구매한 키트는 구매자 본인과 구매자의 브랜드 운영에 사용할 수 있습니다. 키트 파일과 내용을 재판매·재배포·공유하거나 강의·교재로 다시 제작하는 것은 허용하지 않습니다.</p>' +
        '<h3>제5조 AI 결과물</h3><p>키트는 AI 도구 활용 방법과 기준을 제공합니다. AI가 만든 결과물의 품질, 사업 성과, 매출·팔로워 증가는 보장하지 않으며, 결과물의 최종 검토와 사용 책임은 이용자에게 있습니다.</p>' +
        '<h3>제6조 서비스 이용</h3><p>서비스의 범위, 일정, 비용, 환불은 계약 시 별도로 정합니다.</p>' +
        '<h3>제7조 책임의 제한</h3><p>회사는 천재지변, 외부 플랫폼(ChatGPT, Gumroad 등)의 장애나 정책 변경 등 회사가 통제할 수 없는 사유로 발생한 손해에 대해 책임을 지지 않습니다.</p>' +
        '<h3>제8조 약관의 변경</h3><p>회사는 관련 법령을 위반하지 않는 범위에서 약관을 변경할 수 있으며, 변경 시 시행일 전에 사이트에 공지합니다.</p>' +
        '<h3>제9조 준거법</h3><p>이 약관은 대한민국 법률을 따르며, 분쟁은 민사소송법상 관할 법원에서 해결합니다.</p>' +
        '<p class="p-date">' + EFFECTIVE + '</p>'
    },
    privacy: {
      title: '개인정보처리방침',
      body:
        '<p>' + BIZ + '(이하 “회사”)는 개인정보 보호법을 지키며, 이용자의 개인정보를 아래와 같이 처리합니다.</p>' +
        '<h3>1. 수집 항목</h3><ul><li>문의: 이름, 연락처(이메일·휴대폰·인스타그램 계정 중 입력한 것), 브랜드명, 업종, 문의 내용</li><li>환불·재전송 요청: 구매 이메일, 주문 번호</li></ul>' +
        '<h3>2. 수집 목적</h3><p>문의 확인 및 답변, 구매 확인, 환불·재전송 처리. 마케팅 정보 수신은 별도로 동의한 경우에만 보냅니다.</p>' +
        '<h3>3. 보유 기간</h3><p>문의 처리 후 6개월 동안 보관하고 지체 없이 파기합니다. 법령에 보관 의무가 있으면 그 기간을 따릅니다.</p>' +
        '<h3>4. 제3자 제공</h3><p>이용자의 개인정보를 제3자에게 제공하지 않습니다. 키트 결제는 Gumroad가 처리하며, 결제 정보는 회사가 보관하지 않습니다.</p><p>문의 내용은 Supabase(서버 위치: 대한민국 서울)에 저장하고, 새 문의 알림은 Slack으로 받습니다. 알림에는 답변에 필요한 연락처(이메일·휴대폰 번호·인스타그램 계정 중 선택한 것)가 포함됩니다. [확인 필요]</p>' +
        '<h3>5. 파기 방법</h3><p>전자 파일은 복구할 수 없는 방법으로 삭제하고, 출력물은 분쇄하거나 소각합니다.</p>' +
        '<h3>6. 이용자의 권리</h3><p>이용자는 언제든 개인정보의 열람, 정정, 삭제, 처리 정지를 요청할 수 있으며, 회사는 지체 없이 조치합니다.</p>' +
        '<h3>7. 쿠키</h3><p>이 사이트는 방문 분석용 쿠키를 사용하지 않습니다.</p>' +
        '<h3>8. 개인정보 보호책임자</h3><p>오한나 · ' + MAIL + '</p>' +
        '<p class="p-date">' + EFFECTIVE + '</p>'
    },
    refund: {
      title: '환불 규정',
      body:
        '<h3>디지털 키트</h3><ul><li>환불은 구매일로부터 7일 이내에만 요청할 수 있습니다.</li><li>디지털 파일 특성상, 단순 변심으로는 환불되지 않습니다.</li><li>파일을 받지 못했거나, 파일이 손상되어 열리지 않거나, 상품 설명과 내용이 크게 다른 경우에는 재전송 또는 환불해 드립니다.</li></ul>' +
        '<h3>요청 방법</h3><p>' + MAIL + '로 구매 이메일, 주문 번호, 문제 내용을 보내주세요. 확인 후 1~2일 안에 답변드리며, 환불은 결제한 Gumroad를 통해 진행합니다.</p>' +
        '<h3>서비스</h3><p>월간 AI 마케팅 운영 등 서비스의 환불은 계약 시 별도로 정합니다.</p>' +
        '<p class="p-date">' + EFFECTIVE + '</p>'
    }
  };

  var dlg;
  function build() {
    dlg = document.createElement('dialog');
    dlg.className = 'p-modal';
    dlg.setAttribute('aria-labelledby', 'p-modal-title');
    dlg.innerHTML = '<div class="p-modal-head"><h2 id="p-modal-title"></h2><button type="button" class="p-modal-close" aria-label="닫기">×</button></div><div class="p-modal-body"></div>';
    document.body.appendChild(dlg);
    dlg.querySelector('.p-modal-close').addEventListener('click', function () { dlg.close(); });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
    dlg.addEventListener('close', function () { document.body.classList.remove('p-lock'); });
  }
  function open(key) {
    var doc = DOCS[key];
    if (!doc) return;
    if (!dlg) build();
    dlg.querySelector('#p-modal-title').textContent = doc.title;
    var body = dlg.querySelector('.p-modal-body');
    body.innerHTML = doc.body;
    body.scrollTop = 0;
    document.body.classList.add('p-lock');
    if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', '');
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('[data-policy]');
    if (!a) return;
    e.preventDefault();
    open(a.getAttribute('data-policy'));
  });
})();
