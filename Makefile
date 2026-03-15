# Pure Admin Themes - Makefile
# Build, pack, and publish theme packages
#
# Usage:
#   make build                  Build all themes
#   make build THEME=audi       Build only audi
#   make pack                   Build + ZIP all themes
#   make pack THEME=dark        Build + ZIP only dark
#   make publish THEME=audi     Pack + upload audi to pure-theme-park
#   make publish                Pack + upload all
#   make clean                  Clean all dist dirs

.PHONY: help install build pack publish clean

THEME ?=
PUREADMIN_API_KEY ?=
PUREADMIN_URL ?=

help:
	@echo Pure Admin Themes
	@echo ""
	@echo   make install                     Install dependencies
	@echo   make build [THEME=name]          Build SCSS to CSS
	@echo   make pack  [THEME=name]          Build + ZIP
	@echo   make publish [THEME=name]        Pack + upload to pure-theme-park
	@echo   make clean                       Clean dist directories
	@echo ""

install:
	npm install

build:
	node scripts/build-themes.js $(THEME)

pack:
	node scripts/pack-themes.js $(THEME)

publish:
	node scripts/publish-themes.js $(THEME) $(if $(PUREADMIN_API_KEY),--api-key $(PUREADMIN_API_KEY)) $(if $(PUREADMIN_URL),--url $(PUREADMIN_URL))

clean:
	node -e "const fs=require('fs'),p=require('path');fs.readdirSync('.').filter(d=>fs.existsSync(p.join(d,'theme.json'))).forEach(d=>{fs.rmSync(p.join(d,'dist'),{recursive:true,force:true})});fs.rmSync('dist',{recursive:true,force:true})"
