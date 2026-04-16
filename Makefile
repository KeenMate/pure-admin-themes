# Pure Admin Themes - Makefile
# Build, pack, and publish theme packages
#
# Usage:
#   make build                  Build all themes
#   make build THEME=audi       Build only audi
#   make pack                   Build + ZIP all themes
#   make pack THEME=dark        Build + ZIP only dark
#   make publish THEME=audi     Pack + upload audi
#   make publish                Pack + upload all
#   make validate               Validate all themes
#   make validate THEME=audi    Validate one theme
#   make clean                  Clean all dist dirs

.PHONY: help install build pack publish validate clean

THEME ?=
PUREADMIN_API_KEY ?=

help:
	@echo Pure Admin Themes
	@echo ""
	@echo   make install                     Install dependencies
	@echo   make build [THEME=name]          Build SCSS to CSS
	@echo   make pack  [THEME=name]          Build + ZIP
	@echo   make publish [THEME=name]        Pack + upload
	@echo   make validate [THEME=name]       Validate theme CSS
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

validate:
	npx pureadmin themes validate $(THEME)

clean:
	node -e "const fs=require('fs'),p=require('path');fs.readdirSync('.').filter(d=>fs.existsSync(p.join(d,'theme.json'))).forEach(d=>{fs.rmSync(p.join(d,'dist'),{recursive:true,force:true})});fs.rmSync('dist',{recursive:true,force:true})"
