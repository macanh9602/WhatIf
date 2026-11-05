@echo off
rem Task Scheduler entry: evening What If report (ops/report.mjs). Log in ops\stats\report.log
cd /d D:\_UnityProject\WhatIf
node ops\report.mjs >> ops\stats\report.log 2>&1
