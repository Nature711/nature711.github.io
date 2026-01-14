---
title:
draft: true
tags:
date:
---
## Step 1 — Redis-backed session store (correctness only)

**End goal:** login returns session token; TCP stores `sess:<token> -> username` with TTL; HTTP stores token in cookie.

```text
# Iter3-Step1: Redis session store (sess:<token>) + login returns token

Implement ONLY:
1) Protobuf:
- Extend LoginResponse to include `session_token` on success.

2) TCP server:
- Add Redis client wiring (REDIS_ADDR required for sessions).
- Implement session store in Redis:
  - Key: sess:<token> -> username
  - TTL: SESSION_TTL
- On successful login: create session in Redis and return token.

3) HTTP server:
- On login success: set HttpOnly cookie `session_token=<token>` (Path=/).
- For now, no other endpoints changed.

4) Config:
- Add REDIS_ADDR and SESSION_TTL (duration).
- Sessions must work regardless of any cache flags (since password cache is removed).

Acceptance:
- Successful login sets cookie and Redis contains sess:<token> with TTL.
- Invalid login returns no token and no session stored.
- `go test ./...` passes.

Do NOT:
- Add profile edit operations yet
- Add minimal UI pages yet (unless already present)
```

> [!info] Takeaway
> The session token is a random identifier returned only after successful authentication. By storing `sess:<token> -> username` with TTL in Redis, the TCP server can later authorize profile updates without re-checking the password, while automatic expiration replaces logout. The HTTP layer simply stores the token in an HttpOnly cookie so browsers can carry the login state across requests without exposing it to client-side code.

---

## Step 2 — Add TCP GetProfile by session token

**End goal:** given a session token, TCP returns current profile (username, nickname, avatar_ref). Needed for `/profile` page later.

```text
# Iter3-Step2: TCP GetProfile(session_token) operation

Implement ONLY:
- Extend protobuf with:
  - GetProfileRequest { string session_token; }
  - GetProfileResponse { bool success; string username; string nickname; string avatar_ref; string error_message; }
- TCP handler:
  - Validate session_token via Redis -> username
  - Query MySQL by username to fetch nickname/avatar_ref
  - Return profile response

Acceptance:
- With valid cookie token (manually extracted), a test client or simple HTTP forwarding can fetch profile.
- Invalid/expired token returns auth error.
- `go test ./...` passes.

Do NOT:
- Add update nickname/avatar yet
- Add UI pages yet
```

---

## Step 3 — Add TCP UpdateNickname (session-required)

**End goal:** update nickname only if token valid; UTF-8 safe; MySQL update.

```text
# Iter3-Step3: TCP UpdateNickname(session_token, nickname)

Implement ONLY:
- Extend protobuf with:
  - UpdateNicknameRequest { string session_token; string nickname; }
  - UpdateNicknameResponse { bool success; string error_message; }
- TCP handler:
  - Validate session_token -> username (Redis)
  - Validate nickname basic bounds (non-empty, max length by rune count)
  - Update MySQL: set nickname where username=?
- Keep errors as valid protobuf responses.

Acceptance:
- Nickname updated in MySQL for logged-in user.
- Invalid token -> auth error.
- `go test ./...` passes.

Do NOT:
- Implement avatar upload yet
- Implement HTTP endpoints yet
```

---

## Step 4 — Add TCP UpdateAvatarRef (session-required)

**End goal:** update avatar reference string (no file upload yet).

```text
# Iter3-Step4: TCP UpdateAvatarRef(session_token, avatar_ref)

Implement ONLY:
- Extend protobuf with:
  - UpdateAvatarRequest { string session_token; string avatar_ref; }
  - UpdateAvatarResponse { bool success; string error_message; }
- TCP handler:
  - Validate session_token -> username
  - Validate avatar_ref basic bounds
  - Update MySQL: set avatar_ref where username=?

Acceptance:
- Avatar_ref updated in MySQL for logged-in user.
- `go test ./...` passes.

Do NOT:
- Implement multipart upload yet
- Implement HTTP endpoints yet
```

---

## Step 5 — HTTP endpoints to forward profile ops (API first)

**End goal:** thin HTTP endpoints that read cookie token and call TCP ops.

Endpoints:

- `GET /profile` (JSON for now) → calls `GetProfile`
    
- `POST /profile/nickname` → calls `UpdateNickname`
    
- `POST /profile/avatar-ref` → calls `UpdateAvatar` with provided ref (temporary)
    

```text
# Iter3-Step5: HTTP forwarding endpoints for profile ops (no HTML UI yet)

Implement ONLY:
- Add HTTP endpoints that:
  - Read HttpOnly cookie `session_token`
  - Forward requests to TCP using protobuf framing
- Endpoints:
  - GET /profile -> returns JSON profile
  - POST /profile/nickname (form or JSON) -> update nickname
  - POST /profile/avatar-ref (form or JSON) -> update avatar_ref (temporary)

Acceptance:
- After login, GET /profile returns current user profile.
- POST update nickname works via cookie token.
- `go test ./...` passes.

Do NOT:
- Implement multipart upload yet
- Implement HTML pages yet
```

---

## Step 6 — Multipart avatar upload + static serving

**End goal:** real picture upload from browser; stored on disk; served back; TCP stores `avatar_ref` URL path.

```text
# Iter3-Step6: Avatar multipart upload + static serving

Implement ONLY:
- Replace/extend avatar update to support multipart:
  - POST /profile/avatar accepts multipart file upload
  - Enforce max upload size
  - Save file to ./data/avatars/
  - Create avatar_ref as URL path: /static/avatars/<filename>
  - Call TCP UpdateAvatar(session_token, avatar_ref)
- Add static handler:
  - GET /static/avatars/* serves from ./data/avatars

Acceptance:
- Uploading an image updates DB avatar_ref and the image is accessible via the returned URL.
- Oversized upload rejected.
- `go test ./...` passes.

Do NOT:
- Store image bytes in MySQL
- Add image processing
```

> “This step enables real profile picture upload by handling multipart file upload at the HTTP layer, storing the file locally, and persisting only a URL reference in the core service, keeping the TCP protocol lightweight and scalable.”

---

## Step 7 — Minimal HTML UI (login + profile page)

**End goal:** “users can login on web page” + edit profile easily.

Pages:

- `GET /` login form
    
- `GET /profile` HTML page showing username/nickname/avatar + edit forms

```text
# Iter3-Step7: Minimal HTML UI pages (no JS, no styling)

Implement ONLY:
- Add minimal HTML templates:
  - GET / : login page (POST /login)
  - GET /profile : show username, nickname, avatar image + forms:
    - update nickname (POST /profile/nickname)
    - upload avatar (POST /profile/avatar)
- On login success: set cookie and redirect to /profile.
- /profile handler should call TCP GetProfile using cookie token.

Acceptance:
- Full flow works in browser:
  - login -> profile page -> update nickname -> upload avatar -> see updated values.
- No logout required.

Do NOT:
- Add frontend frameworks
- Add extra features beyond requirements
```


