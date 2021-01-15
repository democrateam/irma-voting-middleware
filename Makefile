all: yarn.lock
	yarn run css
	yarn run build
	-[ ! -d dist/webfonts ] && cp -r node_modules/@fortawesome/fontawesome-free/webfonts dist

run:
	npm run webserver

setup: yarn.lock

yarn.lock:
	yarn install
