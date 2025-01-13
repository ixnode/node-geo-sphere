# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## Changelogs

### [0.1.16] - 2025-01-13

* Add ctrl hint if using wheel functionality
  * With effect

### [0.1.15] - 2025-01-13

* Add ctrl hint if using wheel functionality

### [0.1.14] - 2025-01-12

* Export interfaces

### [0.1.13] - 2025-01-12

* Update README.md documentation

### [0.1.12] - 2025-01-12

* Note the given SVG aspect ratio

### [0.1.11] - 2025-01-11

* Add debug and logo options
* Optimize debug output

### [0.1.10] - 2025-01-11

* Upgrade typescript from 4.9.5 to 5.7.3

### [0.1.9] - 2025-01-11

* Upgrade storybook to ReactJS version 18.3.1 to avoid warnings

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
