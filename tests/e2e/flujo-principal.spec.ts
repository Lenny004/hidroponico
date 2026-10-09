import { expect, test } from "@playwright/test";

test.describe("flujo operativo de Hidropónico", () => {
  test("permite plantar un cultivo y consultar su ficha", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Catálogo" })).toBeVisible();

    await page.getByRole("button", { name: /Tomate/ }).click();

    await expect(page.getByRole("heading", { name: "Tomate" })).toBeVisible();
    await expect(page.getByText("Requerimientos de cultivo")).toBeVisible();
    await expect(page.getByRole("contentinfo").getByText(/Tomate colocado/)).toBeVisible();
  });

  test("muestra alertas al guardar una medición fuera de rango", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /Tomate/ }).click();

    await expect(page.getByRole("heading", { name: "Operación real" })).toBeVisible();
    await page.getByText("Registrar medición").click();
    await page.getByRole("spinbutton", { name: "pH" }).fill("4.5");
    await page.getByRole("button", { name: /Guardar medición/ }).click();

    await expect(page.getByText("pH fuera de rango")).toBeVisible();
    await expect(page.getByText(/Mediciones registradas \(1\)/)).toBeVisible();
  });

  test("conserva un contrato visual para modo claro y oscuro", async ({ page }, testInfo) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Catálogo" })).toBeVisible();
    await expect(page).toHaveScreenshot(`inicio-${testInfo.project.name}.png`, {
      animations: "disabled",
      caret: "hide",
      maxDiffPixels: 1500,
    });
  });
});
