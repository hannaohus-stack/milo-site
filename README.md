# MILO — site

MILO 키트·서비스 소개 사이트 (정적 HTML/CSS/JS, 빌드 없음).
운영: CHAEUM KOREA Co., Ltd. · marketing@chaeum.cloud

## 페이지
| 경로 | 내용 |
| --- | --- |
| `index.html` | 메인 — 상품 모음 (AI TEAM KIT · AI BRANDING KIT · AI VISUAL KIT) |
| `ai-team/` | AI TEAM KIT 상세 |
| `ai-branding/` | AI BRANDING KIT 상세 |
| `service/` | 월간 AI 마케팅 운영 서비스 |
| `contact/` | 문의 폼 |

## 공용 파일
- `milo-tokens.css` — 디자인 토큰 (색·글꼴·버튼·태그)
- `home.css` — 메인·서비스·문의 공용 레이아웃
- `offer.css` — 상세페이지 가격 카드
- `policy.js` / `policy.css` — 이용약관 · 개인정보처리방침 · 환불 규정 팝업 (문안은 policy.js에서 수정)

## 로컬에서 보기
```bash
python3 -m http.server 8000
# http://localhost:8000
```

## 배포
GitHub Pages — `main` 브랜치 루트(`/`). 모든 링크는 상대 경로라 하위 경로(`/저장소이름/`)에서도 동작합니다.

## Coming Soon (정식 오픈 전 · 10/8 오픈 예정)
- `coming-soon/index.html` — 임시 페이지 (MILO + COMING SOON + 캐릭터 모션 + 오픈 알림 신청)
- `vercel.json` — `/`, 상품 상세, 서비스를 `/coming-soon/`으로 보내고 검색 노출을 막음. `/contact/`, `/api/`는 계속 열림
- 오픈 알림 신청 → `/api/notify` → Supabase `launch_waitlist` (같은 이메일은 1번만, Slack에는 건수만)

### 10/8 오픈할 때
1. `vercel.json`을 삭제(또는 redirects·headers를 비움) → commit · push
2. 확인: 판매 링크·가격(04) / 문의폼 저장·Slack / 개인정보처리방침 `[확인 필요]` 해소 / 인스타 프로필 링크
3. 오픈 알림 발송: Supabase `launch_waitlist`에서 이메일 목록 확인 → 발송 → `notified_at` 기록 (30일 뒤 자동 삭제)
