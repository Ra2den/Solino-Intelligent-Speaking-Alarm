import test from "node:test";
import assert from "node:assert/strict";
import { getNextTransition, getPhase } from "../src/utils/phase.util.js";

const sunrise = new Date("2026-05-01T06:00:00.000Z").getTime();
const sunset = new Date("2026-05-01T18:00:00.000Z").getTime();
const transition = 30 * 60 * 1000;

test("getPhase returns Night before the sunrise transition starts", () => {
  assert.equal(
    getPhase(sunrise - transition - 1, sunrise, sunset, transition),
    "Night",
  );
});

test("getPhase returns Sunrise at the sunrise transition boundaries", () => {
  assert.equal(
    getPhase(sunrise - transition, sunrise, sunset, transition),
    "Sunrise",
  );
  assert.equal(
    getPhase(sunrise + transition, sunrise, sunset, transition),
    "Sunrise",
  );
});

test("getPhase returns Day after sunrise transition and before sunset transition", () => {
  assert.equal(
    getPhase(sunrise + transition + 1, sunrise, sunset, transition),
    "Day",
  );
  assert.equal(
    getPhase(sunset - transition - 1, sunrise, sunset, transition),
    "Day",
  );
});

test("getPhase returns Sunset at the sunset transition boundaries", () => {
  assert.equal(
    getPhase(sunset - transition, sunrise, sunset, transition),
    "Sunset",
  );
  assert.equal(
    getPhase(sunset + transition, sunrise, sunset, transition),
    "Sunset",
  );
});

test("getPhase returns Night after the sunset transition ends", () => {
  assert.equal(
    getPhase(sunset + transition + 1, sunrise, sunset, transition),
    "Night",
  );
});

test("getNextTransition returns the next future transition point", () => {
  assert.equal(
    getNextTransition(sunrise - transition - 1, sunrise, sunset, transition),
    sunrise - transition,
  );
  assert.equal(
    getNextTransition(sunrise, sunrise, sunset, transition),
    sunrise + transition,
  );
  assert.equal(
    getNextTransition(sunset, sunrise, sunset, transition),
    sunset + transition,
  );
});

test("getNextTransition returns undefined after the last transition of the day", () => {
  assert.equal(
    getNextTransition(sunset + transition, sunrise, sunset, transition),
    undefined,
  );
});
