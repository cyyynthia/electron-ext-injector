/*** Electron Extension Injector compatibility code ***/
/*! Copyright (c) Cynthia Rey, All rights reserved. */
;(function () {
	function promisify (obj, fn) {
		const realFn = `__real_${fn}`
		if (!obj[realFn]) {
			obj[realFn] = obj[fn]
			obj[fn] = (...args) => {
				if (typeof args[args.length - 1] === 'function')
					return obj[realFn](...args)

				return new Promise((resolve) => obj[realFn](...args, resolve))
			}
		}
	}

	// Make `chrome.storage.sync` work by replacing it with `chrome.storage.local`
	if (chrome.storage) {
		promisify(chrome.storage.local, 'get')
		promisify(chrome.storage.local, 'set')
		chrome.storage.sync = chrome.storage.local
	}

	// Make `chrome.extension.isAllowedFileSchemeAccess` exist
	if (chrome.extension)
		chrome.extension.isAllowedFileSchemeAccess = (cb) => {
			cb?.(false)
			return Promise.resolve(false)
		}

	if (chrome.tabs) {
		// Make `chrome.tabs.query` exist
		chrome.tabs.query = async (_, cb) => {
			while (!window.__eeiInjected)
				await new Promise((r) => setTimeout(r, 10))

			const tab = {
				active: true,
				audible: false,
				autoDiscardable: false,
				discarded: false,
				favIconUrl: null,
				groupId: -1,
				height: 0,
				highlighted: true,
				id: 0,
				incognito: false,
				index: 0,
				mutedInfo: { muted: false },
				openerTabId: 0,
				pinned: false,
				selected: true,
				status: 'complete',
				title: window.__tabTitle,
				url: window.__tabUrl,
				width: 0,
				windowId: 0,
			}

			cb?.([ tab ])
			return [ tab ]
		}
	}

	if (chrome.runtime) {
		promisify(chrome.runtime, 'sendMessage')
	}
})();
/*** END of EEI compatibility code ***/
