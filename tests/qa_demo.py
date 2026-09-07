#!/usr/bin/env python3

from pathlib import Path

from playwright.sync_api import sync_playwright


BASE_URL = "http://127.0.0.1:4317/"
OUTPUT = Path("/tmp/star-particle-fx-qa")
SLUGS = [
    "pattern-convergence", "stellar-links", "galaxy-vortex", "black-hole-collapse",
    "supernova-burst", "warp-transit", "gravity-lensing", "nebula-breathing",
    "orbital-system", "stardust-descent", "celestial-fold", "stellar-division",
    "stellar-freeze", "stellar-rivers", "chromatic-migration", "wave-propagation",
    "flock-migration", "time-reversal", "negative-space-reveal", "planet-birth",
    "recursive-zoom",
]


def canvas_metrics(page):
    return page.locator("#particle-field").evaluate(
        """canvas => {
          const ctx = canvas.getContext('2d');
          const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
          let count = 0, sum = 0, sumSquares = 0, bright = 0, clipped = 0;
          for (let y = 0; y < canvas.height; y += 12) {
            for (let x = 0; x < canvas.width; x += 12) {
              const i = (y * canvas.width + x) * 4;
              const value = (data[i] + data[i + 1] + data[i + 2]) / 3;
              count += 1; sum += value; sumSquares += value * value;
              if (value > 35) bright += 1;
              if (value > 248) clipped += 1;
            }
          }
          const mean = sum / count;
          return { mean, variance: sumSquares / count - mean * mean, brightRatio: bright / count, clippedRatio: clipped / count };
        }"""
    )


OUTPUT.mkdir(parents=True, exist_ok=True)

with sync_playwright() as playwright:
    browser = playwright.chromium.launch(headless=True)
    desktop = browser.new_context(viewport={"width": 960, "height": 540})
    page = desktop.new_page()
    errors = []
    page.on("console", lambda message: errors.append(message.text) if message.type == "error" else None)
    page.goto(BASE_URL, wait_until="networkidle")

    assert page.locator("#effect-nav button").count() == 21
    assert page.locator("#particle-field").is_visible()

    for index, slug in enumerate(SLUGS):
        page.goto(f"{BASE_URL}?capture=1#{slug}", wait_until="networkidle")
        page.wait_for_timeout(1400)
        assert page.locator("#effect-count").text_content().startswith(f"{index + 1:02d}")
        metrics = canvas_metrics(page)
        page.screenshot(path=str(OUTPUT / f"{index + 1:02d}-{slug}.png"))
        assert metrics["variance"] > 6, (slug, metrics)
        assert metrics["brightRatio"] > 0.0005, (slug, metrics)
        assert metrics["clippedRatio"] < 0.025, (slug, metrics)

    assert not errors, errors
    desktop.close()

    mobile = browser.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2)
    phone = mobile.new_page()
    phone.goto(f"{BASE_URL}#negative-space-reveal", wait_until="networkidle")
    phone.wait_for_timeout(900)
    title = phone.locator("#effect-name-zh").bounding_box()
    controls = phone.locator(".controls").bounding_box()
    assert title and title["x"] >= 0 and title["x"] + title["width"] <= 390
    assert controls and controls["x"] >= 0 and controls["x"] + controls["width"] <= 390
    phone.screenshot(path=str(OUTPUT / "mobile.png"))
    mobile.close()
    browser.close()

print("StarParticleFX QA passed: 21 effects and mobile layout.")
