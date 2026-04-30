@echo off
chcp 65001 >nul 2>&1
setlocal enabledelayedexpansion

set BASE_URL=http://192.168.0.151:8080/api/v1
set PASS=0
set FAIL=0
set TOTAL=0

echo ============================================
echo   破管通 API 接口全面测试
echo   测试时间: %date% %time%
echo   后端地址: %BASE_URL%
echo ============================================
echo.

echo [1/14] 测试认证模块 - 登录
set /a TOTAL+=1
curl -s --connect-timeout 5 -X POST "%BASE_URL%/auth/login" -H "Content-Type: application/json" -d '{"username":"admin","password":"123456"}' > temp_login.json 2>&1
findstr /C:"accessToken" temp_login.json >nul 2>&1
if %errorlevel%==0 (
    echo   [PASS] 登录成功
    set /a PASS+=1
    for /f "tokens=2 delims=:" %%a in ('type temp_login.json ^| findstr /C:"accessToken"') do set TOKEN_PART=%%a
) else (
    echo   [FAIL] 登录失败
    set /a FAIL+=1
)

for /f "delims=" %%i in ('powershell -Command "(Get-Content temp_login.json | ConvertFrom-Json).data.accessToken"') do set TOKEN=%%i
echo   TOKEN: !TOKEN:~0,30!...

echo.
echo [2/14] 测试认证模块 - 获取当前用户信息
set /a TOTAL+=1
curl -s --connect-timeout 5 -X GET "%BASE_URL%/auth/current-user" -H "Authorization: Bearer %TOKEN%" > temp_user.json 2>&1
findstr /C:"username" temp_user.json >nul 2>&1
if %errorlevel%==0 (
    echo   [PASS] 获取用户信息成功
    set /a PASS+=1
) else (
    echo   [FAIL] 获取用户信息失败
    set /a FAIL+=1
)

echo.
echo [3/14] 测试银行账户模块 - 获取账户列表
set /a TOTAL+=1
curl -s --connect-timeout 5 -X GET "%BASE_URL%/bank-account/list?pageNum=1&pageSize=10" -H "Authorization: Bearer %TOKEN%" > temp_bank_list.json 2>&1
findstr /C:"code" temp_bank_list.json >nul 2>&1
if %errorlevel%==0 (
    echo   [PASS] 获取银行账户列表成功
    set /a PASS+=1
    type temp_bank_list.json
    echo.
) else (
    echo   [FAIL] 获取银行账户列表失败
    set /a FAIL+=1
)

echo.
echo [4/14] 测试银行账户模块 - 创建银行账户
set /a TOTAL+=1
curl -s --connect-timeout 5 -X POST "%BASE_URL%/bank-account" -H "Authorization: Bearer %TOKEN%" -H "Content-Type: application/json" -d '{"accountName":"测试账户","bankName":"中国工商银行","accountNumber":"6222021234567890123","accountType":"BASIC","currency":"CNY","currentBalance":100000.00,"openingDate":"2024-01-01","password":"123456","caseId":1}' > temp_bank_create.json 2>&1
findstr /C:"accountId" temp_bank_create.json >nul 2>&1
if %errorlevel%==0 (
    echo   [PASS] 创建银行账户成功
    set /a PASS+=1
    for /f "delims=" %%i in ('powershell -Command "(Get-Content temp_bank_create.json | ConvertFrom-Json).data.accountId"') do set ACCOUNT_ID=%%i
    echo   新账户ID: %ACCOUNT_ID%
) else (
    echo   [FAIL] 创建银行账户失败
    set /a FAIL+=1
    type temp_bank_create.json
)

echo.
echo [5/14] 测试银行账户模块 - 获取账户详情
set /a TOTAL+=1
if defined ACCOUNT_ID (
    curl -s --connect-timeout 5 -X GET "%BASE_URL%/bank-account/%ACCOUNT_ID%" -H "Authorization: Bearer %TOKEN%" > temp_bank_detail.json 2>&1
    findstr /C:"accountName" temp_bank_detail.json >nul 2>&1
    if %errorlevel%==0 (
        echo   [PASS] 获取账户详情成功
        set /a PASS+=1
    ) else (
        echo   [FAIL] 获取账户详情失败
        set /a FAIL+=1
    )
) else (
    echo   [SKIP] 无账户ID，跳过
    set /a TOTAL-=1
)

echo.
echo [6/14] 测试银行账户模块 - 更新账户信息
set /a TOTAL+=1
if defined ACCOUNT_ID (
    curl -s --connect-timeout 5 -X PUT "%BASE_URL%/bank-account/%ACCOUNT_ID%" -H "Authorization: Bearer %TOKEN%" -H "Content-Type: application/json" -d '{"accountName":"测试账户（已更新）","currentBalance":150000.00}' > temp_bank_update.json 2>&1
    findstr /C:"200" temp_bank_update.json >nul 2>&1
    if %errorlevel%==0 (
        echo   [PASS] 更新账户信息成功
        set /a PASS+=1
    ) else (
        echo   [FAIL] 更新账户信息失败
        set /a FAIL+=1
        type temp_bank_update.json
    )
) else (
    echo   [SKIP] 无账户ID，跳过
    set /a TOTAL-=1
)

echo.
echo [7/14] 测试银行账户模块 - 修改账户密码
set /a TOTAL+=1
if defined ACCOUNT_ID (
    curl -s --connect-timeout 5 -X PUT "%BASE_URL%/bank-account/%ACCOUNT_ID%/password" -H "Authorization: Bearer %TOKEN%" -H "Content-Type: application/json" -d '{"oldPassword":"123456","newPassword":"654321"}' > temp_bank_pwd.json 2>&1
    findstr /C:"200" temp_bank_pwd.json >nul 2>&1
    if %errorlevel%==0 (
        echo   [PASS] 修改账户密码成功
        set /a PASS+=1
    ) else (
        echo   [FAIL] 修改账户密码失败
        set /a FAIL+=1
        type temp_bank_pwd.json
    )
) else (
    echo   [SKIP] 无账户ID，跳过
    set /a TOTAL-=1
)

echo.
echo [8/14] 测试银行账户模块 - 账户状态管理
set /a TOTAL+=1
if defined ACCOUNT_ID (
    curl -s --connect-timeout 5 -X PUT "%BASE_URL%/bank-account/%ACCOUNT_ID%/status" -H "Authorization: Bearer %TOKEN%" -H "Content-Type: application/json" -d '{"status":"INACTIVE"}' > temp_bank_status.json 2>&1
    findstr /C:"200" temp_bank_status.json >nul 2>&1
    if %errorlevel%==0 (
        echo   [PASS] 账户状态管理成功
        set /a PASS+=1
    ) else (
        echo   [FAIL] 账户状态管理失败
        set /a FAIL+=1
    )
) else (
    echo   [SKIP] 无账户ID，跳过
    set /a TOTAL-=1
)

echo.
echo [9/14] 测试银行账户模块 - 获取账户及全部交易
set /a TOTAL+=1
if defined ACCOUNT_ID (
    curl -s --connect-timeout 5 -X GET "%BASE_URL%/bank-account/%ACCOUNT_ID%/with-transactions" -H "Authorization: Bearer %TOKEN%" > temp_bank_with_tx.json 2>&1
    findstr /C:"totalInflow" temp_bank_with_tx.json >nul 2>&1
    if %errorlevel%==0 (
        echo   [PASS] 获取账户及全部交易成功
        set /a PASS+=1
    ) else (
        echo   [FAIL] 获取账户及全部交易失败
        set /a FAIL+=1
        type temp_bank_with_tx.json
    )
) else (
    echo   [SKIP] 无账户ID，跳过
    set /a TOTAL-=1
)

echo.
echo [10/14] 测试交易记录模块 - 创建交易记录
set /a TOTAL+=1
if defined ACCOUNT_ID (
    curl -s --connect-timeout 5 -X POST "%BASE_URL%/bank-account-transaction" -H "Authorization: Bearer %TOKEN%" -H "Content-Type: application/json" -d '{"accountId":%ACCOUNT_ID%,"transactionType":"IN","amount":50000.00,"transactionDate":"2024-01-15","summary":"收入款项","businessType":"PAYMENT","counterpartyAccount":"6222029876543210987","counterpartyName":"对方公司","balanceAfter":150000.00,"remark":"测试交易","caseId":1}' > temp_tx_create.json 2>&1
    findstr /C:"transactionId" temp_tx_create.json >nul 2>&1
    if %errorlevel%==0 (
        echo   [PASS] 创建交易记录成功
        set /a PASS+=1
        for /f "delims=" %%i in ('powershell -Command "(Get-Content temp_tx_create.json | ConvertFrom-Json).data.transactionId"') do set TX_ID=%%i
        echo   新交易ID: %TX_ID%
    ) else (
        echo   [FAIL] 创建交易记录失败
        set /a FAIL+=1
        type temp_tx_create.json
    )
) else (
    echo   [SKIP] 无账户ID，跳过
    set /a TOTAL-=1
)

echo.
echo [11/14] 测试交易记录模块 - 获取交易记录列表
set /a TOTAL+=1
curl -s --connect-timeout 5 -X GET "%BASE_URL%/bank-account-transaction/list?pageNum=1&pageSize=10" -H "Authorization: Bearer %TOKEN%" > temp_tx_list.json 2>&1
findstr /C:"code" temp_tx_list.json >nul 2>&1
if %errorlevel%==0 (
    echo   [PASS] 获取交易记录列表成功
    set /a PASS+=1
) else (
    echo   [FAIL] 获取交易记录列表失败
    set /a FAIL+=1
)

echo.
echo [12/14] 测试交易记录模块 - 获取交易记录详情
set /a TOTAL+=1
if defined TX_ID (
    curl -s --connect-timeout 5 -X GET "%BASE_URL%/bank-account-transaction/%TX_ID%" -H "Authorization: Bearer %TOKEN%" > temp_tx_detail.json 2>&1
    findstr /C:"transactionType" temp_tx_detail.json >nul 2>&1
    if %errorlevel%==0 (
        echo   [PASS] 获取交易记录详情成功
        set /a PASS+=1
    ) else (
        echo   [FAIL] 获取交易记录详情失败
        set /a FAIL+=1
    )
) else (
    echo   [SKIP] 无交易ID，跳过
    set /a TOTAL-=1
)

echo.
echo [13/14] 测试交易记录模块 - 更新交易记录
set /a TOTAL+=1
if defined TX_ID (
    curl -s --connect-timeout 5 -X PUT "%BASE_URL%/bank-account-transaction/%TX_ID%" -H "Authorization: Bearer %TOKEN%" -H "Content-Type: application/json" -d '{"transactionType":"IN","amount":60000.00,"transactionDate":"2024-01-15","summary":"收入款项（已更新）"}' > temp_tx_update.json 2>&1
    findstr /C:"200" temp_tx_update.json >nul 2>&1
    if %errorlevel%==0 (
        echo   [PASS] 更新交易记录成功
        set /a PASS+=1
    ) else (
        echo   [FAIL] 更新交易记录失败
        set /a FAIL+=1
        type temp_tx_update.json
    )
) else (
    echo   [SKIP] 无交易ID，跳过
    set /a TOTAL-=1
)

echo.
echo [14/14] 清理测试数据 - 删除测试交易和账户
set /a TOTAL+=1
set CLEANUP_PASS=0
if defined TX_ID (
    curl -s --connect-timeout 5 -X DELETE "%BASE_URL%/bank-account-transaction/%TX_ID%" -H "Authorization: Bearer %TOKEN%" > temp_tx_delete.json 2>&1
    findstr /C:"200" temp_tx_delete.json >nul 2>&1
    if %errorlevel%==0 (
        set /a CLEANUP_PASS+=1
    )
)
if defined ACCOUNT_ID (
    curl -s --connect-timeout 5 -X DELETE "%BASE_URL%/bank-account/%ACCOUNT_ID%" -H "Authorization: Bearer %TOKEN%" > temp_bank_delete.json 2>&1
    findstr /C:"200" temp_bank_delete.json >nul 2>&1
    if %errorlevel%==0 (
        set /a CLEANUP_PASS+=1
    )
)
if !CLEANUP_PASS! GEQ 1 (
    echo   [PASS] 测试数据清理成功
    set /a PASS+=1
) else (
    echo   [FAIL] 测试数据清理失败
    set /a FAIL+=1
)

echo.
echo ============================================
echo   测试结果汇总
echo ============================================
echo   总测试数: %TOTAL%
echo   通过: %PASS%
echo   失败: %FAIL%
echo   通过率: 
if %TOTAL% GTR 0 (
    powershell -Command "Write-Host ([math]::Round(%PASS%/%TOTAL%*100,1))'%%'"
)
echo ============================================

del /q temp_*.json 2>nul
endlocal
