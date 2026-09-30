// MILO 오픈 알림 신청 API — Vercel 서버 함수 (POST /api/notify)
// 검증 → Supabase launch_waitlist 저장 (같은 이메일은 한 번만) → Slack 알림
// 환경 변수: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (필수) · SLACK_WEBHOOK_URL, IP_HASH_SALT (선택)
const crypto = require('crypto');

const RATE_LIMIT = { max: 5, minutes: 10 }; // 같은 IP 10분에 5건까지
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function supabase(path, init = {}) {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return fetch(`${process.env.SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', ...init.headers },
  });
}

async function tooMany(ipHash) {
  const since = new Date(Date.now() - RATE_LIMIT.minutes * 60e3).toISOString();
  const res = await supabase(`launch_waitlist?select=id&ip_hash=eq.${ipHash}&created_at=gte.${encodeURIComponent(since)}`, {
    method: 'HEAD', headers: { Prefer: 'count=exact' },
  });
  const total = Number((res.headers.get('content-range') || '').split('/')[1] || 0);
  return total >= RATE_LIMIT.max;
}

// Slack에는 이메일을 보내지 않고 신청 건수만 알림
async function notifySlack() {
  const url = process.env.SLACK_WEBHOOK_URL;
  if (!url) return;
  const res = await supabase('launch_waitlist?select=id', { method: 'HEAD', headers: { Prefer: 'count=exact' } });
  const total = (res.headers.get('content-range') || '').split('/')[1] || '?';
  await fetch(url, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: `*오픈 알림 신청 +1* — 누적 ${total}명` }),
  });
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ ok: false }); }
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('[notify] Supabase 환경 변수 없음');
    return res.status(500).json({ ok: false });
  }

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = null; } }
  if (!body || typeof body !== 'object' || JSON.stringify(body).length > 2000) return res.status(400).json({ ok: false, error: 'invalid' });

  if (body.website) return res.status(200).json({ ok: true }); // 스팸 방지 칸

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase().slice(0, 254) : '';
  if (!EMAIL_RE.test(email)) return res.status(400).json({ ok: false, error: 'invalid', field: '이메일' });
  if (body.agree_privacy !== true) return res.status(400).json({ ok: false, error: 'invalid', field: '개인정보 동의' });

  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  const row = {
    email,
    agree_privacy: true,
    source: typeof body.source === 'string' ? body.source.slice(0, 200) : null,
    ip_hash: crypto.createHash('sha256').update(`${process.env.IP_HASH_SALT || ''}${ip}`).digest('hex').slice(0, 32),
  };

  let isNew = false;
  try {
    if (await tooMany(row.ip_hash)) return res.status(429).json({ ok: false, error: 'rate_limited' });
    const saved = await supabase('launch_waitlist', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify(row) });
    if (saved.status === 409) {
      // 이미 신청한 이메일 — 같은 성공 화면을 보여줌
    } else if (!saved.ok) {
      console.error('[notify] 저장 실패', saved.status, await saved.text());
      return res.status(500).json({ ok: false });
    } else {
      isNew = true;
    }
  } catch (err) {
    console.error('[notify] 저장 오류', err);
    return res.status(500).json({ ok: false });
  }

  if (isNew) { try { await notifySlack(); } catch (err) { console.error('[notify] Slack 알림 실패', err); } }
  return res.status(200).json({ ok: true, new: isNew }); // new: 처음 저장된 이메일일 때만 true (메타 픽셀 Lead 기준)
};
