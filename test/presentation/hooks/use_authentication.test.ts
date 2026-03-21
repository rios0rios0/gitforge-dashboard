import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAuthentication } from "../../../src/presentation/hooks/use_authentication";
import { StubAuthenticationService } from "../../doubles/stub_authentication_service";

describe("useAuthentication", () => {
  it("should initialize state from auth service", () => {
    // given
    const service = new StubAuthenticationService();
    service.setToken("t1");
    service.setUsername("u1");
    service.setPlatform("github");

    // when
    const { result } = renderHook(() => useAuthentication(service));

    // then
    expect(result.current.token).toBe("t1");
    expect(result.current.username).toBe("u1");
    expect(result.current.platform).toBe("github");
  });

  it("should set isAuthenticated to true when token, username, and platform are all present", () => {
    // given
    const service = new StubAuthenticationService();
    service.setToken("token");
    service.setUsername("user");
    service.setPlatform("github");

    // when
    const { result } = renderHook(() => useAuthentication(service));

    // then
    expect(result.current.isAuthenticated).toBe(true);
  });

  it("should set isAuthenticated to false when any credential is missing", () => {
    // given
    const service = new StubAuthenticationService();
    service.setToken("token");

    // when
    const { result } = renderHook(() => useAuthentication(service));

    // then
    expect(result.current.isAuthenticated).toBe(false);
  });

  it("should persist all credentials via auth service on login", () => {
    // given
    const service = new StubAuthenticationService();
    const { result } = renderHook(() => useAuthentication(service));

    // when
    act(() => {
      result.current.login("tok", "usr", { sonar: null, wakaTimeToken: null }, "github");
    });

    // then
    expect(result.current.token).toBe("tok");
    expect(result.current.username).toBe("usr");
    expect(result.current.platform).toBe("github");
    expect(service.getToken()).toBe("tok");
    expect(service.getUsername()).toBe("usr");
    expect(service.getPlatform()).toBe("github");
  });

  it("should persist sonar credentials when provided on login", () => {
    // given
    const service = new StubAuthenticationService();
    const { result } = renderHook(() => useAuthentication(service));

    // when
    act(() => {
      result.current.login(
        "tok",
        "usr",
        {
          sonar: { type: "cloud", token: "sonar-tok", url: "https://sonar.io" },
          wakaTimeToken: null,
        },
        "github",
      );
    });

    // then
    expect(result.current.sonarToken).toBe("sonar-tok");
    expect(result.current.sonarType).toBe("cloud");
    expect(result.current.sonarUrl).toBe("https://sonar.io");
    expect(service.getSonarToken()).toBe("sonar-tok");
  });

  it("should clear sonar credentials when sonar is null on login", () => {
    // given
    const service = new StubAuthenticationService();
    service.setSonarToken("old");
    service.setSonarType("cloud");
    const { result } = renderHook(() => useAuthentication(service));

    // when
    act(() => {
      result.current.login("tok", "usr", { sonar: null, wakaTimeToken: null }, "github");
    });

    // then
    expect(result.current.sonarToken).toBeNull();
    expect(result.current.sonarType).toBeNull();
  });

  it("should persist wakaTime token when provided on login", () => {
    // given
    const service = new StubAuthenticationService();
    const { result } = renderHook(() => useAuthentication(service));

    // when
    act(() => {
      result.current.login("tok", "usr", { sonar: null, wakaTimeToken: "waka-tok" }, "github");
    });

    // then
    expect(result.current.wakaTimeToken).toBe("waka-tok");
    expect(service.getWakaTimeToken()).toBe("waka-tok");
  });

  it("should clear wakaTime token when null on login", () => {
    // given
    const service = new StubAuthenticationService();
    service.setWakaTimeToken("old");
    const { result } = renderHook(() => useAuthentication(service));

    // when
    act(() => {
      result.current.login("tok", "usr", { sonar: null, wakaTimeToken: null }, "github");
    });

    // then
    expect(result.current.wakaTimeToken).toBeNull();
  });

  it("should clear all credentials on logout", () => {
    // given
    const service = new StubAuthenticationService();
    service.setToken("tok");
    service.setUsername("usr");
    service.setPlatform("github");
    const { result } = renderHook(() => useAuthentication(service));

    // when
    act(() => {
      result.current.logout();
    });

    // then
    expect(result.current.token).toBeNull();
    expect(result.current.username).toBeNull();
    expect(result.current.platform).toBeNull();
    expect(result.current.sonarToken).toBeNull();
    expect(result.current.wakaTimeToken).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it("should update token, username, and platform via updateVcsCredentials", () => {
    // given
    const service = new StubAuthenticationService();
    const { result } = renderHook(() => useAuthentication(service));

    // when
    act(() => {
      result.current.updateVcsCredentials("new-tok", "new-usr", "azure-devops");
    });

    // then
    expect(result.current.token).toBe("new-tok");
    expect(result.current.username).toBe("new-usr");
    expect(result.current.platform).toBe("azure-devops");
  });

  it("should update sonar credentials via updateSonarConfig when provided", () => {
    // given
    const service = new StubAuthenticationService();
    const { result } = renderHook(() => useAuthentication(service));

    // when
    act(() => {
      result.current.updateSonarConfig({
        type: "qube",
        token: "q-tok",
        url: "https://sonar.local",
      });
    });

    // then
    expect(result.current.sonarToken).toBe("q-tok");
    expect(result.current.sonarType).toBe("qube");
    expect(result.current.sonarUrl).toBe("https://sonar.local");
  });

  it("should clear sonar credentials via updateSonarConfig when null", () => {
    // given
    const service = new StubAuthenticationService();
    service.setSonarToken("old-tok");
    service.setSonarType("cloud");
    const { result } = renderHook(() => useAuthentication(service));

    // when
    act(() => {
      result.current.updateSonarConfig(null);
    });

    // then
    expect(result.current.sonarToken).toBeNull();
    expect(result.current.sonarType).toBeNull();
    expect(result.current.sonarUrl).toBeNull();
  });

  it("should set new wakaTime token via updateWakaTimeToken", () => {
    // given
    const service = new StubAuthenticationService();
    const { result } = renderHook(() => useAuthentication(service));

    // when
    act(() => {
      result.current.updateWakaTimeToken("new-waka");
    });

    // then
    expect(result.current.wakaTimeToken).toBe("new-waka");
  });

  it("should clear wakaTime token via updateWakaTimeToken when null", () => {
    // given
    const service = new StubAuthenticationService();
    service.setWakaTimeToken("old");
    const { result } = renderHook(() => useAuthentication(service));

    // when
    act(() => {
      result.current.updateWakaTimeToken(null);
    });

    // then
    expect(result.current.wakaTimeToken).toBeNull();
  });

  it("should validate stored sonarType (only cloud or qube)", () => {
    // given
    const service = new StubAuthenticationService();
    service.setSonarType("invalid-type");

    // when
    const { result } = renderHook(() => useAuthentication(service));

    // then
    expect(result.current.sonarType).toBeNull();
  });

  it("should validate stored platform (only github or azure-devops)", () => {
    // given
    const service = new StubAuthenticationService();
    service.setPlatform("bitbucket");

    // when
    const { result } = renderHook(() => useAuthentication(service));

    // then
    expect(result.current.platform).toBeNull();
  });
});
