# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## Changelogs

### [0.1.38] - 2025-01-26

* Add zoom bounding box for the United States

### [0.1.37] - 2025-01-26

* Add zoom bounding box for france

### [0.1.36] - 2025-01-26

* Add spanish cities

### [0.1.35] - 2025-01-25

* Add regions from france

### [0.1.34] - 2025-01-25

* Add states from uk

### [0.1.33] - 2025-01-25

* Fix argTypes, select type with labels
* Add german states
* Add state to cities
* Add state to germany
* Add country and state to place hover data
* Adds coordinateDisplay to cities to be able to move them on the map

### [0.1.32] - 2025-01-24

* Switch country and city data to json data
* Country data refactoring
* City data refactoring (coordinate as object)
* Add gb state capitals
* Add french regions
* Translation refactoring

### [0.1.31] - 2025-01-22

* README.md changes

### [0.1.30] - 2025-01-22

* Hover and click translation fix
* Add new docs images (README.md)

### [0.1.29] - 2025-01-22

* General refactoring
* SVGRenderer.tsx Refactoring 
* WorldMap.tsx Refactoring

### [0.1.28] - 2025-01-20

* Add latitude and longitude to place hover callback function
* Add new fresh colors to country and svg map
* Map performance optimization
* Optimize lastHover triggering

### [0.1.27] - 2025-01-20

* Hover fix if debug mode is enabled

### [0.1.26] - 2025-01-20

* Implement country and place hover handler (onHoverCountry, onHoverPlace)

### [0.1.25] - 2025-01-19

* Add new preview images

### [0.1.24] - 2025-01-19

* Add priority and size to cities to optimize svg output

### [0.1.23] - 2025-01-19

* Add optimized touchpad support

### [0.1.22] - 2025-01-19

* Add all populations and some more translation to european capitals
* First touchpad support

### [0.1.21] - 2025-01-19

* Add population and translation to some european capitals

### [0.1.20] - 2025-01-19

* Add translated place names
* WorldMap Refactoring
* Add place callback function
* Update README.md
* Improve hover events (place and country)

### [0.1.19] - 2025-01-18

* Optimize debug output
* Show country and city hover debug information
* Export svg styles to external scss file
* Refactoring

### [0.1.18] - 2025-01-15

* Disable zoom with mouse wheel if strg not pressed
  * Add hint overlay to show user information
* SVGRenderer.tsx refactoring
  * Fix touch events
  * Fix mouse events
  * Disable Standard pointer-events
  * Delegate hover, zoom etc. to SVGRenderer.tsx
  * Optimize click and move detection
* Add coordinates and click position to click event (screen and svg)

### [0.1.17] - 2025-01-14

* Add translations

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
