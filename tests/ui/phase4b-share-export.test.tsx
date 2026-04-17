// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { defaultVehicleConfig } from "@/config/defaults";
import {
  CONFIG_STORAGE_KEY,
  RULE_NOTES_STORAGE_KEY,
  RULE_STATUSES_STORAGE_KEY,
  serializeRuleNotes,
  serializeRuleStatuses,
  serializeVehicleConfig,
} from "@/config/persistence";
import { Phase3MainPage } from "@/components/phase3/Phase3MainPage";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

beforeEach(() => {
  window.localStorage.clear();
  window.history.replaceState({}, "", "/");
});

describe("Phase 4B share and export", () => {
  it("restores config from URL and lets URL override localStorage when present", async () => {
    window.localStorage.setItem(
      CONFIG_STORAGE_KEY,
      serializeVehicleConfig({
        ...defaultVehicleConfig,
        projectName: "Local project",
        frameworkGroup: "L",
      }),
    );

    window.history.replaceState(
      {},
      "",
      "/?projectName=URL+project&frameworkGroup=MN&targetCountries=DE,FR",
    );

    render(<Phase3MainPage />);

    await waitFor(() => {
      expect(screen.getByRole("textbox", { name: /project name/i })).toHaveValue(
        "URL project",
      );
    });

    expect(screen.getByRole("combobox", { name: /framework group/i })).toHaveValue(
      "MN",
    );
  });

  it("syncs core VehicleConfig fields to URL query params when edited", async () => {
    render(<Phase3MainPage />);

    fireEvent.change(screen.getByRole("textbox", { name: /project name/i }), {
      target: { value: "Shared project" },
    });
    fireEvent.change(screen.getByRole("combobox", { name: /framework group/i }), {
      target: { value: "MN" },
    });

    await waitFor(() => {
      const params = new URLSearchParams(window.location.search);
      expect(params.get("projectName")).toBe("Shared project");
      expect(params.get("frameworkGroup")).toBe("MN");
    });
  });

  it("exports the current evaluated view as JSON and CSV blobs", async () => {
    window.localStorage.setItem(
      RULE_STATUSES_STORAGE_KEY,
      serializeRuleStatuses({
        "REG-PV-001": "done",
      }),
    );
    window.localStorage.setItem(
      RULE_NOTES_STORAGE_KEY,
      serializeRuleNotes({
        "REG-PV-001": "Review completed",
      }),
    );

    const createObjectURL = vi
      .spyOn(URL, "createObjectURL")
      .mockImplementation((blob) => {
        return `blob:${(blob as Blob).type}`;
      });
    const revokeObjectURL = vi
      .spyOn(URL, "revokeObjectURL")
      .mockImplementation(() => {});
    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});

    render(<Phase3MainPage />);

    fireEvent.click(screen.getByRole("button", { name: /export json/i }));
    fireEvent.click(screen.getByRole("button", { name: /export csv/i }));

    await waitFor(() => {
      expect(createObjectURL).toHaveBeenCalledTimes(2);
      expect(clickSpy).toHaveBeenCalledTimes(2);
      expect(revokeObjectURL).toHaveBeenCalledTimes(2);
    });

    const [jsonBlob, csvBlob] = createObjectURL.mock.calls.map(
      (call) => call[0] as Blob,
    );

    expect(JSON.parse(await jsonBlob.text())).toMatchObject({
      config: expect.any(Object),
      evaluatedResults: expect.any(Array),
      userRuleStatuses: { "REG-PV-001": "done" },
      userRuleNotes: { "REG-PV-001": "Review completed" },
    });

    expect(await csvBlob.text()).toContain("rule_id,title,applicability");
    expect(await csvBlob.text()).toContain("REG-PV-001");
    expect(await csvBlob.text()).toContain("Review completed");
  });
});
