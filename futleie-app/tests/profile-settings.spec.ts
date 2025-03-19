import { test, expect } from "@playwright/test";

const DEFAULT_USERNAME = "testuser";
const DEFAULT_EMAIL = "testuser@example.com";
const DEFAULT_PASSWORD = "testpass";

test.describe("Profile Settings", () => {
    // Hjelpefunksjon for innlogging før hver test
    async function loginUser(page) {
        await page.goto("/login");
        await page.getByLabel("Brukernavn").fill(DEFAULT_USERNAME);
        await page.getByLabel("Passord").fill(DEFAULT_PASSWORD);
        await page.getByRole("button", { name: "Logg inn" }).click();
        await page.waitForURL("/gallery");
    }

    test.beforeEach(async ({ page }) => {
        // Logg inn og naviger til profilsiden
        await loginUser(page);
        await page.goto("/profile");
        await expect(page).toHaveURL("/profile");

        // Vent på innlasting av data
        await page.waitForLoadState("networkidle");

        // Verifiser sidestruktur
        await expect(
            page.getByRole("heading", { name: "Mine annonser" })
        ).toBeVisible();
        await expect(
            page.locator("div.text-2xl").getByText("Profil", { exact: true })
        ).toBeVisible();
        await expect(
            page.getByText("Her kan du se og endre profildetaljer", {
                exact: true,
            })
        ).toBeVisible();

        // Verifiser at e-postfelt er synlig
        await expect(page.locator('input[name="email"]')).toBeVisible();
    });

    test("updates password", async ({ page }) => {
        const newPassword = "newpass";

        // Fyll inn nytt passord og bekreftelse
        const newPasswordInput = page.locator('input[type="password"]').first();
        const confirmPasswordInput = page
            .locator('input[type="password"]')
            .nth(1);
        await newPasswordInput.fill(newPassword);
        await confirmPasswordInput.fill(newPassword);

        // Oppdater passord
        await page.getByRole("button", { name: "Oppdater" }).click();

        // Vent på oppdatering og sideoppdatering
        await page.waitForLoadState("networkidle");

        // Verifiser at passordfeltene er tømt etter oppdatering
        await expect(newPasswordInput).toHaveValue("");
        await expect(confirmPasswordInput).toHaveValue("");

        // Logg ut via sideknapp
        await page.getByText("Logg ut").click();
        await page.waitForURL("/login");

        // Logg inn med nytt passord
        await page.getByLabel("Brukernavn").fill(DEFAULT_USERNAME);
        await page.getByLabel("Passord").fill(newPassword);
        await page.getByRole("button", { name: "Logg inn" }).click();
        await page.waitForURL("/gallery");

        // Naviger til profil for å tilbakestille passord
        await page.goto("/profile");
        await page.waitForLoadState("networkidle");

        // Tilbakestill til standardpassord
        await newPasswordInput.fill(DEFAULT_PASSWORD);
        await confirmPasswordInput.fill(DEFAULT_PASSWORD);
        await page.getByRole("button", { name: "Oppdater" }).click();

        // Vent på oppdatering
        await page.waitForLoadState("networkidle");

        // Verifiser at feltene er tømt
        await expect(newPasswordInput).toHaveValue("");
        await expect(confirmPasswordInput).toHaveValue("");

        // Logg ut
        await page.getByText("Logg ut").click();
        await page.waitForURL("/login");

        // Verifiser innlogging med standardpassord
        await page.getByLabel("Brukernavn").fill(DEFAULT_USERNAME);
        await page.getByLabel("Passord").fill(DEFAULT_PASSWORD);
        await page.getByRole("button", { name: "Logg inn" }).click();
        await page.waitForURL("/gallery");
    });

    test("updates email", async ({ page }) => {
        const newEmail = `newemail_${Date.now()}@test.com`;

        // Hent opprinnelig e-post
        const emailInput = page.locator('input[name="email"]');
        await expect(emailInput).toHaveValue(DEFAULT_EMAIL);

        // Oppdater e-post
        await emailInput.fill(newEmail);
        await page.getByRole("button", { name: "Oppdater" }).click();

        // Vent på oppdatering
        await page.waitForLoadState("networkidle");
        await expect(emailInput).toHaveValue(newEmail);

        // Tilbakestill til standard e-post
        await emailInput.fill(DEFAULT_EMAIL);
        await page.getByRole("button", { name: "Oppdater" }).click();
        await page.waitForLoadState("networkidle");
        await expect(emailInput).toHaveValue(DEFAULT_EMAIL);
    });
});
