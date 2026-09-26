// MILO 문의폼 저장 API — Vercel 서버 함수 (POST /api/contact)
// 검증 → Supabase contact_inquiries 저장 → Slack 알림
// 환경 변수: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (필수) · SLACK_WEBHOOK_URL, IP_HASH_SALT (선택)
const crypto = require('crypto');

const TYPES = ['purchase', 'support', 'service', 'partner', 'etc'];
const TYPE_LABEL = { purchase: '제품 구매 문의', support: '설치·사용 도움', service: '서비스 상담', partner: '협업·강의 제안', etc: '기타' };
const PRODUCTS = ['ai-team', 'ai-branding', 'ai-visual'];
const INDUSTRIES = ['카페·베이커리', '음식점·반찬·밀키트', '뷰티·네일·헤어', '공방·핸드메이드', '온라인 쇼핑몰·스마트스토어', '교육·강의·1인 브랜드', '기타'];
const AI_LEVELS = ['none', 'sometimes', 'often'];
const REPLY_VIA = { email: '이메일', phone: '문자·전화', dm: '인스타그램 DM' };
const RATE_LIMIT = { max: 5, minutes: 10 }; // 같은 IP 10분에 5건까지

const str = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

function validate(b) {
  const d = {
    type: str(b.type, 20),
    products: (Array.isArray(b.products) ? b.products : []).filter((p) => PRODUCTS.includes(p)),
    order_ref: str(b.order, 200) || null,
    name: str(b.name, 100),
    brand: str(b.brand, 100) || null,
    industry: str(b.industry, 50),
    insta: str(b.insta, 100) || null,
    ai_level: AI_LEVELS.includes(b.ai_level) ? b.ai_level : null,
    message: str(b.message, 1500),
    reply_via: str(b.reply_via, 10),
    email: str(b.email, 254) || null,
    phone: str(b.phone, 20) || null,
    agree_privacy: b.agree_privacy === true,
    agree_marketing: b.agree_marketing === true,
    page: str(b.page, 200) || null,
  };
  if (!TYPES.includes(d.type)) return '문의 유형';
  if (!d.name) return '이름';
  if (!INDUSTRIES.includes(d.industry)) return '업종';
  if (d.message.length < 5) return '문의 내용';
  if (!REPLY_VIA[d.reply_via]) return '답변 방법';
  if (d.reply_via === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email || '')) return '이메일';
  if (d.reply_via === 'phone' && !/^01\d-?\d{3,4}-?\d{4}$/.test(d.phone || '')) return '휴대폰 번호';
  if (d.reply_via === 'dm' && !d.insta) return '인스타그램 계정';
  if (!d.agree_privacy) return '개인정보 동의';
  // 답변 방법과 관계없는 연락처·주문번호는 저장하지 않음
  if (d.reply_via !== 'email') d.email = null;
  if (d.reply_via !== 'phone') d.phone = null;
  if (d.type !== 'support') d.order_ref = null;
  if (!['purchase', 'support'].includes(d.type)) d.products = [];
  return d;
}

function supabase(path, init = {}) {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return fetch(`${process.env.SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', ...init.headers },
  });
}

async function tooMany(ipHash) {
  const since = new Date(Date.now() - RATE_LIMIT.minutes * 60e3).toISOString();
  const res = await supabase(`contact_inquiries?select=id&ip_hash=eq.${ipHash}&created_at=gte.${encodeURIComponent(since)}`, {
    method: 'HEAD', headers: { Prefer: 'count=exact' },
  });
  const total = Number((res.headers.get('content-range') || '').split('/')[1] || 0);
  return total >= RATE_LIMIT.max;
}

// Slack에는 연락처(이메일·휴대폰)를 보내지 않음 — 확인은 Supabase에서
async function notifySlack(d) {
  const url = process.env.SLACK_WEBHOOK_URL;
  if (!url) return;
  const who = [d.name, d.brand].filter(Boolean).join(' · ');
  const excerpt = d.message.length > 200 ? `${d.message.slice(0, 200)}…` : d.message;
  const text = [
    `*새 문의* — ${TYPE_LABEL[d.type]}`,
    `${who} / ${d.industry} / 답변: ${REPLY_VIA[d.reply_via]}`,
    d.products.length ? `제품: ${d.products.join(', ')}` : '',
    `> ${excerpt.replace(/\n/g, '\n> ')}`,
    `<https://supabase.com/dashboard/project/vftsleppwizrkgcvbsmn/editor|Supabase에서 보기>`,
  ].filter(Boolean).join('\n');
  await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }) });
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ ok: false }); }
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('[contact] Supabase 환경 변수 없음');
    return res.status(500).json({ ok: false });
  }

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = null; } }
  if (!body || typeof body !== 'object' || JSON.stringify(body).length > 10000) return res.status(400).json({ ok: false, error: 'invalid' });

  if (body.website) return res.status(200).json({ ok: true }); // 스팸 방지 칸이 채워지면 저장 없이 성공처럼 응답

  const d = validate(body);
  if (typeof d === 'string') return res.status(400).json({ ok: false, error: 'invalid', field: d });

  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  d.ip_hash = crypto.createHash('sha256').update(`${process.env.IP_HASH_SALT || ''}${ip}`).digest('hex').slice(0, 32);

  try {
    if (await tooMany(d.ip_hash)) return res.status(429).json({ ok: false, error: 'rate_limited' });

    const saved = await supabase('contact_inquiries', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify(d) });
    if (!saved.ok) {
      console.error('[contact] 저장 실패', saved.status, await saved.text());
      return res.status(500).json({ ok: false });
    }
  } catch (err) {
    console.error('[contact] 저장 오류', err);
    return res.status(500).json({ ok: false });
  }

  try { await notifySlack(d); } catch (err) { console.error('[contact] Slack 알림 실패', err); }
  return res.status(200).json({ ok: true });
};
