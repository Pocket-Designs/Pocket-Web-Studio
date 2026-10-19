// Stamps the app icon and version details into the Windows .exe without needing Wine,
// so Windows builds can be made on Linux or macOS. Runs after electron-builder packs the app.
'use strict';
const fs = require('fs');
const path = require('path');

exports.default = async function afterPack(context) {
  if (context.electronPlatformName !== 'win32') return;
  const ResEdit = require('resedit');
  const png2icons = require('png2icons');
  const { productFilename } = context.packager.appInfo;
  const exePath = path.join(context.appOutDir, `${productFilename}.exe`);
  const version = context.packager.appInfo.version;
  const [maj, min, pat] = version.split('.').map(n => parseInt(n, 10) || 0);

  const icoBuf = png2icons.createICO(fs.readFileSync(path.join(__dirname, 'icon.png')), png2icons.BICUBIC, 0, false, true);
  const exe = ResEdit.NtExecutable.from(fs.readFileSync(exePath), { ignoreCert: true });
  const res = ResEdit.NtExecutableResource.from(exe);

  const iconFile = ResEdit.Data.IconFile.from(icoBuf);
  const groups = ResEdit.Resource.IconGroupEntry.fromEntries(res.entries);
  const groupId = groups.length ? groups[0].id : 1;
  const lang = groups.length ? groups[0].lang : 1033;
  ResEdit.Resource.IconGroupEntry.replaceIconsForResource(res.entries, groupId, lang, iconFile.icons.map(i => i.data));

  const vi = ResEdit.Resource.VersionInfo.fromEntries(res.entries)[0] || ResEdit.Resource.VersionInfo.createEmpty();
  vi.setFileVersion(maj, min, pat, 0, 1033);
  vi.setProductVersion(maj, min, pat, 0, 1033);
  vi.setStringValues({ lang: 1033, codepage: 1200 }, {
    FileDescription: 'Pocket-Web-Studio',
    ProductName: 'Pocket-Web-Studio',
    CompanyName: 'project-tech-me',
    LegalCopyright: 'Copyright (c) 2026 project-tech-me. MIT licence.',
    OriginalFilename: `${productFilename}.exe`,
    InternalName: 'PocketWebStudio',
    FileVersion: version,
    ProductVersion: version
  });
  vi.outputToResourceEntries(res.entries);

  res.outputResource(exe);
  fs.writeFileSync(exePath, Buffer.from(exe.generate()));
  console.log('  • stamped icon and version info into', path.basename(exePath));
};
