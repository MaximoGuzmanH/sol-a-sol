import { expect, test } from "@playwright/test";

test("la portada ofrece Niños y anuncia los demás grupos", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: /Niños/ })).toBeVisible();
  await expect(page.getByText("Próximamente")).toHaveCount(2);
});

test("un niño completa una lección y ve su avance al volver", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: /Niños/ }).click();
  await expect(page).toHaveURL(/\/ninos$/);

  await page.getByRole("link", { name: /^Ahorrar/ }).click();
  await page.getByRole("link", { name: /El chanchito de Mateo/ }).click();

  await page.getByRole("button", { name: "Gastar los S/ 2 en golosinas" }).click();
  await expect(page.getByText(/¡Casi!/)).toBeVisible();

  await page.getByRole("button", { name: "Guardar S/ 1 en su chanchito y usar S/ 1 en el recreo" }).click();
  await expect(page.getByText(/¡Muy bien!/)).toBeVisible();

  await page.getByRole("navigation", { name: "Ruta" }).getByRole("link").click();
  await expect(page.getByRole("link", { name: /El chanchito de Mateo.*\(completada\)/ })).toBeVisible();

  await page.reload();
  await expect(page.getByRole("link", { name: /El chanchito de Mateo.*\(completada\)/ })).toBeVisible();
});
