const BASE_URL = "http://localhost:5000/api";

async function runTest() {
    try {
        console.log("--- STARTING API TEST ---");

        // 1. Register/Login
        const email = "test_api_" + Date.now() + "@test.com";
        const password = "password123";

        console.log(`1. Registering ${email}...`);
        const regRes = await fetch(`${BASE_URL}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });
        console.log(`   Register Status: ${regRes.status}`);

        console.log("2. Logging in...");
        const loginRes = await fetch(`${BASE_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        if (!loginRes.ok) throw new Error("Login failed");

        const loginData = await loginRes.json();
        const token = loginData.token;
        console.log(`   Login Success. Token: ${token.substring(0, 10)}...`);

        // 3. Test Bank Setup (The Crash Point)
        console.log("3. Testing Setup (Crash Check)...");
        const setupPayload = {
            accountNumber: "1234 5678 9012", // With spaces
            balance: "50,000"                // With comma
        };

        const setupRes = await fetch(`${BASE_URL}/bank/setup`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(setupPayload)
        });

        console.log(`   Setup Status: ${setupRes.status}`);
        const setupData = await setupRes.text(); // Get raw text in case of HTML error
        console.log(`   Setup Response: ${setupData}`);

    } catch (err) {
        console.error("TEST FAILED:", err);
    }
}

runTest();
