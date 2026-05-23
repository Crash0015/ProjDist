import { test, expect } from "@playwright/test";

test("user can register and purchase", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Correo").fill(`demo${Date.now()}@mail.com`);
  await page.getByLabel("Contrasena").fill("password123");
  await page.getByRole("button", { name: "Registrarse" }).click();

  await expect(page.getByText("Eventos disponibles")).toBeVisible();

  const eventCard = page.locator(".card").first();
  await eventCard.click();

  await page.getByLabel("Cantidad").fill("1");
  const [orderResponse] = await Promise.all([
    page.waitForResponse(
      (resp) =>
        resp.url().includes("/orders") &&
        resp.request().method() === "POST"
    ),
    page.getByRole("button", { name: "Comprar" }).click()
  ]);

  if (!orderResponse.ok()) {
    const body = await orderResponse.text();
    throw new Error(`Order failed: ${orderResponse.status()} ${body}`);
  }

  await expect(page.getByText("Confirmacion")).toBeVisible();
  await page
    .getByRole("main")
    .getByRole("button", { name: "Cerrar sesion" })
    .click();
  await expect(page.getByText("Acceso")).toBeVisible();
});
