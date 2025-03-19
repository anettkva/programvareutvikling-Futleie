import { test, expect } from "@playwright/test";

// Hjelpefunksjon for unike annonsenavn
function generateUniqueName(prefix: string): string {
    const randomString = Math.random().toString(36).substring(2, 8);
    return `${prefix}_${randomString}`;
}

test.describe("Ad Creation - Image Upload", () => {
    // Hjelpefunksjon for innlogging før hver test
    async function loginUser(page) {
        await page.goto("/login");
        await page.getByLabel("Brukernavn").fill("testuser");
        await page.getByLabel("Passord").fill("testpass");
        await page.getByRole("button", { name: "Logg inn" }).click();
        await page.waitForURL("/gallery");
    }

    test.beforeEach(async ({ page }) => {
        // Logg inn og naviger til annonseopprettelse
        await loginUser(page);
        await page.goto("/create-ad");
        await expect(page).toHaveURL("/create-ad");
    });

    test("creates ad with single image upload", async ({ page }) => {
        // Fyll ut påkrevde felt
        const uniqueName = generateUniqueName("Test Item");
        await page.getByLabel("Title").fill(uniqueName);
        await page
            .getByLabel("Description")
            .fill("This is a test item description");

        // Last opp ett bilde
        await page.setInputFiles('input[type="file"]', {
            name: "test-image.jpg",
            mimeType: "image/jpeg",
            buffer: Buffer.from("fake-image-content"),
        });

        // Send skjema
        await page.getByRole("button", { name: "Upload Ad" }).click();

        // Burde omdirigeres til forsiden etter vellykket innsending
        await page.waitForURL("/");

        // Finn og klikk på den opprettede annonsen
        await page.getByText(uniqueName).click();

        // Klikk på sletteknappen
        await page.getByRole("button", { name: "Slett annonse" }).click();

        // Verifiser at vi er tilbake på forsiden
        await page.waitForURL("/");
    });

    test("creates ad with multiple image upload", async ({ page }) => {
        // Fyll ut påkrevde felt
        const uniqueMultiName = generateUniqueName("Multi-Image Item");
        await page.getByLabel("Title").fill(uniqueMultiName);
        await page.getByLabel("Description").fill("Item with multiple images");

        // Opprett flere testfiler
        const testFiles = [
            {
                name: "image1.jpg",
                mimeType: "image/jpeg",
                buffer: Buffer.from("fake-image-1"),
            },
            {
                name: "image2.jpg",
                mimeType: "image/jpeg",
                buffer: Buffer.from("fake-image-2"),
            },
        ];

        // Last opp flere bilder
        await page.setInputFiles('input[type="file"]', testFiles);

        // Send skjema
        await page.getByRole("button", { name: "Upload Ad" }).click();

        // Burde omdirigeres til forsiden etter vellykket innsending
        await page.waitForURL("/");

        // Finn og klikk på den opprettede annonsen
        await page.getByText("Multi-Image Item").click();

        // Klikk på sletteknappen
        await page.getByRole("button", { name: "Slett annonse" }).click();

        // Verifiser at vi er tilbake på forsiden
        await page.waitForURL("/");
    });

    test("validates required fields", async ({ page }) => {
        // Prøv å sende skjema uten å fylle ut påkrevde felt
        await page.getByRole("button", { name: "Upload Ad" }).click();

        // Sjekk valideringsmeldinger
        const titleError = page.getByText("Title is required");
        const descriptionError = page.getByText("Description is required");

        await expect(titleError).toBeVisible();
        await expect(descriptionError).toBeVisible();
    });

    test("validates image file type", async ({ page }) => {
        // Fyll ut påkrevde felt
        await page.getByLabel("Title").fill("Test Item");
        await page.getByLabel("Description").fill("This is a test item");

        // Prøv å laste opp ugyldig filtype
        await page.setInputFiles('input[type="file"]', {
            name: "invalid.txt",
            mimeType: "text/plain",
            buffer: Buffer.from("not-an-image"),
        });

        // Send skjema
        await page.getByRole("button", { name: "Upload Ad" }).click();

        // Burde ikke omdirigeres på grunn av ugyldig fil
        await expect(page).toHaveURL("/create-ad");
    });
});
