# Electron extension injector
injects Chromium extension into packaged electron apps. highly experimental. might work.

notes:
 - may not like updates and require re-injecting. deal with it. make shell scripts. :shrug:
 - doesn't deal with updates. maybe if it ends up bothering me ill add it. make shell scripts. :shrug:
 - can't access popup windows and stuff. maybe one day. if it ends up bothering me too. :shrug:
 - sudo/doas probably required on linux. :shrug:
 - don't bother me with this i'll ignore you.

```
node src/injector.js <path/to/electron/executable> <path/to/unpackaged/extension>
-- OR --
node src/injector.js <path/to/electron/executable> <crx id from the cws>
```

remove stuff in `path/to/electron/app/eei-exts` to delete extensions.

## it doesn't work
too bad

## can i get help for-
no

## why
:shrug:

## License
Copyright (c) 2022 Cynthia K. Rey, All rights reserved.
