@echo off
rem Task Scheduler entry: evening What If report (ops/report.mjs). Log in ops\stats\report.log
rem %~dp0.. = the project root wherever the repo lives (the old fixed path broke when the folder moved)
cd /d "%~dp0.."
node ops\report.mjs >> ops\stats\report.log 2>&1
