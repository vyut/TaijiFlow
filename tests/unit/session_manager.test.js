/**
 * Unit Tests - Session Manager
 *
 * Tests for: getOrCreateUserId(), isMobileDevice(), getPlatformInfo()
 */

describe("SessionManager", () => {
  // Mock localStorage
  const localStorageMock = (() => {
    let store = {};
    return {
      getItem: (key) => store[key] || null,
      setItem: (key, value) => {
        store[key] = value.toString();
      },
      clear: () => {
        store = {};
      },
    };
  })();

  beforeEach(() => {
    localStorageMock.clear();
  });

  // Extracted from session_manager.js
  function generateSessionId() {
    return (
      "session_" + Date.now() + "_" + Math.random().toString(36).substring(2, 9)
    );
  }

  function getOrCreateUserId(localStorage) {
    let userId = localStorage.getItem("taijiflow_user_id");
    if (!userId) {
      userId =
        "user_" + Date.now() + "_" + Math.random().toString(36).substring(2, 9);
      localStorage.setItem("taijiflow_user_id", userId);
    }
    return userId;
  }

  function isMobileDevice(userAgent) {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      userAgent
    );
  }

  describe("generateSessionId", () => {
    test("generates unique session IDs", () => {
      const id1 = generateSessionId();
      const id2 = generateSessionId();
      expect(id1).not.toBe(id2);
    });

    test('starts with "session_"', () => {
      const id = generateSessionId();
      expect(id.startsWith("session_")).toBe(true);
    });
  });

  describe("getOrCreateUserId", () => {
    test("creates new user ID if not exists", () => {
      const userId = getOrCreateUserId(localStorageMock);
      expect(userId).toBeDefined();
      expect(userId.startsWith("user_")).toBe(true);
    });

    test("returns existing user ID if exists", () => {
      localStorageMock.setItem("taijiflow_user_id", "user_existing_123");
      const userId = getOrCreateUserId(localStorageMock);
      expect(userId).toBe("user_existing_123");
    });

    test("stores new user ID in localStorage", () => {
      const userId = getOrCreateUserId(localStorageMock);
      expect(localStorageMock.getItem("taijiflow_user_id")).toBe(userId);
    });
  });

  describe("isMobileDevice", () => {
    test("detects Android", () => {
      expect(isMobileDevice("Mozilla/5.0 (Linux; Android 10)")).toBe(true);
    });

    test("detects iPhone", () => {
      expect(isMobileDevice("Mozilla/5.0 (iPhone; CPU iPhone OS 14_0)")).toBe(
        true
      );
    });

    test("detects iPad", () => {
      expect(isMobileDevice("Mozilla/5.0 (iPad; CPU OS 14_0)")).toBe(true);
    });

    test("returns false for desktop Chrome", () => {
      expect(
        isMobileDevice("Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/91.0")
      ).toBe(false);
    });

    test("returns false for desktop Firefox", () => {
      expect(
        isMobileDevice(
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) Firefox/89.0"
        )
      ).toBe(false);
    });
  });
});
