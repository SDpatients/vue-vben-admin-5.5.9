$ErrorActionPreference = 'Continue'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$BASE_URL = 'http://192.168.0.151:8080/api/v1'
$PASS = 0; $FAIL = 0; $TOTAL = 0; $SKIP = 0
$TIMESTAMP = Get-Date -Format 'yyyyMMddHHmmss'

function Test-Api {
    param([string]$Name, [bool]$Condition, [string]$Detail = '')
    $script:TOTAL++
    if ($Condition) {
        Write-Host "  [PASS] $Name $Detail" -ForegroundColor Green
        $script:PASS++
    } else {
        Write-Host "  [FAIL] $Name $Detail" -ForegroundColor Red
        $script:FAIL++
    }
}

Write-Host '============================================'
Write-Host '  PoGuanTong API Full Test'
Write-Host '  Time:' (Get-Date)
Write-Host '  Backend:' $BASE_URL
Write-Host '============================================'
Write-Host ''

# ===== 1. AUTH MODULE =====
Write-Host '===== MODULE 1: AUTH =====' -ForegroundColor Cyan

Write-Host '[1] Login' -ForegroundColor Yellow
$loginBody = '{"username":"admin","password":"123456"}'
$loginResp = Invoke-RestMethod -Uri "$BASE_URL/auth/login" -Method POST -ContentType 'application/json' -Body $loginBody -TimeoutSec 5
Test-Api 'Login' ($loginResp.code -eq 200 -and $loginResp.data.accessToken) "user=$($loginResp.data.username)"
$TOKEN = $loginResp.data.accessToken
$HEADERS = @{ Authorization = "Bearer $TOKEN" }

Write-Host '[2] Current User' -ForegroundColor Yellow
$r = Invoke-RestMethod -Uri "$BASE_URL/auth/current-user" -Method GET -Headers $HEADERS -TimeoutSec 5
Test-Api 'Current User' ($r.code -eq 200) "user=$($r.data.username)"

Write-Host '[3] Check Admin' -ForegroundColor Yellow
$r = Invoke-RestMethod -Uri "$BASE_URL/auth/check-admin" -Method GET -Headers $HEADERS -TimeoutSec 5
Test-Api 'Check Admin' ($r.code -eq 200) "isAdmin=$($r.data.isAdmin)"

# ===== 2. BANK ACCOUNT MODULE =====
Write-Host ''; Write-Host '===== MODULE 2: BANK ACCOUNT =====' -ForegroundColor Cyan

Write-Host '[4] List Bank Accounts' -ForegroundColor Yellow
$r = Invoke-RestMethod -Uri "$BASE_URL/bank-account/list?pageNum=1&pageSize=10" -Method GET -Headers $HEADERS -TimeoutSec 5
Test-Api 'List Bank Accounts' ($r.code -eq 200) "total=$($r.data.total)"

Write-Host '[5] Create Bank Account' -ForegroundColor Yellow
$uniqueAccount = "6222$TIMESTAMP"
$body = "{`"accountName`":`"APITest-$TIMESTAMP`",`"bankName`":`"ICBC`",`"accountNumber`":`"$uniqueAccount`",`"accountType`":`"BASIC`",`"currency`":`"CNY`",`"currentBalance`":100000.00,`"openingDate`":`"2024-01-01`",`"password`":`"123456`",`"caseId`":1}"
$r = Invoke-RestMethod -Uri "$BASE_URL/bank-account" -Method POST -ContentType 'application/json' -Headers $HEADERS -Body $body -TimeoutSec 5
Test-Api 'Create Bank Account' ($r.code -eq 200 -and $r.data.accountId) "id=$($r.data.accountId) resp=$($r.code)"
$ACCOUNT_ID = $r.data.accountId

Write-Host '[6] Get Bank Account Detail' -ForegroundColor Yellow
if ($ACCOUNT_ID) {
    $r = Invoke-RestMethod -Uri "$BASE_URL/bank-account/$ACCOUNT_ID" -Method GET -Headers $HEADERS -TimeoutSec 5
    Test-Api 'Get Detail' ($r.code -eq 200 -and $r.data.accountName) "name=$($r.data.accountName) balance=$($r.data.currentBalance)"
} else { Write-Host '  [SKIP]' -ForegroundColor DarkGray; $SKIP++ }

Write-Host '[7] Update Bank Account' -ForegroundColor Yellow
if ($ACCOUNT_ID) {
    $body = '{"accountName":"APITest-Updated","currentBalance":150000.00}'
    $r = Invoke-RestMethod -Uri "$BASE_URL/bank-account/$ACCOUNT_ID" -Method PUT -ContentType 'application/json' -Headers $HEADERS -Body $body -TimeoutSec 5
    Test-Api 'Update Account' ($r.code -eq 200) "resp=$($r.code)"
} else { Write-Host '  [SKIP]' -ForegroundColor DarkGray; $SKIP++ }

Write-Host '[8] Change Password' -ForegroundColor Yellow
if ($ACCOUNT_ID) {
    $body = '{"oldPassword":"123456","newPassword":"654321"}'
    $r = Invoke-RestMethod -Uri "$BASE_URL/bank-account/$ACCOUNT_ID/password" -Method PUT -ContentType 'application/json' -Headers $HEADERS -Body $body -TimeoutSec 5
    Test-Api 'Change Password' ($r.code -eq 200)
} else { Write-Host '  [SKIP]' -ForegroundColor DarkGray; $SKIP++ }

Write-Host '[9] Update Status' -ForegroundColor Yellow
if ($ACCOUNT_ID) {
    $body = '{"status":"INACTIVE"}'
    $r = Invoke-RestMethod -Uri "$BASE_URL/bank-account/$ACCOUNT_ID/status" -Method PUT -ContentType 'application/json' -Headers $HEADERS -Body $body -TimeoutSec 5
    Test-Api 'Set INACTIVE' ($r.code -eq 200)
    # Restore
    $body2 = '{"status":"ACTIVE"}'
    Invoke-RestMethod -Uri "$BASE_URL/bank-account/$ACCOUNT_ID/status" -Method PUT -ContentType 'application/json' -Headers $HEADERS -Body $body2 -TimeoutSec 5 | Out-Null
} else { Write-Host '  [SKIP]' -ForegroundColor DarkGray; $SKIP++ }

Write-Host '[10] Get With Transactions' -ForegroundColor Yellow
if ($ACCOUNT_ID) {
    $r = Invoke-RestMethod -Uri "$BASE_URL/bank-account/$ACCOUNT_ID/with-transactions" -Method GET -Headers $HEADERS -TimeoutSec 5
    $txCount = 0; if ($r.data.transactions) { $txCount = @($r.data.transactions).Count }
    Test-Api 'With Transactions' ($r.code -eq 200) "txCount=$txCount inflow=$($r.data.totalInflow) outflow=$($r.data.totalOutflow)"
} else { Write-Host '  [SKIP]' -ForegroundColor DarkGray; $SKIP++ }

# ===== 3. TRANSACTION MODULE =====
Write-Host ''; Write-Host '===== MODULE 3: BANK TRANSACTION =====' -ForegroundColor Cyan

Write-Host '[11] List Transactions' -ForegroundColor Yellow
$r = Invoke-RestMethod -Uri "$BASE_URL/bank-account-transaction/list?pageNum=1&pageSize=10" -Method GET -Headers $HEADERS -TimeoutSec 5
Test-Api 'List Transactions' ($r.code -eq 200) "total=$($r.data.total)"

Write-Host '[12] Create Transaction' -ForegroundColor Yellow
if ($ACCOUNT_ID) {
    $body = "{`"accountId`":$ACCOUNT_ID,`"transactionType`":`"IN`",`"amount`":50000.00,`"transactionDate`":`"2024-01-15`",`"summary`":`"APITest-Income`",`"businessType`":`"PAYMENT`",`"counterpartyAccount`":`"6222029876543210987`",`"counterpartyName`":`"TestCo`",`"balanceAfter`":150000.00,`"remark`":`"APITest`",`"caseId`":1}"
    $r = Invoke-RestMethod -Uri "$BASE_URL/bank-account-transaction" -Method POST -ContentType 'application/json' -Headers $HEADERS -Body $body -TimeoutSec 5
    Test-Api 'Create Transaction' ($r.code -eq 200 -and $r.data.transactionId) "id=$($r.data.transactionId)"
    $TX_ID = $r.data.transactionId
} else { Write-Host '  [SKIP]' -ForegroundColor DarkGray; $SKIP++ }

Write-Host '[13] Get Transaction Detail' -ForegroundColor Yellow
if ($TX_ID) {
    $r = Invoke-RestMethod -Uri "$BASE_URL/bank-account-transaction/$TX_ID" -Method GET -Headers $HEADERS -TimeoutSec 5
    Test-Api 'Get Detail' ($r.code -eq 200) "type=$($r.data.transactionType) amount=$($r.data.amount)"
} else { Write-Host '  [SKIP]' -ForegroundColor DarkGray; $SKIP++ }

Write-Host '[14] Update Transaction' -ForegroundColor Yellow
if ($TX_ID) {
    $body = '{"transactionType":"IN","amount":60000.00,"transactionDate":"2024-01-15","summary":"APITest-Updated"}'
    $r = Invoke-RestMethod -Uri "$BASE_URL/bank-account-transaction/$TX_ID" -Method PUT -ContentType 'application/json' -Headers $HEADERS -Body $body -TimeoutSec 5
    Test-Api 'Update Transaction' ($r.code -eq 200)
} else { Write-Host '  [SKIP]' -ForegroundColor DarkGray; $SKIP++ }

Write-Host '[15] Get Account Transactions' -ForegroundColor Yellow
if ($ACCOUNT_ID) {
    $r = Invoke-RestMethod -Uri "$BASE_URL/bank-account/$ACCOUNT_ID/transactions?pageNum=1&pageSize=10" -Method GET -Headers $HEADERS -TimeoutSec 5
    Test-Api 'Account Transactions' ($r.code -eq 200) "total=$($r.data.total)"
} else { Write-Host '  [SKIP]' -ForegroundColor DarkGray; $SKIP++ }

# ===== 4. CASE MODULE =====
Write-Host ''; Write-Host '===== MODULE 4: CASE =====' -ForegroundColor Cyan

Write-Host '[16] List Cases' -ForegroundColor Yellow
$r = Invoke-RestMethod -Uri "$BASE_URL/case/list?pageNum=1&pageSize=10" -Method GET -Headers $HEADERS -TimeoutSec 5
Test-Api 'List Cases' ($r.code -eq 200) "total=$($r.data.total)"
$FIRST_CASE_ID = $null
if ($r.data.list -and @($r.data.list).Count -gt 0) { $FIRST_CASE_ID = $r.data.list[0].id }

Write-Host '[17] Get Case Detail' -ForegroundColor Yellow
if ($FIRST_CASE_ID) {
    $r = Invoke-RestMethod -Uri "$BASE_URL/case/$FIRST_CASE_ID" -Method GET -Headers $HEADERS -TimeoutSec 5
    Test-Api 'Case Detail' ($r.code -eq 200) "name=$($r.data.caseName)"
} else { Write-Host '  [SKIP]' -ForegroundColor DarkGray; $SKIP++ }

Write-Host '[18] My Case Stats' -ForegroundColor Yellow
$r = Invoke-RestMethod -Uri "$BASE_URL/case/my-stats" -Method GET -Headers $HEADERS -TimeoutSec 5
Test-Api 'My Stats' ($r.code -eq 200) "total=$($r.data.totalCases) inProgress=$($r.data.inProgressCases)"

# ===== 5. CREDITOR MODULE =====
Write-Host ''; Write-Host '===== MODULE 5: CREDITOR =====' -ForegroundColor Cyan

Write-Host '[19] List Creditors' -ForegroundColor Yellow
$r = Invoke-RestMethod -Uri "$BASE_URL/creditor/list?pageNum=1&pageSize=10" -Method GET -Headers $HEADERS -TimeoutSec 5
Test-Api 'List Creditors' ($r.code -eq 200) "total=$($r.data.total)"

# ===== 6. DEBTOR MODULE =====
Write-Host ''; Write-Host '===== MODULE 6: DEBTOR =====' -ForegroundColor Cyan

Write-Host '[20] List Debtors' -ForegroundColor Yellow
$r = Invoke-RestMethod -Uri "$BASE_URL/debtor/list?pageNum=1&pageSize=10" -Method GET -Headers $HEADERS -TimeoutSec 5
Test-Api 'List Debtors' ($r.code -eq 200) "total=$($r.data.total)"

# ===== 7. COURT MODULE =====
Write-Host ''; Write-Host '===== MODULE 7: COURT =====' -ForegroundColor Cyan

Write-Host '[21] List Courts' -ForegroundColor Yellow
$r = Invoke-RestMethod -Uri "$BASE_URL/court/list?pageNum=1&pageSize=10" -Method GET -Headers $HEADERS -TimeoutSec 5
Test-Api 'List Courts' ($r.code -eq 200) "total=$($r.data.total)"

# ===== 8. NOTIFICATION MODULE =====
Write-Host ''; Write-Host '===== MODULE 8: NOTIFICATION =====' -ForegroundColor Cyan

Write-Host '[22] List Notifications' -ForegroundColor Yellow
$r = Invoke-RestMethod -Uri "$BASE_URL/notification/list?pageNum=1&pageSize=10" -Method GET -Headers $HEADERS -TimeoutSec 5
Test-Api 'List Notifications' ($r.code -eq 200)

Write-Host '[23] Unread Count' -ForegroundColor Yellow
$r = Invoke-RestMethod -Uri "$BASE_URL/notification/count/unread" -Method GET -Headers $HEADERS -TimeoutSec 5
Test-Api 'Unread Count' ($r.code -eq 200) "count=$($r.data)"

# ===== 9. TODO MODULE =====
Write-Host ''; Write-Host '===== MODULE 9: TODO =====' -ForegroundColor Cyan

Write-Host '[24] List Todos' -ForegroundColor Yellow
$r = Invoke-RestMethod -Uri "$BASE_URL/todo/list?userId=1&pageNum=1&pageSize=10" -Method GET -Headers $HEADERS -TimeoutSec 5
Test-Api 'List Todos' ($r.code -eq 200)

Write-Host '[25] Pending Count' -ForegroundColor Yellow
$r = Invoke-RestMethod -Uri "$BASE_URL/todo/count/pending?userId=1" -Method GET -Headers $HEADERS -TimeoutSec 5
Test-Api 'Pending Count' ($r.code -eq 200) "count=$($r.data)"

# ===== 10. WORK LOG MODULE =====
Write-Host ''; Write-Host '===== MODULE 10: WORK LOG =====' -ForegroundColor Cyan

Write-Host '[26] List Work Logs' -ForegroundColor Yellow
$r = Invoke-RestMethod -Uri "$BASE_URL/work-log/list?pageNum=1&pageSize=10" -Method GET -Headers $HEADERS -TimeoutSec 5
Test-Api 'List Work Logs' ($r.code -eq 200) "total=$($r.data.total)"

# ===== 11. WORK TEAM MODULE =====
Write-Host ''; Write-Host '===== MODULE 11: WORK TEAM =====' -ForegroundColor Cyan

Write-Host '[27] List Work Teams' -ForegroundColor Yellow
$r = Invoke-RestMethod -Uri "$BASE_URL/work-team/list?pageNum=1&pageSize=10" -Method GET -Headers $HEADERS -TimeoutSec 5
Test-Api 'List Work Teams' ($r.code -eq 200) "total=$($r.data.total)"

# ===== 12. ANNOUNCEMENT MODULE =====
Write-Host ''; Write-Host '===== MODULE 12: ANNOUNCEMENT =====' -ForegroundColor Cyan

Write-Host '[28] List Announcements' -ForegroundColor Yellow
$r = Invoke-RestMethod -Uri "$BASE_URL/case-announcement/list?pageNum=1&pageSize=10" -Method GET -Headers $HEADERS -TimeoutSec 5
Test-Api 'List Announcements' ($r.code -eq 200) "total=$($r.data.total)"

# ===== 13. EXPENSE REIMBURSEMENT MODULE =====
Write-Host ''; Write-Host '===== MODULE 13: EXPENSE =====' -ForegroundColor Cyan

Write-Host '[29] List Expenses' -ForegroundColor Yellow
$r = Invoke-RestMethod -Uri "$BASE_URL/expense-reimbursement?page=1&size=10" -Method GET -Headers $HEADERS -TimeoutSec 5
Test-Api 'List Expenses' ($r.code -eq 200)

# ===== 14. PROCESS MODULE =====
Write-Host ''; Write-Host '===== MODULE 14: PROCESS =====' -ForegroundColor Cyan

Write-Host '[30] List Case Tasks' -ForegroundColor Yellow
if ($FIRST_CASE_ID) {
    $r = Invoke-RestMethod -Uri "$BASE_URL/case-tasks?caseId=$FIRST_CASE_ID&page=0&size=10" -Method GET -Headers $HEADERS -TimeoutSec 5
    Test-Api 'List Case Tasks' ($r.code -eq 200) "total=$($r.data.totalElements)"
} else { Write-Host '  [SKIP]' -ForegroundColor DarkGray; $SKIP++ }

# ===== 15. PROCESS STAGE MODULE =====
Write-Host ''; Write-Host '===== MODULE 15: PROCESS STAGE =====' -ForegroundColor Cyan

Write-Host '[31] Get Case Stage Data' -ForegroundColor Yellow
if ($FIRST_CASE_ID) {
    $r = Invoke-RestMethod -Uri "$BASE_URL/case-process-stage/case/$FIRST_CASE_ID" -Method GET -Headers $HEADERS -TimeoutSec 5
    Test-Api 'Case Stage Data' ($r.code -eq 200)
} else { Write-Host '  [SKIP]' -ForegroundColor DarkGray; $SKIP++ }

# ===== CLEANUP =====
Write-Host ''; Write-Host '===== CLEANUP =====' -ForegroundColor Cyan
Write-Host '[32] Delete Test Data' -ForegroundColor Yellow
$TOTAL++; $cleanupOk = 0
if ($TX_ID) {
    try { $r = Invoke-RestMethod -Uri "$BASE_URL/bank-account-transaction/$TX_ID" -Method DELETE -Headers $HEADERS -TimeoutSec 5; if ($r.code -eq 200) { $cleanupOk++ } } catch {}
}
if ($ACCOUNT_ID) {
    try { Invoke-RestMethod -Uri "$BASE_URL/bank-account/$ACCOUNT_ID/status" -Method PUT -ContentType 'application/json' -Headers $HEADERS -Body '{"status":"ACTIVE"}' -TimeoutSec 5 | Out-Null } catch {}
    try { $r = Invoke-RestMethod -Uri "$BASE_URL/bank-account/$ACCOUNT_ID" -Method DELETE -Headers $HEADERS -TimeoutSec 5; if ($r.code -eq 200) { $cleanupOk++ } } catch {}
}
if ($cleanupOk -ge 1) { Write-Host '  [PASS] Cleanup done' -ForegroundColor Green; $PASS++ }
else { Write-Host '  [FAIL] Cleanup failed' -ForegroundColor Red; $FAIL++ }

# ===== SUMMARY =====
Write-Host ''
Write-Host '============================================'
Write-Host '  TEST SUMMARY'
Write-Host '============================================'
Write-Host "  Total: $TOTAL"
Write-Host "  Pass:  $PASS" -ForegroundColor Green
Write-Host "  Fail:  $FAIL" -ForegroundColor Red
Write-Host "  Skip:  $SKIP" -ForegroundColor DarkGray
if ($TOTAL -gt 0) {
    $rate = [math]::Round($PASS/$TOTAL*100, 1)
    Write-Host "  Rate:  $rate%" -ForegroundColor $(if($rate -ge 80){'Green'}elseif($rate -ge 50){'Yellow'}else{'Red'})
}
Write-Host '============================================'
