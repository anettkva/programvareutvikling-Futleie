// sjekker omdirigering til innlogging når ikke autentisert
// sjekker at innloggingssiden har riktige elementer
// sjekker direkte tilgang til innloggingssiden

import { test, expect } from "@playwright/test";

test.describe("Authentication Flow", () => {
    // Hjelpefunksjon for innloggingssiden
    async function goToLoginPage(page) {
        await page.goto("/login");
        await page.waitForLoadState("networkidle");
    }
    test("redirects to login when not authenticated", async ({ page }) => {
        // Start fra gallerisiden
        await page.goto("/gallery");

        // Sjekk omdirigering til innlogging
        await page.waitForURL("/login");

        // Vent på full sidelasting
        await page.waitForLoadState("networkidle");

        // Verifiser synlige elementer
        await expect(
            page.locator(".text-2xl").filter({ hasText: "Logg inn" })
        ).toBeVisible();
        await expect(page.getByLabel("Brukernavn")).toBeVisible();
        await expect(page.getByLabel("Passord")).toBeVisible();
        await expect(
            page.getByRole("button", { name: "Logg inn" })
        ).toBeVisible();
    });

    test("login page is accessible directly", async ({ page }) => {
        // Gå direkte til innloggingssiden
        await page.goto("/login");

        // Bli på innloggingssiden
        await expect(page).toHaveURL("/login");
    });

    test.describe("Login Form Validation", () => {
        test.beforeEach(async ({ page }) => {
            await goToLoginPage(page);
        });

        test("viser valideringsfeil for tomt brukernavn", async ({ page }) => {
            // Fyll kun passord
            await page.getByLabel("Passord").fill("somepassword");
            await page.getByRole("button", { name: "Logg inn" }).click();

            // Verifiser at brukernavn er påkrevd
            const usernameInput = page.getByLabel("Brukernavn");
            await expect(usernameInput).toHaveAttribute("required", "");
        });

        test("viser valideringsfeil for tomt passord", async ({ page }) => {
            // Fyll kun brukernavn
            await page.getByLabel("Brukernavn").fill("someuser");
            await page.getByRole("button", { name: "Logg inn" }).click();

            // Verifiser at passord er påkrevd
            const passwordInput = page.getByLabel("Passord");
            await expect(passwordInput).toHaveAttribute("required", "");
        });

        test("viser feilmelding for ugyldige legitimasjoner", async ({
            page,
        }) => {
            // Lag et løfte som løses når dialogen vises
            const dialogPromise = new Promise((resolve) => {
                page.on("dialog", async (dialog) => {
                    expect(dialog.message()).toBe(
                        "Feil brukernavn eller passord"
                    );
                    await dialog.accept();
                    resolve(true);
                });
            });

            // Fyll inn ugyldige legitimasjoner
            await page.getByLabel("Brukernavn").fill("invaliduser");
            await page.getByLabel("Passord").fill("invalidpass");

            // Send inn skjema
            await page.getByRole("button", { name: "Logg inn" }).click();

            // Vent på at dialogen vises og verifiser at den gjorde det
            const dialogAppeared = await dialogPromise;
            expect(dialogAppeared).toBe(true);
        });
    });

    test.describe("Successful Login", () => {
        test.beforeEach(async ({ page }) => {
            await goToLoginPage(page);
        });

        test("vellykket innlogging omdirigerer til galleri og setter cookie", async ({
            page,
        }) => {
            // Fyll inn gyldige legitimasjoner
            await page.getByLabel("Brukernavn").fill("testuser"); // Erstatt med faktisk testbruker
            await page.getByLabel("Passord").fill("testpass"); // Erstatt med faktisk testpassord

            // Send inn skjema
            await page.getByRole("button", { name: "Logg inn" }).click();

            // Bli omdirigert til galleri
            await page.waitForURL("/gallery");

            // Verifiser at cookie er satt
            const cookies = await page.context().cookies();
            const userCookie = cookies.find((cookie) => cookie.name === "user");
            expect(userCookie).toBeTruthy();
            expect(userCookie?.domain).toBe("localhost");

            // Verifiser at cookie-verdi eksisterer
            expect(userCookie?.value).toBeTruthy();

            try {
                // Dekod URL-kodet cookie-verdi før parsing
                const decodedValue = decodeURIComponent(
                    userCookie?.value || ""
                );
                const userData = JSON.parse(decodedValue);
                expect(userData).toHaveProperty("username");
                expect(userData).toHaveProperty("id");
            } catch (e) {
                throw new Error(
                    `Kunne ikke parse brukercookie: ${userCookie?.value}. Feil: ${e.message}`
                );
            }
        });

        test("innlogget bruker kan få tilgang til beskyttede ruter", async ({
            page,
        }) => {
            // Først logg inn
            await page.getByLabel("Brukernavn").fill("testuser"); // Erstatt med faktisk testbruker
            await page.getByLabel("Passord").fill("testpass"); // Erstatt med faktisk testpassord
            await page.getByRole("button", { name: "Logg inn" }).click();
            await page.waitForURL("/gallery");

            // Prøv å få tilgang til andre beskyttede ruter
            await page.goto("/gallery");
            await expect(page).toHaveURL("/gallery");

            await page.goto("/create-ad");
            await expect(page).toHaveURL("/create-ad");
        });
    });

    test.describe("Logout Functionality", () => {
        test.beforeEach(async ({ page }) => {
            // Først sørg for at vi er logget inn
            await goToLoginPage(page);
            await page.getByLabel("Brukernavn").fill("testuser");
            await page.getByLabel("Passord").fill("testpass");
            await page.getByRole("button", { name: "Logg inn" }).click();
            await page.waitForURL("/gallery");
        });

        test("logout fjerner brukercookie og omdirigerer til innlogging", async ({
            page,
        }) => {
            // Sørg for at vi er på en side med logout-knapp
            await expect(
                page.getByRole("button", { name: "Logg ut" })
            ).toBeVisible();

            // Klikk logout-knappen og vent på at navigasjonen starter
            await Promise.all([
                page.waitForURL("/login"),
                page.getByRole("button", { name: "Logg ut" }).click(),
            ]);

            // Vent på at eventuelle ventende nettverksforespørsler fullføres
            await page.waitForLoadState("networkidle");

            // Verifiser at cookie er fjernet - prøv noen ganger om nødvendig
            await expect(async () => {
                const cookies = await page.context().cookies();
                const userCookie = cookies.find(
                    (cookie) => cookie.name === "user"
                );
                expect(userCookie).toBeUndefined();
            }).toPass({ timeout: 5000 });
        });

        test("kan ikke få tilgang til beskyttede ruter etter logout", async ({
            page,
        }) => {
            // Sørg for at vi er på en side med logout-knapp
            await expect(
                page.getByRole("button", { name: "Logg ut" })
            ).toBeVisible();

            // Først logg ut med riktige ventebetingelser
            await Promise.all([
                page.waitForURL("/login"),
                page.getByRole("button", { name: "Logg ut" }).click(),
            ]);

            // Vent på eventuelle ventende nettverksforespørsler
            await page.waitForLoadState("networkidle");

            // Prøv å få tilgang til beskyttede ruter med riktige ventebetingelser
            await Promise.all([
                page.waitForURL("/login"),
                page.goto("/gallery"),
            ]);

            await Promise.all([
                page.waitForURL("/login"),
                page.goto("/create-ad"),
            ]);
        });
    });

    test.describe("Session Persistence", () => {
        test.beforeEach(async ({ page }) => {
            // Først sørg for at vi er logget inn
            await goToLoginPage(page);
            await page.getByLabel("Brukernavn").fill("testuser");
            await page.getByLabel("Passord").fill("testpass");
            await page.getByRole("button", { name: "Logg inn" }).click();
            await page.waitForURL("/gallery");
        });

        test("innlogging vedvarer etter sideoppdatering", async ({ page }) => {
            // Oppdater gallerisiden
            await page.reload();
            await page.waitForLoadState("networkidle");

            // Bli på gallerisiden
            await expect(page).toHaveURL("/gallery");

            // Verifiser at brukercookie fortsatt eksisterer
            const cookies = await page.context().cookies();
            const userCookie = cookies.find((cookie) => cookie.name === "user");
            expect(userCookie).toBeTruthy();
        });

        test("innlogging vedvarer ved navigering mellom beskyttede ruter", async ({
            page,
        }) => {
            // Naviger til create-ad siden
            await page.goto("/create-ad");
            await expect(page).toHaveURL("/create-ad");

            // Naviger tilbake til galleri
            await page.goto("/gallery");
            await expect(page).toHaveURL("/gallery");

            // Verifiser at brukercookie fortsatt eksisterer
            const cookies = await page.context().cookies();
            const userCookie = cookies.find((cookie) => cookie.name === "user");
            expect(userCookie).toBeTruthy();
        });

        test("innlogging vedvarer i en ny fane", async ({ context }) => {
            // Opprett en ny side (fane)
            const newPage = await context.newPage();

            // Prøv å få tilgang til en beskyttet rute i den nye fanen
            await newPage.goto("/gallery");
            await expect(newPage).toHaveURL("/gallery");

            // Verifiser at brukercookie eksisterer i den nye fanen
            const cookies = await newPage.context().cookies();
            const userCookie = cookies.find((cookie) => cookie.name === "user");
            expect(userCookie).toBeTruthy();

            // Rydd opp
            await newPage.close();
        });
    });
});
