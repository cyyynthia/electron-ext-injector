# Electron extension injector
injects Chromium extension into packaged electron apps. highly experimental. might work.

use Alt+Shift+E to access extension menus & settings & stuff.

many extensions won't work because of electron's limited apis. deal with it.

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

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
