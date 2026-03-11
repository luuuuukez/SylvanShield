*** Settings ***
Library           RequestsLibrary
Resource          ../resources/variables.robot
Library           Collections

*** Test Cases ***

# ── send-alert Edge Function ────────────────────────────────

Valid Session Returns 200
    [Documentation]    send-alert with valid session_id returns HTTP 200
    ${headers}=    Create Dictionary
    ...    Content-Type=application/json
    ...    Authorization=Bearer ${ANON_KEY}
    ${body}=    Create Dictionary    session_id=${SESSION_ID}
    ${response}=    POST    ${EDGE_FUNC_URL}
    ...    json=${body}
    ...    headers=${headers}
    ...    expected_status=200
    Should Be Equal As Strings    ${response.status_code}    200

Invalid Session Returns Error
    [Documentation]    send-alert with fake session_id returns non-200
    ${headers}=    Create Dictionary
    ...    Content-Type=application/json
    ...    Authorization=Bearer ${ANON_KEY}
    ${body}=    Create Dictionary    session_id=fake-session-id
    ${response}=    POST    ${EDGE_FUNC_URL}
    ...    json=${body}
    ...    headers=${headers}
    ...    expected_status=any
    Should Not Be Equal As Strings    ${response.status_code}    200

Missing Session ID Returns Error
    [Documentation]    send-alert with no session_id returns non-200
    ${headers}=    Create Dictionary
    ...    Content-Type=application/json
    ...    Authorization=Bearer ${ANON_KEY}
    ${body}=    Create Dictionary
    ${response}=    POST    ${EDGE_FUNC_URL}
    ...    json=${body}
    ...    headers=${headers}
    ...    expected_status=any
    Should Not Be Equal As Strings    ${response.status_code}    200

# ── Open-Meteo Weather API ───────────────────────────────────

Weather API Returns 200
    [Documentation]    Open-Meteo returns 200 for valid coordinates
    ${params}=    Create Dictionary
    ...    latitude=63.0921
    ...    longitude=29.8034
    ...    current=temperature_2m,windspeed_10m,winddirection_10m,weathercode
    ${response}=    GET    ${WEATHER_URL}
    ...    params=${params}
    ...    expected_status=200
    Should Be Equal As Strings    ${response.status_code}    200

Weather API Response Contains Required Fields
    [Documentation]    Response has all fields the app uses
    ${params}=    Create Dictionary
    ...    latitude=63.0921
    ...    longitude=29.8034
    ...    current=temperature_2m,windspeed_10m,winddirection_10m,weathercode
    ${response}=    GET    ${WEATHER_URL}
    ...    params=${params}
    ...    expected_status=200
    ${current}=    Get From Dictionary    ${response.json()}    current
    Dictionary Should Contain Key    ${current}    temperature_2m
    Dictionary Should Contain Key    ${current}    windspeed_10m
    Dictionary Should Contain Key    ${current}    winddirection_10m
    Dictionary Should Contain Key    ${current}    weathercode