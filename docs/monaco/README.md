# Developing Locally

All the code is in `src/`. When you want to compile the bundle run `npm run build`. It puts the artifacts in `lib/`.

If you are doing more than just one-off compiling, you want to have 3 terminal
windows open, with these three things:

* `cd ..; python3 server.py`
* `npm run watch`
* `webpack -w`
