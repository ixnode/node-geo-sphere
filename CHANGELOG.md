# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## Changelogs

### [0.1.8] - 2025-01-11

* Add zoom in and zoom out buttons to map

### [0.1.7] - 2025-01-11

* Add icon logo

### [0.1.6] - 2025-01-11

* Upgrade react version from 17.0.2 to 18.3.1

### [0.1.5] - 2025-01-11

* Code refactoring
* Add ixnode logo
* Add new package.json importer

### [0.1.4] - 2025-01-05

* Add Versions component to show project, framework and libraries versions.

### [0.1.3] - 2025-01-05

* Update packages

### [0.1.2] - 2025-01-04

* Update node version

### [0.1.1] - 2025-01-04

* Add .nvmrc file

### [0.1.0] - 2025-01-04

* Initial release
* Add typescript 4.9.5
* Add rollup to build npmjs.com packages
* etc.

## Add new version

```bash
# → Either change patch version
$ vendor/bin/version-manager --patch

# → Or change minor version
$ vendor/bin/version-manager --minor

# → Or change major version
$ vendor/bin/version-manager --major

# → Usually version changes are set in the main or master branch
$ git checkout master && git pull

# → Edit your CHANGELOG.md file
$ vi CHANGELOG.md

# → Commit your changes to your repo
$ git add CHANGELOG.md VERSION .env && git commit -m "Add version $(cat VERSION)" && git push

# → Tag your version
$ git tag -a "$(cat VERSION)" -m "Version $(cat VERSION)" && git push origin "$(cat VERSION)"
```
