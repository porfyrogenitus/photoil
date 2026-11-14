# Publishing Photoil to your GitHub repository

Target repository: https://github.com/porfyrogenitus/photoil
Published address after GitHub Pages is enabled: https://porfyrogenitus.github.io/photoil/

## Upload the files

The most reliable method is a desktop terminal with Git installed. Download the Photoil-v1.0.0.zip package and unzip it on your computer. The ZIP contains files at repository root level — not a wrapping folder.

From a terminal, run:

```bash
git clone https://github.com/porfyrogenitus/photoil.git
cd photoil
```

Copy **all** files from the unzipped Photoil package into the `photoil` folder. Include `.github/workflows/pages.yml` and `.nojekyll` (hidden files). Then run:

```bash
git add -A
git commit -m "Launch Photoil v1.0 — the Photographic Atelier"
git push origin main
```

GitHub Desktop is an alternative: clone the `photoil` repository, copy the package files into the cloned folder, review changes, commit to `main`, and push.

## Enable Pages once

Open https://github.com/porfyrogenitus/photoil/settings/pages and choose **Build and deployment → Source → GitHub Actions**. The included `.github/workflows/pages.yml` will test the project and deploy it automatically when `main` changes.

See the outcome at https://github.com/porfyrogenitus/photoil/actions . The site address will be https://porfyrogenitus.github.io/photoil/ after a successful deployment.

If your account is unable to authorise the connected ChatGPT GitHub application to push commits, revisit GitHub app installation/repository access and ensure the app grants Contents write permission for `porfyrogenitus/photoil`. The original package is fully independent of that ChatGPT connector.

## Local test

Run `python3 -m http.server 5173` in the project directory and visit http://localhost:5173 . Module workers require HTTP rather than directly opening `index.html` from the filesystem.

Run automated checks with `npm run check` (Node.js 20+). Node dependencies are not required.

## Notes

The publication procedure above has not been performed by ChatGPT because the GitHub connection returned HTTP 403 when attempting to create repository files. The site is therefore not yet live. The contents of this package are ready for commit, but GitHub Pages must be configured and verified after the push.
