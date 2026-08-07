# Pure Admin Themes - Makefile
# Build, pack, and publish theme packages
#
# Usage:
#   make build                  Build all themes
#   make build THEME=audi       Build only audi
#   make pack                   Build + ZIP all themes
#   make pack THEME=dark        Build + ZIP only dark
#   make publish THEME=audi     Pack + upload audi (production)
#   make publish                Pack + upload all (production)
#   make publish-local          Pack + upload all to local pureadmin server
#   make publish-local THEME=x  Pack + upload one theme to local pureadmin server
#   make validate               Validate all themes (hard correctness)
#   make validate THEME=audi    Validate one theme
#   make lint                   Lint all themes (quality recommendations)
#   make lint THEME=audi        Lint one theme
#   make clean                  Clean all dist dirs

# --- Windows recipe-shell fix -------------------------------------------------
# GNU make on Windows picks Git's bare `usr/bin/sh.exe` as the recipe shell.
# Launched from cmd.exe / PowerShell, that sh runs npm/npx's Unix shell-shims,
# whose `#!/usr/bin/env bash` searches PATH for `bash` — and on a stock Windows
# PATH the first hit is `C:\Windows\System32\bash.exe` (WSL bash), which can't
# see Windows paths and dies with "No such file or directory". Pinning the
# recipe shell to Git's FULL bash launcher rebuilds PATH with `/usr/bin` first
# so `env bash` resolves to MSYS bash regardless of the launching shell. The
# `?` in the check matches the space in "Program Files" (a literal space would
# make $(wildcard) split into two never-matching patterns); guarded so it's a
# no-op when Git isn't at the default location.
ifeq ($(OS),Windows_NT)
  ifneq ($(wildcard C:/Program?Files/Git/bin/bash.exe),)
    SHELL := C:/Program Files/Git/bin/bash.exe
  endif
endif
# -----------------------------------------------------------------------------

.PHONY: help install build pack publish publish-local validate lint clean

THEME ?=
PUREADMIN_API_KEY ?=

help:
	@echo Pure Admin Themes
	@echo ""
	@echo   make install                     Install dependencies
	@echo   make build [THEME=name]          Build SCSS to CSS
	@echo   make pack  [THEME=name]          Build + ZIP
	@echo   make publish [THEME=name]        Pack + upload (production pureadmin.io)
	@echo   make publish-local [THEME=name]  Pack + upload to local pureadmin server
	@echo   make validate [THEME=name]       Hard correctness checks (manifest, vars)
	@echo   make lint [THEME=name]           Quality recommendations (contrast, etc)
	@echo   make clean                       Clean dist directories
	@echo ""

install:
	npm install

build:
	npx pureadmin themes build $(THEME)

pack:
	npx pureadmin themes pack $(THEME)

publish:
	npx pureadmin themes publish $(THEME) $(if $(PUREADMIN_API_KEY),--api-key $(PUREADMIN_API_KEY))

publish-local:
	npx @keenmate/pureadmin themes publish $(THEME) --server local $(if $(PUREADMIN_API_KEY),--api-key $(PUREADMIN_API_KEY))

validate:
	npx pureadmin themes validate $(THEME)

lint:
	npx pureadmin themes lint $(THEME)

clean:
	node -e "const fs=require('fs'),p=require('path');fs.readdirSync('.').filter(d=>fs.existsSync(p.join(d,'theme.json'))).forEach(d=>{fs.rmSync(p.join(d,'dist'),{recursive:true,force:true})});fs.rmSync('dist',{recursive:true,force:true})"
