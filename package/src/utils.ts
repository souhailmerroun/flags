import { Flags } from "./types";

export function has<X extends {}, Y extends PropertyKey>(
  obj: X,
  prop: Y
): obj is X & Record<Y, unknown> {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

function omitNullValues<O extends object, T = Partial<O>>(obj: O): T {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    if (value !== null) acc[key as keyof T] = value;
    return acc;
  }, {} as T);
}

/**
 * Returns a combination of the loaded flags and the default flags.
 *
 * Tries to return the loaded flags directly in case the they contain all defaults
 * to avoid changing object references in the caller.
 *
 * @param loadedFlags
 * @param defaultFlags
 */
export function combineLoadedFlagsWithDefaultFlags<F extends Flags>(
  loadedFlags: F | null,
  defaultFlags: Flags
): F {
  if (!loadedFlags) return defaultFlags as F;

  const loadedFlagsContainAllDefaultFlags = Object.keys(defaultFlags).every(
    (key) => has(loadedFlags, key) && loadedFlags[key] !== null
  );

  return loadedFlagsContainAllDefaultFlags
    ? (loadedFlags as F)
    : ({
        // this triple ordering ensures that null-ish loaded values are
        // overwritten by the defaults:
        //   - loaded null & default exists => default value
        //   - loaded null & no default => null
        //   - loaded value & default => loaded value
        //   - loaded value & no default => loaded value
        ...loadedFlags,
        ...defaultFlags,
        ...omitNullValues(loadedFlags),
      } as F);
}

/**
 * Gets the cookie by the name
 *
 * From: https://developers.cloudflare.com/workers/examples/extract-cookie-value
 */
export function getCookie(
  cookieString: string | null | undefined,
  name: string
) {
  if (cookieString) {
    const cookies = cookieString.split(";");
    for (let cookie of cookies) {
      const cookiePair = cookie.split("=", 2);
      const cookieName = cookiePair[0].trim();
      if (cookieName === name) return cookiePair[1];
    }
  }
  return null;
}

export function serializeVisitorKeyCookie(visitorKey: string) {
  const seconds = 60 * 60 * 24 * 180;
  const value = encodeURIComponent(visitorKey);
  return `hkvk=${value}; Path=/; Max-Age=${seconds}; SameSite=Lax`;
}

// source: https://github.com/lukeed/dequal/blob/master/src/lite.js
export function deepEqual(objA: any, objB: any) {
  var ctor, len;
  if (objA === objB) return true;

  if (objA && objB && (ctor = objA.constructor) === objB.constructor) {
    if (ctor === Date) return objA.getTime() === objB.getTime();
    if (ctor === RegExp) return objA.toString() === objB.toString();

    if (ctor === Array) {
      if ((len = objA.length) === objB.length) {
        while (len-- && deepEqual(objA[len], objB[len]));
      }
      return len === -1;
    }

    if (!ctor || typeof objA === "object") {
      len = 0;
      for (ctor in objA) {
        if (has(objA, ctor) && ++len && !has(objB, ctor)) return false;
        if (!(ctor in objB) || !deepEqual(objA[ctor], objB[ctor])) return false;
      }
      return Object.keys(objB).length === len;
    }
  }

  return objA !== objA && objB !== objB;
}
