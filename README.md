# Vortoria

**Everything lives here** once you upload the full site (see below).

Repo: https://github.com/GuestVRGT/vortoria  
After Pages is on: https://guestvrgt.github.io/vortoria/

## Put the full website on this repo (2 minutes)

1. Download **vortoria-site.zip** from the Grok chat (file card).
2. Unzip it. You should see `index.html`, `assets/male.glb`, `assets/female.glb`, `assets/clothing_template.png` (or `.webp`).
3. Open https://github.com/GuestVRGT/vortoria
4. Click **Add file → Upload files**
5. Drag the **contents** of the unzipped folder (including `assets/`) onto the page.
6. Commit to **main**.
7. **Settings → Pages →** Source: **Deploy from a branch** → Branch **main** / **/(root)** → Save.

Then open `https://guestvrgt.github.io/vortoria/` — Home, Games, Studio, Players, Servers, 3D play, clothing, your PlayFab/Photon IDs.

## Local test
```bash
unzip vortoria-site.zip && cd vortoria-site
python3 -m http.server 8080
```
Open http://localhost:8080

## Why not fully auto-pushed?
The chat→GitHub connector caps single-file size, so the complete hub + GLBs are delivered as the zip for a one-shot web upload.
