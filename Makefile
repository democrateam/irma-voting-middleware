all: yarn.lock dist/style.css
	yarn run build
	-[ ! -d dist/webfonts ] && cp -r node_modules/@fortawesome/fontawesome-free/webfonts dist

run:
	npm run webserver

setup: yarn.lock

yarn.lock:
	yarn install

dist/style.css: src/style.scss
	yarn run css
	cp dist/style.css serverA/public
	cp dist/style.css serverB/public

startA: all
	(cd serverA && npm run start)

startB: all
	(cd serverB && npm run start)
