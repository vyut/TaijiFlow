@echo off

setlocal enabledelayedexpansion

:: Initialize the CSV file
echo type,lines > code-lines.csv

:: Count lines for HTML files
echo html,$(
    find . -type f -name "*.html" -not -path "*/.*/*" -exec wc -l {} + | tail -n 1 | awk '{print $1}'
) >> code-lines.csv

:: Count lines for JS files
echo js,$(
    find . -type f -name "*.js" -not -path "*/.*/*" -exec wc -l {} + | tail -n 1 | awk '{print $1}'
) >> code-lines.csv

:: Count lines for CSS files
echo css,$(
    find . -type f -name "*.css" -not -path "*/.*/*" -exec wc -l {} + | tail -n 1 | awk '{print $1}'
) >> code-lines.csv

endlocal
