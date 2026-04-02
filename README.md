# contenthub-sliders

A collection of Content Hub external component examples for responsive image and video sliders.

## Overview

This monorepo contains:

- `external-components-examples` : sitecore content hub external component demo projects
- `property-image-slider` : image slider component package
- `property-image-slider-original` : original image slider implementation
- `property-video-slider` : video slider component package
- `property-video-slider-original` : original video slider implementation

## Requirements

- Node.js 14+ (LTS)
- npm 6+ (or yarn)

## Setup

From the repo root:

```bash
npm install
```

Then build a package or an example project. Example:

```bash
cd external-components-examples/react-example
npm install
npm run build
```

## Build all projects (recommended)

```bash
# from repository root
npm run build
```

> Note: each package has its own `package.json`, so you can run `npm install` and `npm run build` inside that folder.

## Usage

- Inspect the `src` files for each slider implementation.
- Deploy the bundle from `dist` (generated after build) to Sitecore Content Hub as an external component.
- Refer to each example folder for run and build instructions.

## Git remote

Remote URL: `git@github.com:johnykbd/contenthub-sliders.git`
