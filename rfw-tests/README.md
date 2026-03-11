# SylvanShield – Robot Framework API Tests

API test suite for SylvanShield backend services using Robot Framework.

## Setup
```bash
pip install robotframework
pip install robotframework-requests
```

## Configuration

Copy `resources/variables.robot.example` to `resources/variables.robot` and fill in:
- `ANON_KEY` — Supabase anon key
- `SESSION_ID` — a valid active work session ID for testing

## Run
```bash
cd rfw-tests
robot --outputdir results tests/api_tests.robot
```

## Test Coverage

| Suite | Cases | Coverage |
|-------|-------|----------|
| send-alert Edge Function | 3 | Valid session, invalid session, missing session_id |
| Open-Meteo Weather API | 2 | HTTP 200, required fields present |
